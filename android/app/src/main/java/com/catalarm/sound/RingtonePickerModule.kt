package com.catalarm.sound

import android.media.RingtoneManager
import com.facebook.react.bridge.*

class RingtonePickerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "RingtonePicker"

    @ReactMethod
    fun getAlarmRingtones(promise: Promise) {
        try {
            val rm = RingtoneManager(reactContext).apply {
                setType(RingtoneManager.TYPE_ALARM or RingtoneManager.TYPE_RINGTONE)
            }
            val cursor = rm.cursor
            val result = Arguments.createArray()
            while (cursor.moveToNext()) {
                val map = Arguments.createMap().apply {
                    putString("title", cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX))
                    putString("uri", rm.getRingtoneUri(cursor.position).toString())
                }
                result.pushMap(map)
            }
            cursor.close()
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("RINGTONE_ERROR", e.message)
        }
    }
}
