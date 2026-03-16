package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.view.MotionEvent
import android.view.View.MeasureSpec
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup

private class AnnotationPositionEvent(
    surfaceId: Int,
    viewTag: Int,
    translateX: Float,
    translateY: Float,
) : Event<AnnotationPositionEvent>(surfaceId, viewTag) {
    private val mData: WritableMap = Arguments.createMap().apply {
        putDouble("x", translateX.toDouble())
        putDouble("y", translateY.toDouble())
    }
    override fun getEventName() = "topAnnotationPosition"
    // Allow coalescing so rapid position updates don't flood the JS queue
    override fun canCoalesce() = true
    override fun getEventData(): WritableMap = mData
}

class RNMBXMarkerViewContent(context: Context): ReactViewGroup(context) {
    var inAdd: Boolean = false

    // Track last reported translation to avoid feedback loop:
    // Mapbox sets setTranslationX(512) → we fire event → JS sets transform:[{translateX:512}]
    // → Fabric calls setTranslationX(512) again → same value → no re-fire.
    private var lastReportedTx = Float.NaN
    private var lastReportedTy = Float.NaN

    init {
        allowRenderingOutside()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        configureParentClipping()
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        // Prevent the parent MapView from intercepting subsequent MOVE/UP events
        // for its own pan/zoom gesture recognition, which would send CANCEL to
        // the Pressable and suppress onPress. See maplibre/maplibre-react-native#1289.
        parent?.requestDisallowInterceptTouchEvent(true)
        return super.dispatchTouchEvent(ev)
    }

    override fun setTranslationX(translationX: Float) {
        super.setTranslationX(translationX)
        maybeFireAnnotationPositionEvent()
    }

    override fun setTranslationY(translationY: Float) {
        super.setTranslationY(translationY)
        maybeFireAnnotationPositionEvent()
    }

    private fun maybeFireAnnotationPositionEvent() {
        val tx = translationX
        val ty = translationY
        // Dedup: skip if value unchanged (prevents feedback loop when Fabric
        // re-applies the same transform prop back to setTranslationX/Y).
        if (tx == lastReportedTx && ty == lastReportedTy) return
        lastReportedTx = tx
        lastReportedTy = ty

        val reactContext = context as? ReactContext ?: return
        val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id) ?: return
        // Use getSurfaceId(view) — more reliable for Fabric than getSurfaceId(context)
        val surfaceId = UIManagerHelper.getSurfaceId(this)
        dispatcher.dispatchEvent(AnnotationPositionEvent(surfaceId, id, tx, ty))
    }

    private fun configureParentClipping() {
        val parent = parent
        if (parent is android.view.ViewGroup) {
            parent.allowRenderingOutside()
        }
    }

    // see https://github.com/rnmapbox/maps/pull/3235
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        if (inAdd) {
            val w = if (widthMeasureSpec == 0) {
                MeasureSpec.makeMeasureSpec(measuredWidth, MeasureSpec.EXACTLY)
            } else {
                widthMeasureSpec
            };
            val h = if (heightMeasureSpec == 0) {
                MeasureSpec.makeMeasureSpec(measuredHeight, MeasureSpec.EXACTLY)
            } else {
                heightMeasureSpec
            }
            super.onMeasure(w, h)
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        }
    }
}

private fun ViewGroup.allowRenderingOutside() {
    this.clipChildren = false
    this.clipToPadding = false
}

