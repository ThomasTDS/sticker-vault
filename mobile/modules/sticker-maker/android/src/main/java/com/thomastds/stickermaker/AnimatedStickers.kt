package com.thomastds.stickermaker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Movie
import android.graphics.Paint
import android.graphics.Rect
import android.media.MediaMetadataRetriever
import android.net.Uri
import java.io.File

// Turns a short video or an animated GIF into an animated sticker within WhatsApp's limits:
// 512x512 animated WebP, at most 10 s and 500 KB.
object AnimatedStickers {
  private const val MAX_DURATION_MS = 10_000L
  private const val MIN_DURATION_MS = 500L
  private const val MAX_BYTES = 500 * 1024
  private const val FRAMES_PER_SECOND = 8

  // Tried in order until the file fits: lower quality first, then half of the frames.
  private data class Attempt(val frameStep: Int, val quality: Float)

  private val ATTEMPTS = listOf(
    Attempt(1, 70f),
    Attempt(1, 50f),
    Attempt(1, 35f),
    Attempt(2, 35f),
    Attempt(2, 20f),
  )

  class VideoTooShortException : IllegalArgumentException("The video is too short for an animated sticker")

  class NotAnimatedException : IllegalArgumentException("The image has no animation")

  class TooLargeException : IllegalStateException("The animated sticker does not fit in 500 KB")

  // GIFs are detected by their signature, since the picker does not always report the MIME type.
  fun create(context: Context, uri: String): File {
    val header = ByteArray(4)
    val read = context.contentResolver.openInputStream(Uri.parse(uri))?.use { it.read(header) } ?: 0
    val frames = if (read == header.size && String(header, Charsets.US_ASCII) == "GIF8") {
      extractGifFrames(context, uri)
    } else {
      extractVideoFrames(context, uri)
    }
    return encode(context, frames)
  }

  private fun encode(context: Context, frames: List<Bitmap>): File {
    try {
      val frameDurationMs = 1000 / FRAMES_PER_SECOND
      for (attempt in ATTEMPTS) {
        val selected = frames.filterIndexed { index, _ -> index % attempt.frameStep == 0 }
        val bytes = AnimatedWebpEncoder.encode(selected, frameDurationMs * attempt.frameStep, attempt.quality)
        if (bytes.size <= MAX_BYTES) {
          return File(context.cacheDir, "animated-${System.currentTimeMillis()}.webp").apply { writeBytes(bytes) }
        }
      }
      throw TooLargeException()
    } finally {
      frames.forEach { it.recycle() }
    }
  }

  // Frames are extracted once, already cropped and scaled, and reused by every encoding attempt.
  private fun extractVideoFrames(context: Context, uri: String): List<Bitmap> {
    val retriever = MediaMetadataRetriever()
    try {
      retriever.setDataSource(context, Uri.parse(uri))
      val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
      if (durationMs < MIN_DURATION_MS) {
        throw VideoTooShortException()
      }
      val clipMs = minOf(durationMs, MAX_DURATION_MS)
      val stepMs = 1000L / FRAMES_PER_SECOND

      val frames = mutableListOf<Bitmap>()
      var timeMs = 0L
      while (timeMs < clipMs) {
        val frame = retriever.getFrameAtTime(timeMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST) ?: break
        frames += cropToSticker(frame)
        frame.recycle()
        timeMs += stepMs
      }
      if (frames.size < 2) {
        frames.forEach { it.recycle() }
        throw VideoTooShortException()
      }
      return frames
    } finally {
      retriever.release()
    }
  }

  // GIF frames are rendered at the same rate as video frames. The GIF is drawn whole (not cropped),
  // centered on a transparent canvas, because animated GIF stickers usually have a transparent background.
  // Movie is deprecated, but it is the platform decoder that renders a GIF at a given time
  // (AnimatedImageDrawable can only play the animation).
  @Suppress("DEPRECATION")
  private fun extractGifFrames(context: Context, uri: String): List<Bitmap> {
    val bytes = context.contentResolver.openInputStream(Uri.parse(uri))?.use { it.readBytes() }
      ?: throw IllegalArgumentException("Could not read the GIF")
    val movie = Movie.decodeByteArray(bytes, 0, bytes.size)
      ?: throw IllegalArgumentException("Could not decode the GIF")
    val durationMs = movie.duration()
    if (durationMs <= 0 || movie.width() <= 0 || movie.height() <= 0) {
      throw NotAnimatedException()
    }
    val clipMs = minOf(durationMs.toLong(), MAX_DURATION_MS)
    val stepMs = 1000L / FRAMES_PER_SECOND
    val size = StickerBitmaps.STICKER_SIZE
    val scale = minOf(size.toFloat() / movie.width(), size.toFloat() / movie.height())
    val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)

    val frames = mutableListOf<Bitmap>()
    var timeMs = 0L
    while (timeMs < clipMs) {
      movie.setTime(timeMs.toInt())
      val output = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(output)
      canvas.translate((size - movie.width() * scale) / 2, (size - movie.height() * scale) / 2)
      canvas.scale(scale, scale)
      movie.draw(canvas, 0f, 0f, paint)
      frames += output
      timeMs += stepMs
    }
    if (frames.size < 2) {
      frames.forEach { it.recycle() }
      throw VideoTooShortException()
    }
    return frames
  }

  // Center-crops the frame to a square and scales it to 512x512, like static stickers.
  private fun cropToSticker(frame: Bitmap): Bitmap {
    val size = StickerBitmaps.STICKER_SIZE
    val side = minOf(frame.width, frame.height)
    val left = (frame.width - side) / 2
    val top = (frame.height - side) / 2
    val output = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    Canvas(output).drawBitmap(
      frame,
      Rect(left, top, left + side, top + side),
      Rect(0, 0, size, size),
      Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG),
    )
    return output
  }
}
