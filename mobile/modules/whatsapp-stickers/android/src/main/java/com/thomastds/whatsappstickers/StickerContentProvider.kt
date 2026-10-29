package com.thomastds.whatsappstickers

import android.content.ContentProvider
import android.content.ContentValues
import android.content.UriMatcher
import android.content.res.AssetFileDescriptor
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import java.io.File
import java.io.FileNotFoundException

// Implements the content provider contract that WhatsApp uses to read third-party sticker packs.
class StickerContentProvider : ContentProvider() {
  private lateinit var authority: String
  private val matcher = UriMatcher(UriMatcher.NO_MATCH)

  override fun onCreate(): Boolean {
    authority = "${context!!.packageName}.stickercontentprovider"
    matcher.addURI(authority, METADATA, METADATA_CODE)
    matcher.addURI(authority, "$METADATA/*", METADATA_SINGLE_PACK_CODE)
    matcher.addURI(authority, "$STICKERS/*", STICKERS_CODE)
    matcher.addURI(authority, "$STICKERS_ASSET/*/*", STICKERS_ASSET_CODE)
    return true
  }

  override fun query(
    uri: Uri,
    projection: Array<out String>?,
    selection: String?,
    selectionArgs: Array<out String>?,
    sortOrder: String?,
  ): Cursor {
    val packs = StickerPackStore.readPacks(context!!)
    return when (matcher.match(uri)) {
      METADATA_CODE -> packCursor(packs)
      METADATA_SINGLE_PACK_CODE -> packCursor(packs.filter { it.identifier == uri.lastPathSegment })
      STICKERS_CODE -> stickerCursor(packs.firstOrNull { it.identifier == uri.lastPathSegment })
      else -> throw IllegalArgumentException("Unknown URI: $uri")
    }
  }

  override fun openAssetFile(uri: Uri, mode: String): AssetFileDescriptor =
    AssetFileDescriptor(openFile(uri, mode), 0, AssetFileDescriptor.UNKNOWN_LENGTH)

  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor {
    if (matcher.match(uri) != STICKERS_ASSET_CODE) {
      throw IllegalArgumentException("Unknown URI: $uri")
    }
    val segments = uri.pathSegments
    val identifier = segments[segments.size - 2]
    val fileName = segments.last()
    val pack = StickerPackStore.readPacks(context!!).firstOrNull { it.identifier == identifier }
      ?: throw FileNotFoundException("Pack not found: $identifier")
    val isKnownFile = fileName == pack.trayImageFile || pack.stickers.any { it.imageFile == fileName }
    if (!isKnownFile) {
      throw FileNotFoundException("File not found: $fileName")
    }
    val file = File(StickerPackStore.packDirectory(context!!, identifier), fileName)
    return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
  }

  override fun getType(uri: Uri): String = when (matcher.match(uri)) {
    METADATA_CODE -> "vnd.android.cursor.dir/vnd.$authority.$METADATA"
    METADATA_SINGLE_PACK_CODE -> "vnd.android.cursor.item/vnd.$authority.$METADATA"
    STICKERS_CODE -> "vnd.android.cursor.dir/vnd.$authority.$STICKERS"
    STICKERS_ASSET_CODE -> if (uri.lastPathSegment!!.endsWith(".png")) "image/png" else "image/webp"
    else -> throw IllegalArgumentException("Unknown URI: $uri")
  }

  private fun packCursor(packs: List<StickerPackEntry>): Cursor {
    val cursor = MatrixCursor(PACK_COLUMNS)
    packs.forEach { pack ->
      cursor.addRow(
        arrayOf<Any?>(
          pack.identifier,
          pack.name,
          pack.publisher,
          pack.trayImageFile,
          "",
          "",
          "",
          "",
          "",
          "",
          pack.imageDataVersion,
          if (pack.avoidCache) 1 else 0,
          if (pack.animated) 1 else 0,
        ),
      )
    }
    return cursor
  }

  private fun stickerCursor(pack: StickerPackEntry?): Cursor {
    val cursor = MatrixCursor(arrayOf(STICKER_FILE_NAME, STICKER_EMOJI))
    pack?.stickers?.forEach { cursor.addRow(arrayOf(it.imageFile, it.emojis.joinToString(","))) }
    return cursor
  }

  override fun insert(uri: Uri, values: ContentValues?): Uri? = throw UnsupportedOperationException()

  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int =
    throw UnsupportedOperationException()

  override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int =
    throw UnsupportedOperationException()

  companion object {
    private const val METADATA = "metadata"
    private const val STICKERS = "stickers"
    private const val STICKERS_ASSET = "stickers_asset"

    private const val METADATA_CODE = 1
    private const val METADATA_SINGLE_PACK_CODE = 2
    private const val STICKERS_CODE = 3
    private const val STICKERS_ASSET_CODE = 4

    private const val STICKER_FILE_NAME = "sticker_file_name"
    private const val STICKER_EMOJI = "sticker_emoji"

    private val PACK_COLUMNS = arrayOf(
      "sticker_pack_identifier",
      "sticker_pack_name",
      "sticker_pack_publisher",
      "sticker_pack_icon",
      "android_play_store_link",
      "ios_app_download_link",
      "sticker_pack_publisher_email",
      "sticker_pack_publisher_website",
      "sticker_pack_privacy_policy_website",
      "sticker_pack_license_agreement_website",
      "image_data_version",
      "whatsapp_will_not_cache_stickers",
      "animated_sticker_pack",
    )
  }
}
