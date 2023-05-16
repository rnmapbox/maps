package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.rctmgl.utils.ImageEntry
import android.graphics.drawable.BitmapDrawable
import com.facebook.react.bridge.ReadableMap
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.mapbox.rctmgl.events.AndroidCallbackEvent
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.Geometry
import com.mapbox.maps.*
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.rctmgl.utils.Logger
import java.net.URL
import java.util.ArrayList
import java.util.HashMap

class RCTMGLPointSource(context: Context, private val mManager: RCTMGLPointSourceManager) :
    RCTSource<GeoJsonSource>(context) {
    private var mPoint: String? = null
    private var mAnimationDuration: Float? = null

    fun setPoint(point: String) {
        mPoint = point
        updateStyle()
    }

    fun setAnimationDuration(animationDuration: Float) {
        mAnimationDuration = animationDuration
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RCTMGLPointSource.addToMap(mapView)
        }
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())

        if (mPoint != null) {
            builder.data(mPoint!!)
        }

        return builder.build()
    }

    fun updateStyle() {
        val mSource = mSource ?: return
        val mPoint = mPoint ?: return
        val mMapView = mMapView ?: return
        if (mMapView.isDestroyed) {
            return
        }
        val mMap = mMap ?: return

        mSource.data(mPoint)
        mMap.getStyle()?.setStyleSourceProperty(iD!!, "data", Value.valueOf(mPoint))
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mPoint == null
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }
}
