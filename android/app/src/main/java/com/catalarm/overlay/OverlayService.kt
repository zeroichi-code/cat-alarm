package com.catalarm.overlay

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.gif.GifDrawable
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import android.graphics.drawable.Drawable
import com.catalarm.R
import com.catalarm.sound.AlarmSoundPlayer

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var catView: CatOverlayView

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForegroundWithNotification()

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

            // 1ファイルで「歩いて→座る」まで完結するアニメ
            val assetId = resources.getIdentifier("cat_enter", "raw", packageName)
            if (assetId != 0) {
                loadAnimatedAsset(view, assetId)
            } else {
                view.catImageView.setBackgroundColor(0xFFFF6600.toInt())
            }
            // 素材読み込みと平行して移動アニメ開始（タイミングを合わせるため同時スタート）
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

    private fun loadAnimatedAsset(view: CatOverlayView, rawId: Int, onReady: () -> Unit = {}) {
        Glide.with(this)
            .load(rawId)
            .into(object : CustomTarget<Drawable>() {
                override fun onResourceReady(resource: Drawable, t: Transition<in Drawable>?) {
                    view.catImageView.setImageDrawable(resource)
                    if (resource is GifDrawable) resource.start()
                    onReady()
                }
                override fun onLoadCleared(placeholder: Drawable?) {}
            })
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

        startForeground(1, notification)
    }
}
