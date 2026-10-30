package com.thomastds.whatsappstickers

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import org.json.JSONObject

// Reads the stickers WhatsApp saves when they arrive in a chat. The folder is granted once by the user
// through the system folder picker (Storage Access Framework); apps cannot read it directly.
object ReceivedStickers {
  private const val STORAGE_AUTHORITY = "com.android.externalstorage.documents"
  private const val STICKERS_FOLDER = "primary:Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Stickers"

  data class ReceivedSticker(val uri: String, val modifiedAt: Long)

  // Opens the folder picker already inside WhatsApp's sticker folder, so the user only confirms it.
  fun pickFolderIntent(): Intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
    putExtra(
      DocumentsContract.EXTRA_INITIAL_URI,
      DocumentsContract.buildDocumentUri(STORAGE_AUTHORITY, STICKERS_FOLDER),
    )
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
  }

  // Keeps the read permission after the app restarts; only the most recent folder is kept.
  fun keepFolder(context: Context, treeUri: Uri) {
    val resolver = context.contentResolver
    resolver.persistedUriPermissions
      .filter { it.uri != treeUri }
      .forEach { resolver.releasePersistableUriPermission(it.uri, Intent.FLAG_GRANT_READ_URI_PERMISSION) }
    resolver.takePersistableUriPermission(treeUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
  }

  fun grantedFolder(context: Context): String? =
    context.contentResolver.persistedUriPermissions
      .filter { it.isReadPermission }
      .maxByOrNull { it.persistedTime }
      ?.uri
      ?.toString()

  // Most recent first. Only the files directly in the folder are listed: WhatsApp keeps received stickers
  // there, and subfolders hold other copies.
  fun list(context: Context, treeUri: String, limit: Int): List<ReceivedSticker> {
    val tree = Uri.parse(treeUri)
    val children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree))
    val columns = arrayOf(
      DocumentsContract.Document.COLUMN_DOCUMENT_ID,
      DocumentsContract.Document.COLUMN_DISPLAY_NAME,
      DocumentsContract.Document.COLUMN_MIME_TYPE,
      DocumentsContract.Document.COLUMN_LAST_MODIFIED,
    )
    val stickers = mutableListOf<ReceivedSticker>()
    context.contentResolver.query(children, columns, null, null, null)?.use { cursor ->
      while (cursor.moveToNext()) {
        val name = cursor.getString(1) ?: continue
        val mimeType = cursor.getString(2)
        if (mimeType == DocumentsContract.Document.MIME_TYPE_DIR || !name.endsWith(".webp", ignoreCase = true)) {
          continue
        }
        val uri = DocumentsContract.buildDocumentUriUsingTree(tree, cursor.getString(0))
        stickers += ReceivedSticker(uri.toString(), cursor.getLong(3))
      }
    }
    return stickers.sortedByDescending { it.modifiedAt }.take(limit)
  }

  // WhatsApp stickers carry, in the WebP EXIF chunk, a JSON with the emojis chosen by the pack creator:
  // {"sticker-pack-id": "...", "emojis": ["😂"]}. Stickers without it return an empty list.
  fun emojis(context: Context, uri: String): List<String> {
    val bytes = context.contentResolver.openInputStream(Uri.parse(uri))?.use { it.readBytes() } ?: return emptyList()
    val exif = findChunk(bytes, "EXIF") ?: return emptyList()
    val start = exif.indexOfFirst { it == '{'.code.toByte() }
    val end = exif.indexOfLast { it == '}'.code.toByte() }
    if (start < 0 || end <= start) {
      return emptyList()
    }
    return try {
      val emojis = JSONObject(String(exif, start, end - start + 1, Charsets.UTF_8)).optJSONArray("emojis")
        ?: return emptyList()
      (0 until emojis.length()).map { emojis.getString(it) }.filter { it.isNotBlank() }
    } catch (_: Exception) {
      emptyList()
    }
  }

  // WebP is a RIFF file: "RIFF", size, "WEBP", then chunks of id (4 bytes), little-endian size and data.
  private fun findChunk(bytes: ByteArray, id: String): ByteArray? {
    if (bytes.size < 12 || String(bytes, 0, 4, Charsets.US_ASCII) != "RIFF" ||
      String(bytes, 8, 4, Charsets.US_ASCII) != "WEBP"
    ) {
      return null
    }
    var offset = 12
    while (offset + 8 <= bytes.size) {
      val chunkId = String(bytes, offset, 4, Charsets.US_ASCII)
      val size = (bytes[offset + 4].toInt() and 0xFF) or
        ((bytes[offset + 5].toInt() and 0xFF) shl 8) or
        ((bytes[offset + 6].toInt() and 0xFF) shl 16) or
        ((bytes[offset + 7].toInt() and 0xFF) shl 24)
      val dataStart = offset + 8
      if (size < 0 || dataStart + size > bytes.size) {
        return null
      }
      if (chunkId == id) {
        return bytes.copyOfRange(dataStart, dataStart + size)
      }
      // Chunks are padded to an even size.
      offset = dataStart + size + (size and 1)
    }
    return null
  }
}
