package com.rnmapbox.rnmbx.shape_animators

import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
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
    abstract fun getAnimatedShape(currentTimestamp: Long): Pair<GeoJson, Boolean>
    abstract fun subscribe(consumer: ShapeAnimationConsumer)
    abstract fun unsubscribe(consumer: ShapeAnimationConsumer)
    abstract fun start()
}

abstract class ShapeAnimatorCommon(tag: Tag): ShapeAnimator(tag) {
    private var timer: Timer? = null
    var start = Date()

    val fps = 30.0
    val period = (1000.0 / fps).toLong()

    /** The animator's lifespan in milliseconds. */
    public fun getCurrentTimestamp(): Long {
        val now = Date()
        return now.time - start.time
    }

    // region subscribers
    var subscribers = mutableListOf<ShapeAnimationConsumer>()

    override fun subscribe(consumer: ShapeAnimationConsumer) {
        subscribers.add(consumer)
    }

    override fun unsubscribe(consumer: ShapeAnimationConsumer) {
        subscribers.remove(consumer)
    }
    // endregion

    override fun start() {
        timer?.cancel()
        timer = null

        this.timer = Timer()
        start = Date()
        val animator = this

        timer!!.schedule(object: TimerTask() {
            override fun run() {
                val timestamp = getCurrentTimestamp()

                val (shape, doContinue) = getAnimatedShape(timestamp)
                if (!doContinue) {
                    timer?.cancel()
                }
                runOnUiThread {
                    subscribers.forEach { it.shapeUpdated(shape) }
                }
            }
        }, 0, period)
    }

    override fun getShape(): GeoJson {
        return getAnimatedShape(getCurrentTimestamp()).first
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
        if (isShapeAnimatorTag(tag)) {
            val obj = JSONObject(tag)
            val _tag = obj.getLong("__nativeTag")
            return get(_tag);
        } else {
            return null
        }
    }

    fun get(tag: Tag): ShapeAnimator? {
        val result = animators[tag]
        if (result == null) {
            Logger.e(LOG_TAG, "Shape animator for tag: $tag was not found")
        }
        return result
    }

    companion object {
        const val LOG_TAG = "RNMBXShapeAnimators"
    }
}