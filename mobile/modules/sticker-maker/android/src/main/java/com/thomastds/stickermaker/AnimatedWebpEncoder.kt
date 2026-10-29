package com.thomastds.stickermaker

import android.graphics.Bitmap

// Kotlin side of animated_webp.c (libwebp's WebPAnimEncoder).
object AnimatedWebpEncoder {
  init {
    System.loadLibrary("animated-webp")
  }

  // Encodes the frames (all of the same size, RGBA_8888) shown for frameDurationMs each, looping forever.
  fun encode(frames: List<Bitmap>, frameDurationMs: Int, quality: Float): ByteArray {
    val first = frames.first()
    val handle = nativeCreate(first.width, first.height, quality)
    check(handle != 0L) { "Could not create the animated WebP encoder" }
    try {
      frames.forEachIndexed { index, frame ->
        check(nativeAddFrame(handle, frame, index * frameDurationMs)) { "Could not encode frame $index" }
      }
      return nativeFinish(handle, frames.size * frameDurationMs)
        ?: error("Could not assemble the animated WebP")
    } finally {
      nativeRelease(handle)
    }
  }

  @JvmStatic private external fun nativeCreate(width: Int, height: Int, quality: Float): Long

  @JvmStatic private external fun nativeAddFrame(handle: Long, bitmap: Bitmap, timestampMs: Int): Boolean

  @JvmStatic private external fun nativeFinish(handle: Long, endTimestampMs: Int): ByteArray?

  @JvmStatic private external fun nativeRelease(handle: Long)
}
