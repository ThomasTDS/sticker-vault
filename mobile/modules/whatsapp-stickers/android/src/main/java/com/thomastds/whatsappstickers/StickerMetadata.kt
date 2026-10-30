package com.thomastds.whatsappstickers

import org.json.JSONObject

// Reads the metadata WhatsApp stores inside a sticker file. Works on the file bytes only, so it is unit tested
// without a device.
object StickerMetadata {
  // WhatsApp stickers carry, in the WebP EXIF chunk, a JSON with the emojis chosen by the pack creator:
  // {"sticker-pack-id": "...", "emojis": ["😂"]}. Stickers without it return an empty list.
  fun emojis(bytes: ByteArray): List<String> {
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
  internal fun findChunk(bytes: ByteArray, id: String): ByteArray? {
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
