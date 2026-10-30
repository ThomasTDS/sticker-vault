package com.thomastds.whatsappstickers

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WhatsAppStickersModule : Module() {
  private var pendingPromise: Promise? = null
  private var pendingFolderPromise: Promise? = null

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

    // WhatsApp only answers whether a pack was added for the app that provides it, through this check.
    AsyncFunction("isStickerPackAdded") { identifier: String ->
      installedWhatsAppPackages().any { isPackAddedTo(it, identifier) }
    }

    Function("openWhatsApp") {
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      val intent = installedWhatsAppPackages().firstNotNullOfOrNull {
        context.packageManager.getLaunchIntentForPackage(it)
      } ?: return@Function false
      activity.startActivity(intent)
      true
    }

    // Received stickers: folder access granted once by the user, then listed and read through it.
    Function("getReceivedStickersFolder") {
      ReceivedStickers.grantedFolder(context)
    }

    AsyncFunction("pickReceivedStickersFolder") { promise: Promise ->
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      pendingFolderPromise?.resolve(null)
      pendingFolderPromise = promise
      activity.startActivityForResult(ReceivedStickers.pickFolderIntent(), PICK_FOLDER_REQUEST_CODE)
    }

    AsyncFunction("listReceivedStickers") { treeUri: String, limit: Int ->
      ReceivedStickers.list(context, treeUri, limit).map { mapOf("uri" to it.uri, "modifiedAt" to it.modifiedAt) }
    }

    AsyncFunction("readStickerEmojis") { uri: String ->
      ReceivedStickers.emojis(context, uri)
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == PICK_FOLDER_REQUEST_CODE) {
        val promise = pendingFolderPromise ?: return@OnActivityResult
        pendingFolderPromise = null
        val treeUri = payload.data?.data
        if (payload.resultCode != Activity.RESULT_OK || treeUri == null) {
          promise.resolve(null)
          return@OnActivityResult
        }
        ReceivedStickers.keepFolder(context, treeUri)
        promise.resolve(treeUri.toString())
        return@OnActivityResult
      }
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

  private fun installedWhatsAppPackage(): String? = installedWhatsAppPackages().firstOrNull()

  private fun installedWhatsAppPackages(): List<String> =
    WHATSAPP_PACKAGES.filter { packageName ->
      try {
        context.packageManager.getPackageInfo(packageName, 0)
        true
      } catch (_: PackageManager.NameNotFoundException) {
        false
      }
    }

  private fun isPackAddedTo(whatsAppPackage: String, identifier: String): Boolean {
    val checkAuthority = "$whatsAppPackage$WHITELIST_CHECK_AUTHORITY_SUFFIX"
    if (context.packageManager.resolveContentProvider(checkAuthority, 0) == null) {
      return false
    }
    val uri = Uri.Builder()
      .scheme("content")
      .authority(checkAuthority)
      .appendPath(WHITELIST_CHECK_PATH)
      .appendQueryParameter("authority", "${context.packageName}.stickercontentprovider")
      .appendQueryParameter("identifier", identifier)
      .build()
    return try {
      context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
        cursor.moveToFirst() && cursor.getInt(cursor.getColumnIndexOrThrow("result")) == 1
      } ?: false
    } catch (_: Exception) {
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
    private const val PICK_FOLDER_REQUEST_CODE = 201
    private const val WHITELIST_CHECK_AUTHORITY_SUFFIX = ".provider.sticker_whitelist_check"
    private const val WHITELIST_CHECK_PATH = "is_whitelisted"

    private val WHATSAPP_PACKAGES = listOf("com.whatsapp", "com.whatsapp.w4b")
  }
}
