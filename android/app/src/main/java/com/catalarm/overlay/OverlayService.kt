package com.catalarm.overlay

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.ImageDecoder
import android.graphics.PixelFormat
import android.graphics.drawable.AnimatedImageDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import com.catalarm.R
import com.catalarm.sound.AlarmSoundPlayer

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var catView: CatOverlayView
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // STOPアクションで即停止
        if (intent?.action == "STOP") {
            stopSelf()
            return START_NOT_STICKY
        }

        startForegroundWithNotification()

        // startForeground()の後にバックグラウンドで音を再生（メインスレッドをブロックしない）
        val soundUri = intent?.getStringExtra("soundUri")
        Thread {
            AlarmSoundPlayer.play(this, soundUri)
        }.start()

        catView = CatOverlayView(this).also { view ->
            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                else
                    @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                PixelFormat.TRANSLUCENT
            )
            windowManager.addView(view, params)

            // バックグラウンドで WebP をデコードして UI スレッドでセット
            val assetId = resources.getIdentifier("cat_enter", "raw", packageName)
            if (assetId != 0) {
                Thread {
                    try {
                        val source = ImageDecoder.createSource(resources, assetId)
                        val drawable = ImageDecoder.decodeDrawable(source)
                        mainHandler.post {
                            view.catImageView.setImageDrawable(drawable)
                            if (drawable is AnimatedImageDrawable) {
                                drawable.repeatCount = AnimatedImageDrawable.REPEAT_INFINITE
                                drawable.start()
                            }
                        }
                    } catch (e: Exception) {
                        mainHandler.post {
                            view.catImageView.setBackgroundColor(0xFFFF6600.toInt())
                        }
                    }
                }.start()
            } else {
                view.catImageView.setBackgroundColor(0xFFFF6600.toInt())
            }

            view.startEntranceAnimation()
        }

        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::catView.isInitialized) {
            runCatching { windowManager.removeView(catView) }
        }
        AlarmSoundPlayer.stop()
    }

    private fun startForegroundWithNotification() {
        val channelId = "cat_alarm_overlay"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "猫アラーム", NotificationManager.IMPORTANCE_HIGH)
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }

        val stopIntent = Intent(this, OverlayService::class.java).apply { action = "STOP" }
        val stopPi = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_IMMUTABLE)

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("猫アラーム")
            .setContentText("スワイプして猫を追い払う")
            .setSmallIcon(R.mipmap.ic_launcher)
            .addAction(0, "停止", stopPi)
            .setOngoing(true)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(1, notification)
        }
    }
}
