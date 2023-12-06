package com.rnmapbox.rnmbx.components.annotation

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.mapbox.geojson.Point
import com.mapbox.maps.ViewAnnotationAnchor
import com.mapbox.maps.ViewAnnotationOptions
import com.mapbox.maps.viewannotation.viewAnnotationOptions
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.Logger
import java.util.Vector
import com.rnmapbox.rnmbx.v11compat.annotation.*

private data class Vec2(val dx: Double, val dy: Double)

class RNMBXMarkerView(context: Context?, private val mManager: RNMBXMarkerViewManager):
    AbstractMapFeature(context),
    View.OnLayoutChangeListener
{
    // region Instance variables
    private var mView: View? = null
    private var didAddToMap = false

    private var mCoordinate: Point? = null
    private var mAnchor: Vec2 = Vec2(0.5, 0.5)
    private var mAllowOverlap = false
    private var mAllowOverlapWithPuck = false
    private var mIsSelected = false

    fun setCoordinate(point: Point?) {
        mCoordinate = point
        update()
    }

    fun setAnchor(x: Float, y: Float) {
        mAnchor = Vec2(x.toDouble(), y.toDouble())
        update()
    }

    fun setAllowOverlap(allowOverlap: Boolean) {
        mAllowOverlap = allowOverlap
        update()
    }

    fun setAllowOverlapWithPuck(allowOverlapWithPuck: Boolean) {
        mAllowOverlapWithPuck = allowOverlapWithPuck
        update()
    }

    fun setIsSelected(isSelected: Boolean) {
        mIsSelected = isSelected
        update()
    }

    // endregion

    // region View methods

    override fun addView(childView: View, childPosition: Int) {
        mView = childView
        // Note: Do not call this method on `super`. The view is added manually.
    }

    override fun onLayoutChange(
        v: View,
        left: Int, top: Int, right: Int, bottom: Int,
        oldLeft: Int, oldTop: Int, oldRight: Int, oldBottom: Int
    ) {
        addOrUpdate()
    }

    // endregion

    // region AbstractMapFeature methods

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        add()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        super.removeFromMap(mapView, reason)
        remove(mapView)
        return true
    }

    // endregion

    // region Create, update, and remove methods

    private fun addOrUpdate() {
        if (didAddToMap) {
            update()
        } else {
            add()
        }
    }

    private fun add() {
        if (didAddToMap) {
            return
        }

        if (mView == null || mCoordinate == null) {
            return
        }
        val view = mView!!

        view.addOnLayoutChangeListener(this)

        if (view.layoutParams == null && !view.isAttachedToWindow) {
            mMapView?.offscreenAnnotationViewContainer?.addView(view)
            mMapView?.offscreenAnnotationViewContainer?.removeView(view)
        }

        val options = getOptions()

        val content = view as? RNMBXMarkerViewContent;
        content?.inAdd = true;
        didAddToMap = true
        val annotation = mMapView?.viewAnnotationManager?.addViewAnnotation(
            view,
            options
        )
        content?.inAdd = false;
    }

    fun update() {
        if (!didAddToMap) {
            return
        }

        if (mView == null || mCoordinate == null) {
            return
        }
        val view = mView!!

        val options = getOptions()

        val annotation = mMapView?.viewAnnotationManager?.updateViewAnnotation(
            view,
            options
        )
    }

    private fun remove(mapView: RNMBXMapView) {
        this.removeOnLayoutChangeListener(this)

        mView?.let { view ->
            val parent = view.parent
            if (parent is ViewGroup) {
                parent.endViewTransition(view) // https://github.com/mapbox/mapbox-maps-android/issues/1723
            }
            val removed = mapView.viewAnnotationManager?.removeViewAnnotation(view)
            if (removed == false) {
                Logger.w("RNMBXMarkerView", "Unable to remove view")
            }
            didAddToMap = false
        }
    }

    // endregion

    // region Helper functions

    private fun getOptions(): ViewAnnotationOptions {
        val view = mView!!
        val width = view.width
        val height = view.height
        val coordinate = mCoordinate

        val offset = getOffset()

        val options = viewAnnotationOptions {
            coordinate?.let { geometry(it) }
            width(width.toDouble())
            height(height.toDouble())
            allowOverlap(mAllowOverlap)
            allowOverlapWithPuck(mAllowOverlapWithPuck)
            offsets(offset.dx, offset.dy)
            selected(mIsSelected)

        }
        return options
    }

    private fun getOffset(): Vec2 {
        if (mView == null) {
            return Vec2(0.0, 0.0)
        }
        val view = mView!!

        val width = view.width
        val height = view.height

        // Create a modified offset, normalized from 0..1 to -1..1 and scaled to
        // the view size.
        val offsetX = (mAnchor.dx * 2 - 1) * (width / 2) * -1
        val offsetY = (mAnchor.dy * 2 - 1) * (height / 2)

        return Vec2(offsetX, offsetY)
    }

    // endregion
}