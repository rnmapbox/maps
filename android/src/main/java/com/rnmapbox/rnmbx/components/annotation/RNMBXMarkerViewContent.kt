package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.View.MeasureSpec
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.view.ReactViewGroup
import com.rnmapbox.rnmbx.components.camera.BaseEvent

class RNMBXMarkerViewContent(context: Context): ReactViewGroup(context) {
    var inAdd: Boolean = false
    private var externalPointerEvents: PointerEvents = PointerEvents.AUTO
    private var stopGesturePropagation: Boolean = false

    fun setExternalPointerEvents(pointerEvents: PointerEvents) {
        externalPointerEvents = pointerEvents
    }

    fun setStopGesturePropagation(stop: Boolean) {
        stopGesturePropagation = stop
    }

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
        if (externalPointerEvents == PointerEvents.NONE) {
            return false
        }
        // Decide, at the start of each gesture, who owns it:
        //
        // - If the touch lands on a scrollable descendant (ScrollView, FlatList, ViewPager, …),
        //   ask the map not to intercept so the child keeps the whole gesture and can scroll.
        //   The map is an ancestor, so its onInterceptTouchEvent runs before the child's — without
        //   this the map would steal the drag on its own touch slop before the child could claim it.
        // - Otherwise we leave interception alone. Taps still reach child Pressables (Mapbox uses
        //   its own touch slop, so a tap is not intercepted), while a pan/pinch that merely starts
        //   on the marker reaches the map — instead of the marker being a dead zone (issue #4255).
        //
        // Note: scrollable detection cannot help children that handle drags purely in JS
        // (PanResponder, e.g. some sliders); they never claim the native gesture, so the map takes
        // over once the drag passes its slop. For those, set `stopGesturePropagation` on the
        // MarkerView to keep every gesture inside the marker. Android resets the disallow flag on
        // each new ACTION_DOWN.
        if (ev.actionMasked == MotionEvent.ACTION_DOWN &&
            (stopGesturePropagation || touchStartsOnScrollableChild(ev.rawX, ev.rawY))
        ) {
            parent?.requestDisallowInterceptTouchEvent(true)
        }
        return super.dispatchTouchEvent(ev)
    }

    private fun touchStartsOnScrollableChild(rawX: Float, rawY: Float): Boolean =
        anyScrollableContains(this, rawX, rawY)

    private fun anyScrollableContains(view: View, rawX: Float, rawY: Float): Boolean {
        if (view.visibility != View.VISIBLE) {
            return false
        }
        val loc = IntArray(2)
        view.getLocationOnScreen(loc)
        val inside = rawX >= loc[0] && rawX <= loc[0] + view.width &&
            rawY >= loc[1] && rawY <= loc[1] + view.height
        if (!inside) {
            return false
        }
        if (view !== this && view.isScrollable()) {
            return true
        }
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                if (anyScrollableContains(view.getChildAt(i), rawX, rawY)) {
                    return true
                }
            }
        }
        return false
    }

    private fun View.isScrollable(): Boolean =
        canScrollHorizontally(1) || canScrollHorizontally(-1) ||
            canScrollVertically(1) || canScrollVertically(-1)

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

