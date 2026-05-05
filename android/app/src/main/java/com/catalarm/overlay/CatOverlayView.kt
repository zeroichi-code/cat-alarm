package com.catalarm.overlay

import android.animation.ObjectAnimator
import android.content.Context
import android.content.Intent
import android.view.GestureDetector
import android.view.Gravity
import android.view.MotionEvent
import android.view.animation.DecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.view.GestureDetectorCompat
import kotlin.math.abs
import kotlin.math.sign

class CatOverlayView(context: Context) : FrameLayout(context) {

    val catImageView = ImageView(context).apply {
        scaleType = ImageView.ScaleType.FIT_CENTER
    }

    private val gestureDetector: GestureDetectorCompat
    private val screenW = resources.displayMetrics.widthPixels.toFloat()
    private val screenH = resources.displayMetrics.heightPixels.toFloat()

    // 猫のサイズ: 画面の80%
    private val catW = (screenW * 0.85f).toInt()
    private val catH = (screenH * 0.85f).toInt()

    init {
        setBackgroundColor(0xCC000000.toInt())

        val params = LayoutParams(catW, catH).apply {
            gravity = Gravity.CENTER
        }
        addView(catImageView, params)

        gestureDetector = GestureDetectorCompat(context, object : GestureDetector.SimpleOnGestureListener() {
            override fun onFling(e1: MotionEvent?, e2: MotionEvent, vx: Float, vy: Float): Boolean {
                val absX = abs(vx)
                val absY = abs(vy)
                val threshold = 1200f
                return when {
                    absX > absY && absX > threshold -> { flingOut(sign(vx) * screenW * 1.5f, 0f); true }
                    absY > absX && vy < -threshold  -> { flingOut(0f, -screenH * 1.5f);           true }
                    else -> false
                }
            }
        })
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        gestureDetector.onTouchEvent(event)
        return true
    }

    /**
     * 画面左端の外から中央へのそのそ移動。
     * WebPアニメ（歩き→座り）と同時スタートし、移動時間をアニメ尺に合わせる。
     * アニメ素材の歩き部分が約3.5秒になるよう生成してください。
     */
    fun startEntranceAnimation() {
        catImageView.translationX = -(screenW / 2 + catW / 2).toFloat()

        ObjectAnimator.ofFloat(catImageView, "translationX", catImageView.translationX, 0f).apply {
            duration = 3500
            interpolator = DecelerateInterpolator(2.5f)
            start()
        }
    }

    private fun flingOut(dx: Float, dy: Float) {
        catImageView.animate()
            .translationX(catImageView.translationX + dx)
            .translationY(catImageView.translationY + dy)
            .setDuration(300)
            .withEndAction {
                context.stopService(Intent(context, OverlayService::class.java))
            }
            .start()
    }
}
