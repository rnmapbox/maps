package com.mapbox.rctmgl.components.annotation

import android.content.Context
import android.util.Log
import android.view.View
import com.mapbox.geojson.Point
import com.mapbox.maps.ViewAnnotationAnchor
import com.mapbox.maps.ViewAnnotationOptions
import com.mapbox.maps.viewannotation.viewAnnotationOptions
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import java.util.Vector

private data class Vec2(val dx: Double, val dy: Double)

class RCTMGLMarkerView(context: Context?, private val mManager: RCTMGLMarkerViewManager):
    AbstractMapFeature(context),
    View.OnLayoutChangeListener
{
    // region Instance variables

    private var mMapView: RCTMGLMapView? = null
    private var mView: View? = null
    private var didAddToMap = false

    private var mCoordinate: Point? = null
    private var mAnchor: Vec2 = Vec2(0.5, 0.5)
    private var mAllowOverlap = false
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

    // region RCTMGLMapComponent methods

    override fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView
        add()
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        remove()
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

        val annotation = mMapView?.viewAnnotationManager?.addViewAnnotation(
            view,
            options
        )
        didAddToMap = true
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

    private fun remove() {
        this.removeOnLayoutChangeListener(this)

        if (mView == null) {
            return
        }

        val removed = mMapView?.viewAnnotationManager?.removeViewAnnotation(mView!!)
        if (removed == false) {
            Log.d("[MarkerView]", "Unable to remove view")
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
            geometry(coordinate)
            width(width)
            height(height)
            allowOverlap(mAllowOverlap)
            offsetX(offset.dx.toInt())
            offsetY(offset.dy.toInt())
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

        // Create a modified offset:
        // - Normalize from [(0, 0), (1, 1)] to [(-1, -1), (1, 1)].
        // - Scale to the view size.
        // - Invert `y` so that higher values are lower on the screen.
        val offsetX = (mAnchor.dx * 2 - 1) * (width / 2)
        val offsetY = (mAnchor.dy * 2 - 1) * (height / 2) * -1

        return Vec2(offsetX, offsetY)
    }

    // endregion
}