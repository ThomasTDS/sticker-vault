package com.thomastds.stickermaker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.media.MediaMetadataRetriever
import android.net.Uri
import java.io.File

// Turns a short video into an animated sticker within WhatsApp's limits:
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

  class TooLargeException : IllegalStateException("The animated sticker does not fit in 500 KB")

  fun fromVideo(context: Context, uri: String): File {
    val frames = extractFrames(context, uri)
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
  private fun extractFrames(context: Context, uri: String): List<Bitmap> {
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
        frames += toStickerFrame(frame)
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

  // Center-crops the frame to a square and scales it to 512x512, like static stickers.
  private fun toStickerFrame(frame: Bitmap): Bitmap {
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
