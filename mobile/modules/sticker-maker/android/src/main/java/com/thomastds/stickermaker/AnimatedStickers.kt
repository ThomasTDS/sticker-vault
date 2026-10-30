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

// Turns a segment of a short video or an animated GIF into an animated sticker within WhatsApp's limits:
// 512x512 animated WebP, at most 10 s and 500 KB.
object AnimatedStickers {
  const val MAX_DURATION_MS = 10_000L
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

  fun durationMs(context: Context, uri: String): Long = openSource(context, uri).use { it.durationMs }

  // Renders the sticker frame at the given time, so the user can see where a segment starts and ends.
  fun previewFrame(context: Context, uri: String, timeMs: Long): String = openSource(context, uri).use { source ->
    val frame = source.frameAt(timeMs.coerceIn(0, maxOf(source.durationMs - 1, 0)))
      ?: throw IllegalArgumentException("No frame at $timeMs ms")
    StickerBitmaps.save(context, frame, "preview").also { frame.recycle() }
  }

  // Converts the segment that starts at startMs and lasts up to lengthMs (at most 10 s).
  fun create(context: Context, uri: String, startMs: Long, lengthMs: Long): File {
    val frames = openSource(context, uri).use { source ->
      val start = startMs.coerceIn(0, source.durationMs)
      val end = minOf(start + minOf(lengthMs, MAX_DURATION_MS), source.durationMs)
      if (end - start < MIN_DURATION_MS) {
        throw VideoTooShortException()
      }
      extractFrames(source, start, end)
    }
    return encode(context, frames)
  }

  private fun extractFrames(source: FrameSource, startMs: Long, endMs: Long): List<Bitmap> {
    val stepMs = 1000L / FRAMES_PER_SECOND
    val frames = mutableListOf<Bitmap>()
    var timeMs = startMs
    while (timeMs < endMs) {
      frames += source.frameAt(timeMs) ?: break
      timeMs += stepMs
    }
    if (frames.size < 2) {
      frames.forEach { it.recycle() }
      throw VideoTooShortException()
    }
    return frames
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

  // GIFs are detected by their signature, since the picker does not always report the MIME type.
  private fun openSource(context: Context, uri: String): FrameSource {
    val header = ByteArray(4)
    val read = context.contentResolver.openInputStream(Uri.parse(uri))?.use { it.read(header) } ?: 0
    return if (read == header.size && String(header, Charsets.US_ASCII) == "GIF8") {
      GifSource(context, uri)
    } else {
      VideoSource(context, uri)
    }
  }

  // Gives 512x512 sticker frames of a video or GIF at any time of the animation.
  private interface FrameSource : AutoCloseable {
    val durationMs: Long

    fun frameAt(timeMs: Long): Bitmap?
  }

  // Video frames are center-cropped to a square, like static stickers.
  private class VideoSource(context: Context, uri: String) : FrameSource {
    private val retriever = MediaMetadataRetriever().apply { setDataSource(context, Uri.parse(uri)) }

    override val durationMs =
      retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L

    override fun frameAt(timeMs: Long): Bitmap? {
      val frame = retriever.getFrameAtTime(timeMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST) ?: return null
      return cropToSticker(frame).also { frame.recycle() }
    }

    override fun close() = retriever.release()

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

  // The GIF is drawn whole (not cropped), centered on a transparent canvas, because animated GIF stickers
  // usually have a transparent background. Movie is deprecated, but it is the platform decoder that renders
  // a GIF at a given time (AnimatedImageDrawable can only play the animation).
  @Suppress("DEPRECATION")
  private class GifSource(context: Context, uri: String) : FrameSource {
    private val movie: Movie
    private val scale: Float
    private val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)

    init {
      val bytes = context.contentResolver.openInputStream(Uri.parse(uri))?.use { it.readBytes() }
        ?: throw IllegalArgumentException("Could not read the GIF")
      movie = Movie.decodeByteArray(bytes, 0, bytes.size)
        ?: throw IllegalArgumentException("Could not decode the GIF")
      if (movie.duration() <= 0 || movie.width() <= 0 || movie.height() <= 0) {
        throw NotAnimatedException()
      }
      val size = StickerBitmaps.STICKER_SIZE.toFloat()
      scale = minOf(size / movie.width(), size / movie.height())
    }

    override val durationMs = movie.duration().toLong()

    override fun frameAt(timeMs: Long): Bitmap {
      val size = StickerBitmaps.STICKER_SIZE
      movie.setTime(timeMs.toInt())
      val output = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(output)
      canvas.translate((size - movie.width() * scale) / 2, (size - movie.height() * scale) / 2)
      canvas.scale(scale, scale)
      movie.draw(canvas, 0f, 0f, paint)
      return output
    }

    override fun close() = Unit
  }
}
