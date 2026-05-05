package com.catalarm.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*

class AlarmSchedulerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AlarmScheduler"

    @ReactMethod
    fun setAlarm(alarmId: String, triggerAtMillis: Double, soundUri: String?, promise: Promise) {
        try {
            val am = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactContext, AlarmReceiver::class.java).apply {
                putExtra("alarmId", alarmId)
                putExtra("soundUri", soundUri)
            }
            val pi = PendingIntent.getBroadcast(
                reactContext,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val showIntent = PendingIntent.getActivity(
                reactContext,
                alarmId.hashCode() + 1000,
                Intent(reactContext, Class.forName("com.catalarm.MainActivity")),
                PendingIntent.FLAG_IMMUTABLE
            )
            am.setAlarmClock(AlarmManager.AlarmClockInfo(triggerAtMillis.toLong(), showIntent), pi)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SET_ALARM_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            val am = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(reactContext, AlarmReceiver::class.java)
            val pi = PendingIntent.getBroadcast(
                reactContext,
                alarmId.hashCode(),
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            pi?.let { am.cancel(it) }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CANCEL_ALARM_ERROR", e.message)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val am = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            promise.resolve(am.canScheduleExactAlarms())
        } else {
            promise.resolve(true)
        }
    }
}
