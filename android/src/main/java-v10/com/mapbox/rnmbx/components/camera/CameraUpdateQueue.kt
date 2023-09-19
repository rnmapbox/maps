package com.mapbox.rnmbx.components.camera

import com.mapbox.rnmbx.components.camera.CameraStop.Companion.fromReadableMap
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.plugin.animation.CameraAnimationsPlugin
import android.view.animation.LinearInterpolator
import android.view.animation.AccelerateDecelerateInterpolator
import com.mapbox.rnmbx.components.camera.CameraStop
import com.mapbox.rnmbx.components.camera.CameraUpdateQueue.OnCompleteAllListener
import com.mapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.rnmbx.components.camera.CameraUpdateItem
import com.facebook.react.bridge.ReactApplicationContext
import com.mapbox.rnmbx.components.AbstractEventEmitter
import com.mapbox.rnmbx.components.camera.RNMBXCamera
import com.mapbox.rnmbx.components.camera.RNMBXCameraManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import java.util.*

class CameraUpdateQueue {
    private var mQueue: Queue<CameraStop>
    private var mCompleteListener: OnCompleteAllListener? = null

    interface OnCompleteAllListener {
        fun onCompleteAll()
    }

    init {
        mQueue = LinkedList()
    }

    fun offer(item: CameraStop) {
        mQueue.offer(item)
    }

    fun size(): Int {
        return mQueue.size
    }

    val isEmpty: Boolean
        get() = mQueue.isEmpty()

    fun flush() {
        while (mQueue.size > 0) {
            mQueue.remove()
        }
        mQueue = LinkedList()
    }

    fun setOnCompleteAllListener(listener: OnCompleteAllListener?) {
        mCompleteListener = listener
    }

    fun execute(map: RNMBXMapView?) {
        if (mQueue.isEmpty()) {
            mCompleteListener?.let { it.onCompleteAll() }
            return
        }
        val stop = mQueue.poll() ?: return
        val item = stop.toCameraUpdate(map!!)
        item.run()
        execute(map)
    }
}