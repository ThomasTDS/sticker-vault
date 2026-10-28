package com.thomastds.stickermaker

import com.google.android.gms.common.moduleinstall.ModuleInstall
import com.google.android.gms.common.moduleinstall.ModuleInstallRequest
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class StickerMakerModule : Module() {
  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val segmenter by lazy {
    SubjectSegmentation.getClient(
      SubjectSegmenterOptions.Builder()
        .enableForegroundBitmap()
        .build(),
    )
  }

  override fun definition() = ModuleDefinition {
    Name("StickerMaker")

    // Keeps only the main subject of the photo, with a transparent background.
    AsyncFunction("removeBackground") { uri: String, promise: Promise ->
      val moduleInstall = ModuleInstall.getClient(context)
      moduleInstall.areModulesAvailable(segmenter)
        .addOnSuccessListener { availability ->
          if (availability.areModulesAvailable()) {
            segment(uri, promise)
          } else {
            // While the model is not on the device the segmenter never answers, so ask for it and fail fast.
            moduleInstall.installModules(ModuleInstallRequest.newBuilder().addApi(segmenter).build())
            promise.reject("ERR_MODEL_DOWNLOADING", "The background removal model is being downloaded", null)
          }
        }
        .addOnFailureListener { error ->
          promise.reject("ERR_MODEL_UNAVAILABLE", error.message ?: "Google Play services unavailable", error)
        }
    }

    AsyncFunction("composeSticker") { uri: String, topText: String, bottomText: String ->
      val image = StickerBitmaps.load(context, uri)
      val sticker = StickerBitmaps.compose(image, topText, bottomText)
      StickerBitmaps.save(context, sticker, "sticker")
    }
  }

  private fun segment(uri: String, promise: Promise) {
    val bitmap = StickerBitmaps.load(context, uri)
    segmenter.process(InputImage.fromBitmap(bitmap, 0))
      .addOnSuccessListener { result ->
        val foreground = result.foregroundBitmap
        if (foreground == null) {
          promise.reject("ERR_NO_SUBJECT", "No subject found in the image", null)
          return@addOnSuccessListener
        }
        val cropped = StickerBitmaps.cropToContent(foreground)
        promise.resolve(StickerBitmaps.save(context, cropped, "no-background"))
      }
      .addOnFailureListener { error ->
        promise.reject("ERR_SEGMENTATION", error.message ?: "Background removal failed", error)
      }
  }
}
