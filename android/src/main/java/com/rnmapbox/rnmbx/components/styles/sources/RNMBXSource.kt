package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.maps.extension.style.sources.getSource
import com.mapbox.maps.extension.style.sources.addSource
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.maps.MapboxMap
import com.rnmapbox.rnmbx.components.styles.sources.AbstractSourceConsumer
import com.facebook.react.bridge.ReadableMap
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXSource
import android.graphics.PointF
import android.view.View
import com.facebook.react.common.MapBuilder
import com.mapbox.geojson.Feature
import com.mapbox.maps.Style
import com.mapbox.maps.extension.style.StyleContract
import com.mapbox.maps.extension.style.sources.Source
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXSource.OnPressEvent
import com.rnmapbox.rnmbx.utils.LatLng
import com.rnmapbox.rnmbx.utils.Logger
import java.lang.ClassCastException
import java.util.ArrayList
import java.util.HashMap

data class FeatureInfo(val feature: AbstractMapFeature?, var added: Boolean) {
}

abstract class RNMBXSource<T : Source?>(context: Context?) : AbstractMapFeature(context) {
    @JvmField
    var mMap: MapboxMap? = null
    var iD: String? = null
    @JvmField
    protected var mSource: T? = null
    protected var mHasPressListener = false
    protected var mTouchHitbox: Map<String, Double>? = null
    private var mSubFeatures = mutableListOf<FeatureInfo>()

    val layerIDs: List<String>
        get() {
           return mSubFeatures.mapIndexed { index, featureInfo ->
                if (featureInfo.added && featureInfo.feature is AbstractSourceConsumer)  {
                    featureInfo.feature.iD
                } else {
                    null
                }
            }.filterNotNull()
        }

    abstract fun hasNoDataSoRefersToExisting(): Boolean;

    public var mExisting: Boolean? = null

    val existing: Boolean
        get() {
            var result: Boolean = false
            mExisting?.also {
                result = it
            } ?: run {
                if (hasNoDataSoRefersToExisting()) {
                    Logger.w(
                        LOG_TAG,
                        "RNMBXSource: source with id: $id seems to refer to existing value but existing flag is not set. This is deprecated."
                    )
                    result = true
                } else {
                    result = false
                }
            }
            return result
        }

    private fun getSourceAs(style: Style, id: String?): T? {
        val result = iD?.let { style.getSource(it) }
        return try {
            result as T?
        } catch (exception: ClassCastException) {
            null
        }
    }

    open fun hasPressListener(): Boolean {
        return mHasPressListener
    }

    fun setHasPressListener(hasPressListener: Boolean) {
        mHasPressListener = hasPressListener
    }

    fun setHitbox(map: ReadableMap) {
        val hitbox: MutableMap<String, Double> = HashMap()
        hitbox["width"] = map.getDouble("width")
        hitbox["height"] = map.getDouble("height")
        mTouchHitbox = hitbox
    }

    val touchHitbox: Map<String, Double>?
        get() {
            if (!hasPressListener()) {
                return null
            }
            return if (mTouchHitbox == null) {
                MapBuilder.builder<String, Double>()
                        .put("width", DEFAULT_HITBOX_WIDTH)
                        .put("height", DEFAULT_HITBOX_HEIGHT)
                        .build()
            } else mTouchHitbox
        }

    fun addToMap(existings: Boolean, style: Style, mapView: RNMBXMapView) {
        mSource = null
        val existingSource = getSourceAs(style, iD)
        if (existingSource != null) {
            mSource = existingSource
            if (!existings) {
                Logger.w(LOG_TAG, "Source $iD was not marked as existing but found in style, it's deprecated: https://github.com/rnmapbox/maps/wiki/Deprecated-ExistingSourceLayer")
            }
        } else {
            if (existings) {
                Logger.w(
                    LOG_TAG,
                    "Source $iD was marked as existing but was not found in style, it's deprecated: https://github.com/rnmapbox/maps/wiki/Deprecated-ExistingSourceLayer"
                )
            }
        }
        if (mSource == null) {
            mSource = makeSource()
            style.addSource(mSource as StyleContract.StyleSourceExtension)
        }
        mSubFeatures?.forEach {
            it.feature?.let {
                it.addToMap(mapView)
            }
            it.added = true
        }
     }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mMap = mapView.getMapboxMap()
        val map = mMap
        if (map == null) {
            Logger.e("RNMBXSource", "map is exepted to be valid but was null, $iD")
            return
        }
        val style = map.getStyle()
        if (existing || style == null) {
            map.getStyle(object : Style.OnStyleLoaded {
                override fun onStyleLoaded(style: Style) {
                    addToMap(existing, style, mapView)
                }
            })
        } else {
            addToMap(existing, style, mapView)
        }

    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {

        mSubFeatures.forEach { it
            var featureInfo = it
            featureInfo.feature?.let {
                if (it.removeFromMap(mapView, reason)) {
                    featureInfo.added = false
                }
            }
        }
        if (mMap != null && mSource != null && mMap!!.getStyle() != null) {
            try {
                iD?.let { mMap?.getStyle()?.removeStyleSource(it) }
            } catch (ex: Throwable) {
                Logger.w(LOG_TAG, String.format("RNMBXSource.removeFromMap: %s - %s", mSource, ex.message), ex)
            }
        }
        return super.removeFromMap(mapView, reason)
    }

    fun addLayer(childView: View?, childPosition: Int) {
        var feature: AbstractMapFeature? = null
        if (childView !is AbstractMapFeature) {
            Logger.w(LOG_TAG, "Attempted to insert view: $childView to shape source: $iD, since it's not a MapFeature it will not be added")
        } else {
            feature = childView
        }

        val mapView = mMapView

        val added = if (mapView != null && feature != null) {
            feature.addToMap(mapView)
            true
        } else {
            false
        }
        mSubFeatures.add(childPosition, FeatureInfo(feature, added))
    }

    fun removeLayer(childPosition: Int) {
        var featureInfo = mSubFeatures[childPosition]
        if (featureInfo.added) {
            val mapView = mMapView
            if (mapView != null) {
                featureInfo.feature?.let { it.removeFromMap(mapView, RemovalReason.VIEW_REMOVAL) }
            }
            featureInfo.added = false
        }
        mSubFeatures.removeAt(childPosition)
    }

    val childViews: List<AbstractMapFeature>
        get() = mSubFeatures.map { it.feature }.filterNotNull()

    override fun getChildAt(childPosition: Int): View {
        return childViews[childPosition]
    }

    override fun getChildCount(): Int {
        return childViews.size;
    }


    abstract fun makeSource(): T
    class OnPressEvent(var features: List<Feature>, var latLng: LatLng, var screenPoint: PointF)

    abstract fun onPress(event: OnPressEvent?)

    companion object {
        const val DEFAULT_ID = "composite"
        const val LOG_TAG = "RNMBXSource"
        const val DEFAULT_HITBOX_WIDTH = 44.0
        const val DEFAULT_HITBOX_HEIGHT = 44.0
        @JvmStatic
        fun isDefaultSource(sourceID: String): Boolean {
            return DEFAULT_ID == sourceID
        }
    }

    init {
    }
}