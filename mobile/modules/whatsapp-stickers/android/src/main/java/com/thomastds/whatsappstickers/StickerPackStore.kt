package com.thomastds.whatsappstickers

import android.content.Context
import org.json.JSONObject
import java.io.File

data class StickerEntry(val imageFile: String, val emojis: List<String>)

data class StickerPackEntry(
  val identifier: String,
  val name: String,
  val publisher: String,
  val trayImageFile: String,
  val imageDataVersion: String,
  val avoidCache: Boolean,
  val animated: Boolean,
  val stickers: List<StickerEntry>,
)

// Reads the packs exported by the JavaScript side to files/stickers/contents.json.
object StickerPackStore {
  private const val ROOT_DIR = "stickers"
  private const val CONTENTS_FILE = "contents.json"

  fun packDirectory(context: Context, identifier: String) = File(File(context.filesDir, ROOT_DIR), identifier)

  fun readPacks(context: Context): List<StickerPackEntry> {
    val file = File(File(context.filesDir, ROOT_DIR), CONTENTS_FILE)
    if (!file.exists()) {
      return emptyList()
    }
    val packs = JSONObject(file.readText()).getJSONArray("sticker_packs")
    return (0 until packs.length()).map { index ->
      val pack = packs.getJSONObject(index)
      val stickers = pack.getJSONArray("stickers")
      StickerPackEntry(
        identifier = pack.getString("identifier"),
        name = pack.getString("name"),
        publisher = pack.getString("publisher"),
        trayImageFile = pack.getString("tray_image_file"),
        imageDataVersion = pack.getString("image_data_version"),
        avoidCache = pack.optBoolean("avoid_cache", false),
        animated = pack.optBoolean("animated_sticker_pack", false),
        stickers = (0 until stickers.length()).map { stickerIndex ->
          val sticker = stickers.getJSONObject(stickerIndex)
          val emojis = sticker.getJSONArray("emojis")
          StickerEntry(
            imageFile = sticker.getString("image_file"),
            emojis = (0 until emojis.length()).map { emojis.getString(it) },
          )
        },
      )
    }
  }
}
