package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.mapbox.common.toValue
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent
import com.mapbox.turf.TurfConstants
import com.mapbox.turf.TurfMeasurement
import java.util.Timer
import java.util.TimerTask

class RCTMGLPointSource(context: Context, private val mManager: RCTMGLPointSourceManager): RCTSource<GeoJsonSource>(context) {
    private var mPoint: String? = null
    fun setPoint(point: String) {
        mPoint = point

        val targetPoint = getPointGeometry(point)
        val _prevPoint = lastUpdatedPoint ?: targetPoint
        val _targetPoint = targetPoint

        if (_prevPoint != null && _targetPoint != null) {
            animateToNewPoint(_prevPoint, _targetPoint)
        }
    }

    private var mAnimationDuration: Long? = null
    fun setAnimationDuration(animationDuration: Float) {
        mAnimationDuration = animationDuration.toLong()
    }

    private var mSnapIfDistanceIsGreaterThan: Long? = null
    fun setSnapIfDistanceIsGreaterThan(distance: Float) {
        mSnapIfDistanceIsGreaterThan = distance.toLong()
    }

    private var lastUpdatedPoint: Point? = null
    private var timer: Timer? = null

    override fun addToMap(mapView: RCTMGLMapView) {
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RCTMGLPointSource.addToMap(mapView)
        }
    }

    fun getPointGeometry(pointStr: String): Point? {
        val _pointStr = pointStr ?: return null
        val geometry = Point.fromJson(_pointStr)
        return geometry
    }

    fun applyPointGeometry(currentPoint: Point?) {
        val _mSource = mSource ?: return
        val _style = getStyle()

        if (mMapView == null || mMapView?.isDestroyed == true || _style == null || currentPoint == null) {
            return
        }

        lastUpdatedPoint = currentPoint

        _mSource.geometry(currentPoint)
    }

    fun animateToNewPoint(prevPoint: Point, targetPoint: Point) {
        timer?.cancel()

        val lineBetween = LineString.fromLngLats(
            listOf<Point>(
                prevPoint,
                targetPoint
            )
        )
        val distanceBetween = TurfMeasurement.length(lineBetween, TurfConstants.UNIT_METERS)

        val _mSnapThreshold = mSnapIfDistanceIsGreaterThan?.toLong()
        if( _mSnapThreshold != null && distanceBetween > _mSnapThreshold) {
            applyPointGeometry(targetPoint)
            return
        }

        val _mAnimationDuration = mAnimationDuration?.toLong()
        if (_mAnimationDuration == null || _mAnimationDuration <= 0) {
            applyPointGeometry(targetPoint)
            return
        }

        val fps = 30.0
        var ratio = 0.0

        val durationSec = _mAnimationDuration.toDouble() / 1000.0
        val ratioIncr = 1.0 / (fps * durationSec)
        val period = 1000.0 / fps

        timer = Timer()
        timer?.scheduleAtFixedRate(
            object : TimerTask() {
                override fun run() {
                    runOnUiThread {
                        ratio += ratioIncr
                        if (ratio >= 1) {
                            timer?.cancel()
                            return@runOnUiThread
                        }

                        val point = TurfMeasurement.along(
                            lineBetween,
                            distanceBetween * ratio,
                            TurfConstants.UNIT_METERS
                        )
                        applyPointGeometry(point)
                    }
                }
            }, 0, period.toLong()
        )
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())

        val _mPoint = mPoint
        if (_mPoint != null) {
            builder.data(_mPoint)
        }

        return builder.build()
    }

    private fun getStyle(): Style? {
        return mMap?.getStyle()
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mPoint == null
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }
}