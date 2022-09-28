package com.mapbox.rctmgl.components.annotation

import android.content.Context
import android.util.Log
import android.view.View
import com.mapbox.geojson.Point
import com.mapbox.maps.ViewAnnotationAnchor
import com.mapbox.maps.viewannotation.viewAnnotationOptions
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView

class RCTMGLMarkerView(context: Context?, private val mManager: RCTMGLMarkerViewManager):
    AbstractMapFeature(context),
    View.OnLayoutChangeListener
{
    // MARK: - Instance variables

    private var mMapView: RCTMGLMapView? = null
    private var mView: View? = null
    private var didAddToMap = false

    private var mCoordinate: Point? = null
    private var mAnchorX: Float = 0.5.toFloat()
    private var mAnchorY: Float = 0.5.toFloat()
    private var mAllowOverlap = false
    private var mIsSelected = false

    fun setCoordinate(point: Point?) {
        mCoordinate = point
        update()
    }

    fun setAnchor(x: Float, y: Float) {
        mAnchorX = x
        mAnchorY = y
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

    // View methods

    override fun addView(childView: View, childPosition: Int) {
        mView = childView
        // Note: Do not call this method on `super`. The view is added manually.
    }

    override fun onLayoutChange(
        v: View,
        left: Int, top: Int, right: Int, bottom: Int,
        oldLeft: Int, oldTop: Int, oldRight: Int, oldBottom: Int
    ) {
        val frameDidChange = left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom;
        if (frameDidChange) {
            addOrUpdate()
        }
    }

    // RCTMGLMapComponent methods

    override fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView
        add()
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        remove()
    }

    // Create, update, and remove methods

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

        val coordinate = mCoordinate
        val width = view.width
        val height = view.height

        view.addOnLayoutChangeListener(this)

        if (view.layoutParams == null && !view.isAttachedToWindow) {
            mMapView?.offscreenAnnotationViewContainer?.addView(view)
            mMapView?.offscreenAnnotationViewContainer?.removeView(view)
        }

        val options = viewAnnotationOptions {
            geometry(coordinate)
            width(width)
            height(height)
            allowOverlap(mAllowOverlap)
            anchor(ViewAnnotationAnchor.CENTER)
        }
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

        val coordinate = mCoordinate
        val width = view.width
        val height = view.height

        // Create a modified offset:
        // - Normalize from [(0, 0), (1, 1)] to [(-1, -1), (1, 1)].
        // - Scale to the view size.
        // - Invert `y` so that higher values are lower on the screen.
        val offsetX = (mAnchorX * 2 - 1) * (width / 2)
        val offsetY = (mAnchorY * 2 - 1) * (height / 2) * -1

        val options = viewAnnotationOptions {
            geometry(coordinate)
            width(width)
            height(height)
            allowOverlap(mAllowOverlap)
            offsetX(offsetX.toInt())
            offsetY(offsetY.toInt())
        }
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
}