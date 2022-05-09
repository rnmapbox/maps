package com.mapbox.rctmgl.components.annotation

import android.content.Context
import android.graphics.Bitmap
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation
import com.mapbox.maps.MapboxMap
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.annotation.RCTMGLCallout
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.events.constants.EventTypes
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation
import com.mapbox.maps.extension.style.layers.properties.generated.IconAnchor
import com.mapbox.rctmgl.events.PointAnnotationClickEvent
import android.graphics.PointF
import android.view.View
import com.mapbox.geojson.Point
import com.mapbox.maps.ScreenCoordinate
import com.mapbox.maps.Style
import com.mapbox.rctmgl.events.PointAnnotationDragEvent
import com.mapbox.rctmgl.utils.BitmapUtils
import com.mapbox.rctmgl.utils.LatLng
import java.util.*

class RCTMGLPointAnnotation(private val mContext: Context, private val mManager: RCTMGLPointAnnotationManager) : AbstractMapFeature(mContext), View.OnLayoutChangeListener {
    var marker: PointAnnotation? = null
        private set
    private var mMap: MapboxMap? = null
    private var mMapView: RCTMGLMapView? = null
    private val mHasChildren = false
    private var mCoordinate: Point? = null
    var iD: String? = null
    private val mTitle: String? = null
    private val mSnippet: String? = null
    private var mAnchor: Array<Float>? = null
    private val mIsSelected = false
    private var mDraggable = false
    private var mChildView: View? = null
    private var mChildBitmap: Bitmap? = null
    private var mChildBitmapId: String? = null
    var calloutView: View? = null
        private set
    private var mCalloutSymbol: PointAnnotation? = null
    private var mCalloutBitmap: Bitmap? = null
    private var mCalloutBitmapId: String? = null
    override fun addView(childView: View, childPosition: Int) {
        if (childView is RCTMGLCallout) {
            calloutView = childView
        } else {
            mChildView = childView
        }
        childView.addOnLayoutChangeListener(this)

        mMapView?.offscreenAnnotationViewContainer()?.addView(childView)

    }

    override fun removeView(childView: View) {
        if (mChildView != null) {
            mMap?.getStyle(object : Style.OnStyleLoaded {
                override fun onStyleLoaded(style: Style) {
                    mChildBitmapId?.let { style.removeStyleImage(it) }
                    mChildView = null
                    calloutView = null
                    mChildBitmap = null
                    mChildBitmapId = null
                    updateOptions()
                }
            })
        }
        mMapView?.offscreenAnnotationViewContainer()?.removeView(childView)
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        mMapView = mapView
        mMap = mapView.getMapboxMap()
        makeMarker()
        if (mChildView != null) {
            if (!mChildView!!.isAttachedToWindow) {
                mMapView!!.offscreenAnnotationViewContainer().addView(mChildView)
            }
            addBitmapToStyle(mChildBitmap, mChildBitmapId)
            updateOptions()
        }
        if (calloutView != null) {
            if (!calloutView!!.isAttachedToWindow && mMapView != null) {
                mMapView!!.offscreenAnnotationViewContainer().addView(calloutView)
            }
            addBitmapToStyle(mCalloutBitmap, mCalloutBitmapId)
        }
    }

    override fun removeFromMap(mapView: RCTMGLMapView) {
        val map = (if (mMapView != null) mMapView else mapView) ?: return
        if (marker != null) {
            map.pointAnnotationManager?.delete(marker!!)
        }
        if (mChildView != null) {
            map.offscreenAnnotationViewContainer().removeView(mChildView)
        }
        if (calloutView != null) {
            map.offscreenAnnotationViewContainer().removeView(calloutView)
        }
    }

    override fun onLayoutChange(v: View, left: Int, top: Int, right: Int, bottom: Int, oldLeft: Int, oldTop: Int,
                                oldRight: Int, oldBottom: Int) {
        if (left == 0 && top == 0 && right == 0 && bottom == 0) {
            return
        }
        if (left != oldLeft || right != oldRight || top != oldTop || bottom != oldBottom) {
            refreshBitmap(v, left, top, right, bottom)
        }
    }

    private fun refreshBitmap(v: View, left: Int = v.left, top: Int = v.top, right: Int = v.right, bottom: Int = v.bottom) {
        val bitmap = BitmapUtils.viewToBitmap(v, left, top, right, bottom)
        val bitmapId = Integer.toString(v.id)
        addBitmapToStyle(bitmap, bitmapId)
        if (v is RCTMGLCallout) {
            mCalloutBitmap = bitmap
            mCalloutBitmapId = bitmapId
        } else {
            if (bitmap != null) {
                mChildBitmap = bitmap
                mChildBitmapId = bitmapId
                updateOptions()
            }
        }
    }

    val latLng: LatLng
        get() = GeoJSONUtils.toLatLng(mCoordinate)
    val mapboxID: Long
        get() = if (marker == null) -1 else marker!!.id

    fun setCoordinate(point: Point) {
        mCoordinate = point
        if (marker != null) {
            marker!!.point = point
            mMapView?.pointAnnotationManager?.update(marker!!)
        }
        if (mCalloutSymbol != null) {
            mCalloutSymbol!!.point = point
            mMapView?.pointAnnotationManager?.update(mCalloutSymbol!!)
        }
    }

    fun setAnchor(x: Float, y: Float) {
        mAnchor = arrayOf(x, y)
        if (marker != null) {
            updateAnchor()
            mMapView?.pointAnnotationManager?.update(marker!!)
        }
    }

    fun setDraggable(draggable: Boolean) {
        mDraggable = draggable
        if (marker != null) {
            marker!!.isDraggable = draggable
            mMapView?.pointAnnotationManager?.update(marker!!)
        }
    }

    fun onSelect(shouldSendEvent: Boolean) {
        if (calloutView != null) {
            makeCallout()
        }
        if (shouldSendEvent) {
            mManager.handleEvent(makeEvent(true))
        }
    }

    fun onDeselect() {
        mManager.handleEvent(makeEvent(false))
        if (mCalloutSymbol != null) {
            mMapView?.pointAnnotationManager?.delete(mCalloutSymbol!!)
        }
    }

    fun onDragStart() {
        mCoordinate = marker!!.point
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG_START))
    }

    fun onDrag() {
        mCoordinate = marker!!.point
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG))
    }

    fun onDragEnd() {
        mCoordinate = marker!!.point
        mManager.handleEvent(makeDragEvent(EventTypes.ANNOTATION_DRAG_END))
    }

    fun makeMarker() {
        val options = mCoordinate?.let {
            PointAnnotationOptions()
                .withPoint(it)
                .withDraggable(mDraggable)
                .withIconSize(1.0)
                .withSymbolSortKey(10.0)
        }
        val symbolManager = mMapView?.pointAnnotationManager
        if (symbolManager != null && options != null) {
            marker = symbolManager.create(options)
            updateOptions()
        }
    }

    private fun updateOptions() {
        if (marker != null) {
            updateIconImage()
            updateAnchor()
            mMapView?.pointAnnotationManager?.update(marker!!)
        }
    }

    private fun updateIconImage() {
        if (mChildView != null) {
            if (mChildBitmapId != null) {
                marker?.iconImage = mChildBitmapId
            }
        } else {
            marker?.iconImage = MARKER_IMAGE_ID
            marker?.iconAnchor = IconAnchor.BOTTOM
        }
    }

    private fun updateAnchor() {
        if (mAnchor != null && mChildView != null && mChildBitmap != null && marker != null) {
            var w = mChildBitmap!!.width
            var h = mChildBitmap!!.height
            val scale = resources.displayMetrics.density
            w = (w / scale).toInt()
            h = (h / scale).toInt()
            marker?.iconAnchor = IconAnchor.TOP_LEFT
            marker?.iconOffset = Arrays.asList(w.toDouble() * mAnchor!![0] * -1.0, h.toDouble() * mAnchor!![1] * -1.0)
        }
    }

    private fun makeCallout() {
        var yOffset = -28f
        if (mChildView != null) {
            if (mChildBitmap != null) {
                val scale = resources.displayMetrics.density
                var h = mChildBitmap!!.height / 2
                h = (h / scale).toInt()
                yOffset = h.toFloat() * -1
            }
        }
        val options = mCoordinate?.let {
            mCalloutBitmapId?.let { _mCalloutBitmapId ->
                PointAnnotationOptions()
                    .withPoint(it)
                    .withIconImage(_mCalloutBitmapId)
                    .withIconSize(1.0)
                    .withIconAnchor(IconAnchor.BOTTOM)
                    .withIconOffset(Arrays.asList(0.0, yOffset.toDouble()))
                    .withSymbolSortKey(11.0)
                    .withDraggable(false)
            }
        }
        val symbolManager = mMapView?.pointAnnotationManager
        if (symbolManager != null && options != null) {
            mCalloutSymbol = symbolManager.create(options)
        }
    }

    private fun addBitmapToStyle(bitmap: Bitmap?, bitmapId: String?) {
        if (mMap != null && bitmapId != null && bitmap != null) {
            mMap!!.getStyle(object : Style.OnStyleLoaded {
                override fun onStyleLoaded(style: Style) {
                    style.addImage(bitmapId, bitmap)
                }
            })
        }
    }

    private fun makeEvent(isSelect: Boolean): PointAnnotationClickEvent {
        val type = if (isSelect) EventTypes.ANNOTATION_SELECTED else EventTypes.ANNOTATION_DESELECTED
        val latLng = GeoJSONUtils.toLatLng(mCoordinate)
        val screenPos = getScreenPosition(latLng)
        return PointAnnotationClickEvent(this, latLng, ScreenCoordinate(screenPos.x.toDouble(), screenPos.y.toDouble()), type)
    }

    private fun makeDragEvent(type: String): PointAnnotationDragEvent {
        val latLng = GeoJSONUtils.toLatLng(mCoordinate)
        val screenPos = getScreenPosition(latLng)
        return PointAnnotationDragEvent(this, latLng, screenPos, type)
    }

    private val displayDensity: Float
        private get() = mContext.resources.displayMetrics.density

    private fun getScreenPosition(latLng: LatLng): PointF {
        val screenPos = mMap!!.pixelForCoordinate(latLng.point)
        val density = displayDensity
        return PointF((screenPos.x / density).toFloat(), (screenPos.y / density).toFloat())
    }

    fun refresh() {
        if (mChildView != null) {
            refreshBitmap(mChildView!!)
        }
    }

    companion object {
        private const val MARKER_IMAGE_ID = "MARKER_IMAGE_ID"
    }
}