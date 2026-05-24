package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.view.MotionEvent
import android.view.View.MeasureSpec
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.view.ReactViewGroup
import com.rnmapbox.rnmbx.components.camera.BaseEvent

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
        // On ACTION_DOWN, tell the parent MapView not to intercept subsequent MOVE/UP
        // events for pan/zoom recognition — that would send CANCEL to child Pressables
        // and suppress onPress. Android resets the disallow flag on each new DOWN, so
        // calling this once per gesture is sufficient. See maplibre-react-native#1289.
        if (ev.actionMasked == MotionEvent.ACTION_DOWN) {
            parent?.requestDisallowInterceptTouchEvent(true)
        }
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
        dispatcher.dispatchEvent(
            BaseEvent(surfaceId, id, "topAnnotationPosition",
                Arguments.createMap().apply {
                    putDouble("x", tx.toDouble())
                    putDouble("y", ty.toDouble())
                },
                canCoalesce = true)
        )
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

