package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.UiThreadUtil.runOnUiThread
import com.mapbox.common.toValue
import com.mapbox.geojson.LineString
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent
import com.mapbox.turf.TurfConstants
import com.mapbox.turf.TurfMeasurement
import com.mapbox.turf.TurfMisc
import java.util.Timer
import java.util.TimerTask

class RCTMGLLineSource(context: Context, private val mManager: RCTMGLLineSourceManager): RCTSource<GeoJsonSource>(context) {
    private var mLineString: String? = null
    fun setLineString(lineString: String) {
        mLineString = lineString

        timer?.cancel()
        currentStartOffset = 0.0
        currentEndOffset = 0.0

        applyLineGeometry()
    }

    private var mStartOffset: Double? = null
    fun setStartOffset(startOffset: Double) {
        mStartOffset = startOffset
        animateToNewStartOffset(currentStartOffset, startOffset)
    }

    private var mEndOffset: Double? = null
    fun setEndOffset(endOffset: Double) {
        mEndOffset = endOffset
        animateToNewEndOffset(currentStartOffset, endOffset)
    }

    private var mAnimationDuration: Long? = null
    fun setAnimationDuration(animationDuration: Float) {
        mAnimationDuration = animationDuration.toLong()
    }

    private var currentStartOffset: Double = 0.0
    private var currentEndOffset: Double = 0.0
    private var timer: Timer? = null

    override fun addToMap(mapView: RCTMGLMapView) {
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RCTMGLLineSource.addToMap(mapView)
        }
    }

    fun buildLineGeometry(): LineString? {
        val _lineStr = mLineString ?: return null
        val geometry = LineString.fromJson(_lineStr)
        return geometry
    }

    fun applyLineGeometry() {
        val _mSource = mSource ?: return
        val _style = getStyle()
        val _geometry = buildLineGeometry()

        if (mMapView == null || mMapView?.isDestroyed == true || _style == null || _geometry == null) {
            return
        }

        val length = TurfMeasurement.length(_geometry, TurfConstants.UNIT_METERS)
        val geometryTrimmed = TurfMisc.lineSliceAlong(
            _geometry,
            currentStartOffset,
            length - currentEndOffset,
            TurfConstants.UNIT_METERS
        )

        val geometryStr = geometryTrimmed.toJson()
        _mSource.data(geometryStr)
        _style.setStyleSourceProperty(iD!!, "data", geometryStr.toValue())
    }

    fun animateToNewStartOffset(prevOffset: Double, targetOffset: Double?) {
        val targetOffset = targetOffset ?: return

        timer?.cancel()

        val _mAnimationDuration = mAnimationDuration?.toLong()
        if (_mAnimationDuration == null || _mAnimationDuration <= 0) {
            applyLineGeometry()
            return
        }

        val fps = 30.0
        var ratio = 0.0

        val frameCt = _mAnimationDuration / 1000
        val ratioIncr = 1 / (fps * frameCt)
        val period = 1000 / fps

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

                        val progress = (targetOffset - prevOffset) * ratio
                        currentStartOffset = prevOffset + progress
                        applyLineGeometry()
                    }
                }
            }, 0, period.toLong()
        )
    }

    fun animateToNewEndOffset(prevOffset: Double, targetOffset: Double?) {
        Log.d("RCTMGLLineSource","animateToNewEndOffset is not implemented")
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())

        val _mLine = mLineString
        if (_mLine != null) {
            builder.data(_mLine)
        }

        return builder.build()
    }

    private fun getStyle(): Style? {
        return mMap?.getStyle()
    }

    override fun hasNoDataSoRefersToExisting(): Boolean {
        return mLineString == null
    }

    override fun onPress(event: OnPressEvent?) {
        mManager.handleEvent(FeatureClickEvent.makeShapeSourceEvent(this, event))
    }
}