package com.mapbox.rctmgl.components.styles.sources

import android.animation.ValueAnimator
import android.content.Context
import android.util.Log
import android.view.animation.LinearInterpolator
import com.mapbox.common.toValue
import com.mapbox.geojson.Point
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.sources.generated.GeoJsonSource
import com.mapbox.maps.plugin.animation.animator.Evaluators
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.events.FeatureClickEvent


class RCTMGLPointSource(context: Context, private val mManager: RCTMGLPointSourceManager) :
    RCTSource<GeoJsonSource>(context) {
    private var mPoint: String? = null
    fun setPoint(point: String) {
        mPoint = point
        val targetPoint = getPointGeometry()
        val _prevPoint = lastUpdatedPoint
        val _targetPoint = targetPoint
        if (_prevPoint != null && _targetPoint != null) {
            animateToNewOffset(_prevPoint, _targetPoint)
        }

        lastUpdatedPoint = targetPoint
    }

    private var mAnimationDuration: Long? = null
    fun setAnimationDuration(animationDuration: Float) {
        mAnimationDuration = animationDuration.toLong()
    }

    private var lastUpdatedPoint: Point? = null
    private var animator: ValueAnimator? = null

    override fun addToMap(mapView: RCTMGLMapView) {
        mapView.getMapboxMap().getStyle {
            val map = mapView.getMapboxMap()
            super@RCTMGLPointSource.addToMap(mapView)
        }
    }

    fun animateToNewOffset(prevPoint: Point, targetPoint: Point) {
        if (animator != null) {
            animator!!.cancel()
        }

        animator = ValueAnimator.ofObject(Evaluators.POINT, prevPoint, targetPoint)
        animator!!.duration = mAnimationDuration ?: 0
        animator!!.interpolator = LinearInterpolator()
        animator!!.addUpdateListener { anim ->
            val nextPoint = anim.animatedValue as Point
            refresh(nextPoint)
        }
        animator!!.start()
    }

    fun refresh(currentPoint: Point?) {
        val _mSource = mSource ?: return
        val _mPoint = mPoint ?: return

        if (mMapView == null || mMapView?.isDestroyed == true) {
            return
        }

        val geometryStr = currentPoint?.toJson()
        _mSource.data(geometryStr!!)

        val style = getStyle()
        style?.setStyleSourceProperty(iD!!, "data", geometryStr.toValue())
    }

    override fun makeSource(): GeoJsonSource {
        val builder = GeoJsonSource.Builder(iD.toString())

        val _mPoint = mPoint
        if (_mPoint != null) {
            builder.data(_mPoint)
        }

        return builder.build()
    }

    private fun getPointGeometry(): Point? {
        val _mPoint = mPoint ?: return null
        val geometry = Point.fromJson(_mPoint)
        return geometry
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
