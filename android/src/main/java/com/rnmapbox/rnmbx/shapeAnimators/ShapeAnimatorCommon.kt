package com.rnmapbox.rnmbx.shapeAnimators

import android.util.Log
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.GeoJson
import com.rnmapbox.rnmbx.utils.Logger
import org.json.JSONObject
import java.util.Date
import java.util.Timer
import java.util.TimerTask

typealias Tag = Long

interface ShapeAnimationConsumer {
    fun shapeUpdated(geoJson: GeoJson)
}

abstract class ShapeAnimator(val tag: Tag) {
    abstract fun getShape(): GeoJson
    abstract fun getAnimatedShape(animatorAgeSec: Double): GeoJson
    abstract fun subscribe(consumer: ShapeAnimationConsumer)
    abstract fun unsubscribe(consumer: ShapeAnimationConsumer)
    abstract fun refresh()
    abstract fun start()
    abstract fun stop()
}

private const val LOG_TAG = "RNMBXShapeAnimator"

abstract class ShapeAnimatorCommon(tag: Tag): ShapeAnimator(tag) {
    val emptyGeoJsonObj: FeatureCollection = FeatureCollection.fromFeatures(listOf())

    private var timer: Timer? = null
    private var startedAt = Date()

    private val fps = 30.0
    private val period = 1.0 / fps

    /** The number of seconds the animator has been running continuously. */
    fun getAnimatorAgeSec(): Double {
        val now = Date()
        return (now.time - startedAt.time).toDouble() / 1000
    }

    // region subscribers
    private var subscribers = mutableListOf<ShapeAnimationConsumer>()

    override fun subscribe(consumer: ShapeAnimationConsumer) {
        if (subscribers.contains(consumer)) {
            return
        }

        subscribers.add(consumer)
    }

    override fun unsubscribe(consumer: ShapeAnimationConsumer) {
        subscribers.remove(consumer)
        if (subscribers.isEmpty()) {
            stop()
        }
    }
    // endregion

    override fun refresh() {
        val timestamp = getAnimatorAgeSec()
//        Log.d(
//            LOG_TAG,
//            "Refreshing animator for tag $tag (timestamp: $timestamp, subscribers: ${subscribers.count()})"
//        )

        val shape = getAnimatedShape(timestamp)
        runOnUiThread {
            subscribers.forEach {
                it.shapeUpdated(shape)
            }
        }
    }

    override fun start() {
        if (timer != null) {
            Log.d(LOG_TAG, "Timer for animator $tag is already running (subscribers: ${subscribers.count()})")
            return
        }

        Log.d(LOG_TAG, "Started timer for animator $tag (subscribers: ${subscribers.count()})")

        startedAt = Date()
        timer = Timer()
        timer?.schedule(object : TimerTask() {
            override fun run() {
                refresh()
            }
        }, 0, (period * 1000).toLong())
    }

    override fun stop() {
        if (timer == null) {
            Log.d(LOG_TAG, "Timer for animator $tag is already stopped (subscribers: ${subscribers.count()})")
            return
        }

        Log.d(LOG_TAG,"Stopped timer for animator $tag (subscribers: ${subscribers.count()})")

        timer?.cancel()
        timer = null
    }

    override fun getShape(): GeoJson {
        return getAnimatedShape(getAnimatorAgeSec())
    }
}

class ShapeAnimatorManager {
    private val animators = hashMapOf<Tag, ShapeAnimator>();

    fun add(animator: ShapeAnimator) {
        animators[animator.tag] = animator
    }

    fun isShapeAnimatorTag(shape: String): Boolean {
        return shape.startsWith("{\"__nativeTag\":")
    }

    fun get(tag: String): ShapeAnimator? {
        return if (isShapeAnimatorTag(tag)) {
            val obj = JSONObject(tag)
            val _tag = obj.getLong("__nativeTag")
            get(_tag);
        } else {
            null
        }
    }

    fun get(tag: Tag): ShapeAnimator? {
        val result = animators[tag]
        if (result == null) {
            Logger.e(LOG_TAG, "Shape animator for tag $tag was not found")
        }
        return result
    }
}