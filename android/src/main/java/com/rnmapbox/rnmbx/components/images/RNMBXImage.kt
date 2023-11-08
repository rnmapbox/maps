package com.rnmapbox.rnmbx.components.images

import android.graphics.Bitmap
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.maps.ImageContent
import com.mapbox.maps.ImageStretches
import com.rnmapbox.rnmbx.components.annotation.RNMBXCallout
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.BitmapUtils
import com.rnmapbox.rnmbx.utils.Logger

class RNMBXImage(private val mContext: ReactApplicationContext, private val mManager: RNMBXImageManager): ReactViewGroup(mContext), View.OnLayoutChangeListener {
    var name: String? = null
    var sdf: Boolean = false
    var scale: Double = 1.0
    var stretchX = listOf<ImageStretches>();
    var stretchY = listOf<ImageStretches>();
    var content: ImageContent? = null;

    var mChildView: View? = null;

    var mMapView: RNMBXMapView? = null;

    var nativeImageUpdater: NativeImageUpdater? = null;

    var mBitmap : Bitmap? = null

    override fun setId(id: Int) {
        super.setId(id)
        mManager.tagAssigned(id)
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
        val name = this.name
        if (name == null) {
            Logger.e("RNMBXImage", "Image component has no name")
            return
        }
        val bitmap = BitmapUtils.viewToBitmap(v, left, top, right, bottom)
        bitmap?.let { bitmap ->
            nativeImageUpdater?.let {
                it.updateImage(name, bitmap, sdf, stretchX, stretchY, content, scale)
                mBitmap = null;
            }
        }
    }

    fun refresh() {
        mChildView?.let {
            refreshBitmap(it)
        }
    }

    override fun addView(childView: View, childPosition: Int) {
        if (childPosition != 0) {
            Logger.e("RNMBXImage", "expected a single subview got childView:$childView position:$childPosition")
        }
        mMapView?.offscreenAnnotationViewContainer?.addView(childView)
        mChildView = childView
        childView.addOnLayoutChangeListener(this)
    }

    // region add/remove to Map
    fun addToMap(mapView: RNMBXMapView) {
        mMapView = mapView
    }
    // endregion
}