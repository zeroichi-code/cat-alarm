package com.catalarm.overlay

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.*

class OverlayPermissionModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "OverlayPermission"

    @ReactMethod
    fun canDrawOverlays(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(reactContext))
    }

    @ReactMethod
    fun openOverlaySettings(promise: Promise) {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactContext.packageName}")
            ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
            reactContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("OVERLAY_SETTINGS_ERROR", e.message)
        }
    }
}
