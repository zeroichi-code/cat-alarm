package com.catalarm.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        if (action != Intent.ACTION_BOOT_COMPLETED && action != "android.intent.action.LOCKED_BOOT_COMPLETED") return

        val prefs: SharedPreferences = context.getSharedPreferences("cat_alarms", Context.MODE_PRIVATE)
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        prefs.all.forEach { (alarmId, value) ->
            val parts = (value as? String)?.split("|") ?: return@forEach
            if (parts.size < 2) return@forEach
            val triggerAt = parts[0].toLongOrNull() ?: return@forEach
            val soundUri = parts.getOrNull(1)?.takeIf { it.isNotEmpty() }

            if (triggerAt <= System.currentTimeMillis()) return@forEach

            val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("alarmId", alarmId)
                putExtra("soundUri", soundUri)
            }
            val pi = PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                alarmIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val showIntent = PendingIntent.getActivity(
                context,
                alarmId.hashCode() + 1000,
                Intent(context, Class.forName("com.catalarm.MainActivity")),
                PendingIntent.FLAG_IMMUTABLE
            )
            am.setAlarmClock(AlarmManager.AlarmClockInfo(triggerAt, showIntent), pi)
        }
    }
}
