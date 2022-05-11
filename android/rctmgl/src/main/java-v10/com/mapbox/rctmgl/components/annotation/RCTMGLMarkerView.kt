package com.mapbox.rctmgl.components.annotation

import android.content.Context
import android.view.View
import com.mapbox.geojson.Point
import com.mapbox.maps.ViewAnnotationOptions
import com.mapbox.rctmgl.components.mapview.OnMapReadyCallback
import com.mapbox.maps.MapboxMap
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.utils.GeoJSONUtils

class RCTMGLMarkerView(context: Context?, private val mManager: RCTMGLMarkerViewManager) : AbstractMapFeature(context), View.OnLayoutChangeListener {
    private var mMapView: RCTMGLMapView? = null
    private var mChildView: View? = null
    private var mCoordinate: Point? = null
    private lateinit var mAnchor: Array<Float>
    override fun addView(childView: View, childPosition: Int) {
        mChildView = childView
    }

    fun setCoordinate(point: Point?) {
        mCoordinate = point
        if (mChildView != null) {
            val options = ViewAnnotationOptions.Builder().geometry(mCoordinate).build()
            mMapView?.viewAnnotationManager?.updateViewAnnotation(mChildView!!, options)
        }
    }

    fun setAnchor(x: Float, y: Float) {
        mAnchor = arrayOf(x, y)
        refresh()
    }

    fun refresh() {
        // this will cause position to be recalculated
        if (mChildView != null) {
            val width = mChildView!!.width
            val height = mChildView!!.height
            val options = ViewAnnotationOptions.Builder().geometry(mCoordinate).width(width).height(height).offsetX(((mAnchor[0] - 0.5) * width).toInt()).offsetY(((mAnchor[1] - 0.5) * height).toInt()).build()
            mMapView?.viewAnnotationManager?.updateViewAnnotation(mChildView!!, options)
        }
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView
        val rctmglMarkerView = this
        mMapView?.getMapAsync {
            if (mChildView != null) {
                GeoJSONUtils.toLatLng(mCoordinate)
                val width = mChildView!!.width
                val height = mChildView!!.height
                val options = ViewAnnotationOptions.Builder().geometry(mCoordinate).width(width).height(height).offsetX(((mAnchor[0] - 0.5) * width).toInt()).offsetY(((mAnchor[1] - 0.5) * height).toInt()).build()
                mChildView!!.addOnLayoutChangeListener(rctmglMarkerView)
                if (mChildView!!.layoutParams == null && !mChildView!!.isAttachedToWindow) {
                    mMapView?.offscreenAnnotationViewContainer()?.addView(mChildView)
                    mMapView?.offscreenAnnotationViewContainer()?.removeView(mChildView)
                }
                mMapView?.viewAnnotationManager?.addViewAnnotation(mChildView!!, options)
            }
        }
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        if (mChildView != null) {
            mMapView?.viewAnnotationManager?.removeViewAnnotation(mChildView!!)
            mChildView!!.removeOnLayoutChangeListener(this)
        }
    }

    override fun onLayoutChange(v: View, left: Int, top: Int, right: Int, bottom: Int, oldLeft: Int, oldTop: Int,
                                oldRight: Int, oldBottom: Int) {
        if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
            refresh()
        }
    }
}