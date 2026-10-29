package com.thomastds.incomingshare

import android.content.Intent
import android.net.Uri
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Delivers files shared to the app through Android's "Share" menu (ACTION_SEND), which Expo does not expose.
class IncomingShareModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IncomingShare")

    Events(SHARE_RECEIVED_EVENT)

    // The share that launched the app, if any. It is consumed so a later call does not import it again.
    Function("takeInitialSharedFile") {
      appContext.currentActivity?.intent?.let { takeSharedFile(it) }
    }

    // Shares received while the app is already running.
    OnNewIntent { intent ->
      takeSharedFile(intent)?.let { uri -> sendEvent(SHARE_RECEIVED_EVENT, mapOf("uri" to uri)) }
    }
  }

  private fun takeSharedFile(intent: Intent): String? {
    if (intent.action != Intent.ACTION_SEND) {
      return null
    }
    val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
    } else {
      @Suppress("DEPRECATION")
      intent.getParcelableExtra(Intent.EXTRA_STREAM)
    }
    intent.removeExtra(Intent.EXTRA_STREAM)
    return uri?.toString()
  }

  companion object {
    private const val SHARE_RECEIVED_EVENT = "onShareReceived"
  }
}
