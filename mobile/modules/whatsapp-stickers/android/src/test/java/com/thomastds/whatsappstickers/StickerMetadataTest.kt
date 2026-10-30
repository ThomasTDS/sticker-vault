package com.thomastds.whatsappstickers

import java.io.ByteArrayOutputStream
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class StickerMetadataTest {
  private fun chunk(id: String, data: ByteArray): ByteArray {
    val out = ByteArrayOutputStream()
    out.write(id.toByteArray(Charsets.US_ASCII))
    val size = data.size
    out.write(byteArrayOf(size.toByte(), (size shr 8).toByte(), (size shr 16).toByte(), (size shr 24).toByte()))
    out.write(data)
    if (size % 2 == 1) {
      out.write(0)
    }
    return out.toByteArray()
  }

  private fun webp(vararg chunks: ByteArray): ByteArray {
    val body = chunks.fold(ByteArray(0)) { all, chunk -> all + chunk }
    val size = 4 + body.size
    return "RIFF".toByteArray(Charsets.US_ASCII) +
      byteArrayOf(size.toByte(), (size shr 8).toByte(), (size shr 16).toByte(), (size shr 24).toByte()) +
      "WEBP".toByteArray(Charsets.US_ASCII) +
      body
  }

  // WhatsApp writes the JSON inside an EXIF (TIFF) block, after some binary fields.
  private fun exif(json: String): ByteArray =
    byteArrayOf(0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00) + json.toByteArray(Charsets.UTF_8) +
      byteArrayOf(0x00, 0x00)

  private val image = chunk("VP8 ", ByteArray(11) { 7 })

  @Test
  fun `le os emojis do JSON do WhatsApp`() {
    val file = webp(image, chunk("EXIF", exif("""{"sticker-pack-id":"abc","emojis":["😂","🤣"]}""")))

    assertEquals(listOf("😂", "🤣"), StickerMetadata.emojis(file))
  }

  @Test
  fun `encontra o EXIF depois de blocos de tamanho impar`() {
    val odd = chunk("ICCP", ByteArray(5))
    val file = webp(odd, image, chunk("EXIF", exif("""{"emojis":["😭"]}""")))

    assertEquals(listOf("😭"), StickerMetadata.emojis(file))
  }

  @Test
  fun `descarta emojis em branco`() {
    val file = webp(image, chunk("EXIF", exif("""{"emojis":["", "  ", "🔥"]}""")))

    assertEquals(listOf("🔥"), StickerMetadata.emojis(file))
  }

  @Test
  fun `devolve lista vazia sem bloco EXIF`() {
    assertEquals(emptyList<String>(), StickerMetadata.emojis(webp(image)))
  }

  @Test
  fun `devolve lista vazia quando o JSON nao tem emojis`() {
    val file = webp(image, chunk("EXIF", exif("""{"sticker-pack-id":"abc"}""")))

    assertEquals(emptyList<String>(), StickerMetadata.emojis(file))
  }

  @Test
  fun `devolve lista vazia com JSON quebrado`() {
    val file = webp(image, chunk("EXIF", exif("""{"emojis":["😂" ]x}""")))

    assertEquals(emptyList<String>(), StickerMetadata.emojis(file))
  }

  @Test
  fun `devolve lista vazia para arquivo que nao e WebP`() {
    val gif = "GIF89a".toByteArray(Charsets.US_ASCII) + ByteArray(20)

    assertEquals(emptyList<String>(), StickerMetadata.emojis(gif))
  }

  @Test
  fun `para quando um bloco diz ser maior que o arquivo`() {
    val file = webp(image, chunk("EXIF", exif("""{"emojis":["😂"]}""")))
    val truncated = file.copyOf(file.size - 10)

    assertNull(StickerMetadata.findChunk(truncated, "EXIF"))
  }

  @Test
  fun `findChunk devolve os dados do bloco pedido`() {
    val data = byteArrayOf(1, 2, 3)

    assertArrayEquals(data, StickerMetadata.findChunk(webp(image, chunk("TEST", data)), "TEST"))
  }
}
