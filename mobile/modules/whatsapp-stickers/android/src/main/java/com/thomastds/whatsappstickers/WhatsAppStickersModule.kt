package com.thomastds.whatsappstickers

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WhatsAppStickersModule : Module() {
  private var pendingPromise: Promise? = null

  private val context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("WhatsAppStickers")

    Function("isWhatsAppInstalled") {
      installedWhatsAppPackage() != null
    }

    AsyncFunction("addStickerPack") { identifier: String, name: String, promise: Promise ->
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      val whatsAppPackage = installedWhatsAppPackage()
      if (whatsAppPackage == null) {
        promise.resolve(mapOf("status" to "not_installed"))
        return@AsyncFunction
      }

      val intent = Intent(ADD_PACK_ACTION).apply {
        setPackage(whatsAppPackage)
        putExtra(EXTRA_PACK_ID, identifier)
        putExtra(EXTRA_PACK_AUTHORITY, "${context.packageName}.stickercontentprovider")
        putExtra(EXTRA_PACK_NAME, name)
      }

      pendingPromise?.resolve(mapOf("status" to "cancelled"))
      pendingPromise = promise
      activity.startActivityForResult(intent, ADD_PACK_REQUEST_CODE)
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode != ADD_PACK_REQUEST_CODE) {
        return@OnActivityResult
      }
      val promise = pendingPromise ?: return@OnActivityResult
      pendingPromise = null

      val validationError = payload.data?.getStringExtra(EXTRA_VALIDATION_ERROR)
      val result = when {
        payload.resultCode == Activity.RESULT_OK -> mapOf("status" to "added")
        validationError != null -> mapOf("status" to "error", "message" to validationError)
        else -> mapOf("status" to "cancelled")
      }
      promise.resolve(result)
    }
  }

  private fun installedWhatsAppPackage(): String? =
    WHATSAPP_PACKAGES.firstOrNull { packageName ->
      try {
        context.packageManager.getPackageInfo(packageName, 0)
        true
      } catch (_: PackageManager.NameNotFoundException) {
        false
      }
    }

  companion object {
    private const val ADD_PACK_ACTION = "com.whatsapp.intent.action.ENABLE_STICKER_PACK"
    private const val EXTRA_PACK_ID = "sticker_pack_id"
    private const val EXTRA_PACK_AUTHORITY = "sticker_pack_authority"
    private const val EXTRA_PACK_NAME = "sticker_pack_name"
    private const val EXTRA_VALIDATION_ERROR = "validation_error"
    private const val ADD_PACK_REQUEST_CODE = 200

    private val WHATSAPP_PACKAGES = listOf("com.whatsapp", "com.whatsapp.w4b")
  }
}
