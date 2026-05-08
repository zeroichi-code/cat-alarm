package com.catalarm.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.catalarm.overlay.OverlayService
import com.catalarm.sound.AlarmSoundPlayer

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarmId") ?: return
        val soundUri = intent.getStringExtra("soundUri")

        val overlayIntent = Intent(context, OverlayService::class.java).apply {
            putExtra("alarmId", alarmId)
            putExtra("soundUri", soundUri)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(overlayIntent)
        } else {
            context.startService(overlayIntent)
        }
    }
}
