package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import android.util.Log
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.maps.logD
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent

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

        val _mPoint = mPoint
        if (_mPoint != null) {
            builder.data(_mPoint)
        }

        return builder.build()
    }

    private fun updateStyle() {
        val _mSource = mSource ?: return
        val _mPoint = mPoint ?: return
        val _mMapView = mMapView ?: return
        if (_mMapView.isDestroyed) {
            return
        }
        val _mMap = mMap ?: return

        _mSource.data(_mPoint)
        _mMap.getStyle()?.setStyleSourceProperty(iD!!, "data", Value.valueOf(_mPoint))
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mPoint == null
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }
}
