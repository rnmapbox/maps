package com.rnmapbox.rnmbx.components.images

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Rect
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.mapbox.maps.ImageContent
import com.mapbox.maps.ImageStretches
import com.rnmapbox.rnmbx.components.annotation.RNMBXCallout
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.BitmapUtils
import com.rnmapbox.rnmbx.utils.Logger

/**
 * Holds the child view of an RNMBXImage inside offscreenAnnotationViewContainer, and asks for a
 * new snapshot when something inside the child redraws.
 *
 * The snapshot is otherwise only taken on a layout change or a style load, but the content can
 * change without either - a remote <Image> that finishes loading after the first snapshot is the
 * common case. Invalidations are debounced, so a fade-in produces one snapshot at the end instead
 * of one per frame.
 */
private class ImageContentContainer(context: Context, private val onContentChanged: () -> Unit) : ViewGroup(context) {
    private val refreshRunnable = Runnable { onContentChanged() }

    // Layout of the child is applied by React Native, not by us.
    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}

    // Hardware accelerated invalidation (API 26+).
    @RequiresApi(Build.VERSION_CODES.O)
    override fun onDescendantInvalidated(child: View, target: View) {
        super.onDescendantInvalidated(child, target)
        scheduleRefresh()
    }

    // Software invalidation, and hardware accelerated before API 26.
    @Deprecated("Deprecated in Java")
    override fun invalidateChildInParent(location: IntArray?, dirty: Rect?): ViewParent? {
        scheduleRefresh()
        @Suppress("DEPRECATION")
        return super.invalidateChildInParent(location, dirty)
    }

    private fun scheduleRefresh() {
        removeCallbacks(refreshRunnable)
        postDelayed(refreshRunnable, REFRESH_DEBOUNCE_MS)
    }

    fun cancelRefresh() {
        removeCallbacks(refreshRunnable)
    }

    companion object {
        const val REFRESH_DEBOUNCE_MS = 100L
    }
}

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

    private val mContainer = ImageContentContainer(mContext) { refresh() }

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
        mChildView?.let { removeChildView() }
        mContainer.addView(childView)
        mChildView = childView
        childView.addOnLayoutChangeListener(this)
        placeContainer()
    }

    /**
     * Fabric removes children through the view manager's removeViewAt, which only reaches this
     * view because the manager reports mChildView as its child - it is never a real child of ours.
     */
    fun removeChildView() {
        val childView = mChildView ?: return
        childView.removeOnLayoutChangeListener(this)
        mContainer.cancelRefresh()
        mContainer.removeView(childView)
        mChildView = null
    }

    // The child view is usually inserted before we know the map: the child is mounted into this
    // view before this view is mounted into RNMBXImages. A view that is in no hierarchy is never
    // attached to a window, and a Drawee controller only submits its request on attach - so an
    // <Image> inside the child would never load. Place the container as soon as both are known.
    private fun placeContainer() {
        if (mChildView == null || mContainer.parent != null) {
            return
        }
        mMapView?.offscreenAnnotationViewContainer?.addView(mContainer)
    }

    // region add/remove to Map
    fun addToMap(mapView: RNMBXMapView) {
        mMapView = mapView
        placeContainer()
    }

    fun removeFromMap() {
        mContainer.cancelRefresh()
        (mContainer.parent as? ViewGroup)?.removeView(mContainer)
        mMapView = null
    }
    // endregion
}
