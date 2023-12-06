package com.rnmapbox.rnmbx.shape_animators

import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.mapbox.geojson.GeoJson
import com.rnmapbox.rnmbx.utils.Logger
import org.json.JSONObject
import java.util.Date
import java.util.Timer
import java.util.TimerTask
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds

typealias Tag = Long

interface ShapeAnimationConsumer {
    fun shapeUpdated(geoJson: GeoJson)
}
abstract class ShapeAnimator(val tag: Tag) {

    abstract fun getShape(): GeoJson;
    abstract fun start()

    abstract fun subscribe(consumer: ShapeAnimationConsumer)
    abstract fun unsubscribe(consumer: ShapeAnimationConsumer)
}

abstract class ShapeAnimatorCommon(tag: Tag): ShapeAnimator(tag) {
    var timer: Timer? = null
    var progress: Duration? = null

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
        timer?.let { it.cancel() }
        timer = null

        val fps = 30.0
        val period = (1000.0 / fps).toLong()
        val start = Date()
        val timer = Timer()
        this.timer = timer
        val animator = this

        timer.schedule(object : TimerTask() {
            override fun run() {

                val now = Date()
                val diff = now.time - start.time
                val progress = diff.milliseconds
                animator.progress = progress

                val (shape,doContinue) = getAnimatedShape(progress)
                if (!doContinue) {
                    timer.cancel()
                }
                runOnUiThread {
                    subscribers.forEach { it.shapeUpdated(shape) }
                }
            }
        },0, period)
    }

    override fun getShape(): GeoJson {
        return getAnimatedShape(progress ?: 0.0.milliseconds).first
    }
    abstract fun getAnimatedShape(timeSinceStart: Duration): Pair<GeoJson,Boolean>

}
class ShapeAnimatorManager {
    private val animators = hashMapOf<Tag, ShapeAnimator>();
    fun add(animator: ShapeAnimator) {
        animators.put(animator.tag, animator)
    }

    fun isShapeAnimatorTag(shape: String): Boolean {
        return shape.startsWith("{\"__nativeTag\":")
    }

    fun get(tag: String): ShapeAnimator? {
        if (isShapeAnimatorTag(tag)) {
            val obj = JSONObject(tag)
            val tag = obj.getLong("__nativeTag")
            return get(tag);
        }
        else {
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