package com.thomastds.stickermaker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ImageDecoder
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import java.io.File
import java.io.FileOutputStream

object StickerBitmaps {
  const val STICKER_SIZE = 512
  private const val IMAGE_MARGIN = 16
  private const val TEXT_MARGIN = 20
  private const val TEXT_MAX_SIZE = 64f
  private const val TEXT_MIN_SIZE = 28f
  private const val TEXT_MAX_LINES = 2

  fun load(context: Context, uri: String): Bitmap {
    val parsed = Uri.parse(uri)
    val bitmap = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      // ImageDecoder applies the EXIF orientation of camera photos.
      ImageDecoder.decodeBitmap(ImageDecoder.createSource(context.contentResolver, parsed)) { decoder, _, _ ->
        decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
      }
    } else {
      context.contentResolver.openInputStream(parsed).use { BitmapFactory.decodeStream(it) }
        ?: throw IllegalArgumentException("Could not decode image: $uri")
    }
    return bitmap.copy(Bitmap.Config.ARGB_8888, true)
  }

  fun save(context: Context, bitmap: Bitmap, prefix: String): String {
    val file = File(context.cacheDir, "$prefix-${System.currentTimeMillis()}.png")
    FileOutputStream(file).use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
    return Uri.fromFile(file).toString()
  }

  // Crops the transparent border left around the subject after the background is removed.
  fun cropToContent(bitmap: Bitmap): Bitmap {
    var minX = bitmap.width
    var minY = bitmap.height
    var maxX = -1
    var maxY = -1
    val row = IntArray(bitmap.width)
    for (y in 0 until bitmap.height) {
      bitmap.getPixels(row, 0, bitmap.width, 0, y, bitmap.width, 1)
      for (x in row.indices) {
        if (Color.alpha(row[x]) > 16) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    if (maxX < 0) {
      return bitmap
    }
    return Bitmap.createBitmap(bitmap, minX, minY, maxX - minX + 1, maxY - minY + 1)
  }

  // Draws the image centered on a transparent 512x512 canvas with meme-style captions.
  fun compose(image: Bitmap, topText: String, bottomText: String): Bitmap {
    val output = Bitmap.createBitmap(STICKER_SIZE, STICKER_SIZE, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(output)

    val box = STICKER_SIZE - IMAGE_MARGIN * 2
    val scale = minOf(box.toFloat() / image.width, box.toFloat() / image.height)
    val width = image.width * scale
    val height = image.height * scale
    val left = (STICKER_SIZE - width) / 2
    val top = (STICKER_SIZE - height) / 2
    canvas.drawBitmap(
      image,
      Rect(0, 0, image.width, image.height),
      RectF(left, top, left + width, top + height),
      Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG),
    )

    caption(topText)?.let { drawCaption(canvas, it, TEXT_MARGIN.toFloat()) }
    caption(bottomText)?.let { drawCaption(canvas, it, STICKER_SIZE - TEXT_MARGIN - it.height.toFloat()) }
    return output
  }

  private fun caption(text: String): StaticLayout? {
    val content = text.trim().uppercase()
    if (content.isEmpty()) {
      return null
    }
    val width = STICKER_SIZE - TEXT_MARGIN * 2
    var size = TEXT_MAX_SIZE
    while (true) {
      val layout = buildLayout(content, width, size, Paint.Style.FILL, Color.WHITE)
      if ((layout.lineCount <= TEXT_MAX_LINES && fitsWidth(layout, width)) || size <= TEXT_MIN_SIZE) {
        return layout
      }
      size -= 4f
    }
  }

  private fun fitsWidth(layout: StaticLayout, width: Int) =
    (0 until layout.lineCount).all { layout.getLineWidth(it) <= width }

  private fun buildLayout(text: String, width: Int, size: Float, style: Paint.Style, color: Int): StaticLayout {
    val paint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
      typeface = Typeface.create("sans-serif-condensed", Typeface.BOLD)
      textSize = size
      this.style = style
      this.color = color
      if (style == Paint.Style.STROKE) {
        strokeWidth = size / 6
        strokeJoin = Paint.Join.ROUND
      }
    }
    return StaticLayout.Builder.obtain(text, 0, text.length, paint, width)
      .setAlignment(Layout.Alignment.ALIGN_CENTER)
      .setIncludePad(false)
      .build()
  }

  // White letters with a black outline, drawn as an outline pass followed by a fill pass.
  private fun drawCaption(canvas: Canvas, fill: StaticLayout, y: Float) {
    val size = fill.paint.textSize
    val outline = buildLayout(fill.text.toString(), fill.width, size, Paint.Style.STROKE, Color.BLACK)
    canvas.save()
    canvas.translate(TEXT_MARGIN.toFloat(), y)
    outline.draw(canvas)
    fill.draw(canvas)
    canvas.restore()
  }
}
