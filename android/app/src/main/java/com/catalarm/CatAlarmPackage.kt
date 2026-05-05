package com.catalarm

import com.catalarm.alarm.AlarmSchedulerModule
import com.catalarm.overlay.OverlayPermissionModule
import com.catalarm.sound.RingtonePickerModule
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class CatAlarmPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = listOf(
        AlarmSchedulerModule(reactContext),
        OverlayPermissionModule(reactContext),
        RingtonePickerModule(reactContext)
    )

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
