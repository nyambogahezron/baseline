package com.baseline.musicnotification

import android.app.*
import android.content.*
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.baseline.R 

@ReactModule(name = MusicNotificationModule.NAME)
class MusicNotificationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "MusicNotificationModule"
        private const val CHANNEL_ID = "music_playback_channel"
        private const val NOTIFICATION_ID = 1001

        private const val ACTION_PLAY = "com.baseline.musicnotification.PLAY"
        private const val ACTION_PAUSE = "com.baseline.musicnotification.PAUSE"
        private const val ACTION_NEXT = "com.baseline.musicnotification.NEXT"
        private const val ACTION_PREV = "com.baseline.musicnotification.PREV"
    }

    private var isPlaying: Boolean = false

    override fun getName() = NAME

    @ReactMethod
    fun showNotification(title: String, artist: String, isPlaying: Boolean) {
        this.isPlaying = isPlaying
        createNotificationChannel()

        val playIntent = Intent(ACTION_PLAY).let { PendingIntent.getBroadcast(reactContext, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE) }
        val pauseIntent = Intent(ACTION_PAUSE).let { PendingIntent.getBroadcast(reactContext, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE) }
        val nextIntent = Intent(ACTION_NEXT).let { PendingIntent.getBroadcast(reactContext, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE) }
        val prevIntent = Intent(ACTION_PREV).let { PendingIntent.getBroadcast(reactContext, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE) }

        val builder = NotificationCompat.Builder(reactContext, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_music_note) // Use your own icon
            .setContentTitle(title)
            .setContentText(artist)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .addAction(R.drawable.ic_skip_previous, "Previous", prevIntent)
            .addAction(
                if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play_arrow,
                if (isPlaying) "Pause" else "Play",
                if (isPlaying) pauseIntent else playIntent
            )
            .addAction(R.drawable.ic_skip_next, "Next", nextIntent)
            .setStyle(
                androidx.media.app.NotificationCompat.MediaStyle()
                    .setShowActionsInCompactView(0, 1, 2)
            )

        val notification = builder.build()
        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)

        // Register receiver for actions
        reactContext.registerReceiver(notificationReceiver, IntentFilter().apply {
            addAction(ACTION_PLAY)
            addAction(ACTION_PAUSE)
            addAction(ACTION_NEXT)
            addAction(ACTION_PREV)
        })
    }

    @ReactMethod
    fun hideNotification() {
        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(NOTIFICATION_ID)
        try {
            reactContext.unregisterReceiver(notificationReceiver)
        } catch (_: Exception) {}
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Music Playback",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private val notificationReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                ACTION_PLAY -> sendEventToJS("onPlay")
                ACTION_PAUSE -> sendEventToJS("onPause")
                ACTION_NEXT -> sendEventToJS("onNext")
                ACTION_PREV -> sendEventToJS("onPrev")
            }
        }
    }

    private fun sendEventToJS(eventName: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, null)
    }

    @ReactMethod
    fun showNotification(title: String, artist: String) {
        createNotificationChannel()

        val intent = Intent(reactContext, reactContext.currentActivity?.javaClass)
        val pendingIntent = PendingIntent.getActivity(
            reactContext,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Create media control actions
        val playIntent = PendingIntent.getBroadcast(
            reactContext,
            0,
            Intent(ACTION_PLAY),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val pauseIntent = PendingIntent.getBroadcast(
            reactContext,
            1,
            Intent(ACTION_PAUSE),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val nextIntent = PendingIntent.getBroadcast(
            reactContext,
            2,
            Intent(ACTION_NEXT),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val prevIntent = PendingIntent.getBroadcast(
            reactContext,
            3,
            Intent(ACTION_PREV),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(reactContext, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(R.drawable.ic_notification)
            .setAutoCancel(false)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_previous, "Previous", prevIntent)
            .addAction(if (isPlaying) R.drawable.ic_pause else R.drawable.ic_play,
                      if (isPlaying) "Pause" else "Play",
                      if (isPlaying) pauseIntent else playIntent)
            .addAction(R.drawable.ic_next, "Next", nextIntent)
            .setStyle(androidx.media.app.NotificationCompat.MediaStyle()
                .setShowActionsInCompactView(0, 1, 2))
            .build()

        // Register the broadcast receiver for handling button clicks
        try {
            reactContext.unregisterReceiver(notificationReceiver)
        } catch (_: Exception) {}

        val filter = IntentFilter().apply {
            addAction(ACTION_PLAY)
            addAction(ACTION_PAUSE)
            addAction(ACTION_NEXT)
            addAction(ACTION_PREV)
        }
        reactContext.registerReceiver(notificationReceiver, filter)

        val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}