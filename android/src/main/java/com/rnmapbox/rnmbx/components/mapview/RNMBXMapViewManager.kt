package com.rnmapbox.rnmbx.components.mapview

import android.content.Context
import android.util.Log
import android.view.View
import com.facebook.react.bridge.*

import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMapViewManagerDelegate
import com.facebook.react.viewmanagers.RNMBXMapViewManagerInterface
import com.mapbox.maps.MapInitOptions
import com.mapbox.maps.extension.style.layers.properties.generated.ProjectionName
import com.mapbox.maps.plugin.gestures.gestures
import com.mapbox.maps.plugin.logo.logo
import com.rnmapbox.rnmbx.events.AndroidCallbackEvent
import com.rnmapbox.rnmbx.events.constants.eventMapOf
import com.rnmapbox.rnmbx.utils.ConvertUtils
import com.rnmapbox.rnmbx.utils.ExpressionParser
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.ViewTagResolver
import com.rnmapbox.rnmbx.utils.extensions.getAndLogIfNotBoolean
import com.rnmapbox.rnmbx.utils.extensions.getAndLogIfNotDouble
import com.rnmapbox.rnmbx.utils.extensions.toCoordinate
import com.rnmapbox.rnmbx.utils.extensions.toRectF
import com.rnmapbox.rnmbx.utils.extensions.toScreenCoordinate
import java.lang.Exception
import java.util.HashMap

fun ReadableArray.forEachString(action: (String) -> Unit) {
    for (i in 0 until size()) {
        action(getString(i))
    }
}

fun ReadableArray.asArrayString(): Array<String> {
    val result = Array<String>(size()) {
        getString(it)
    }
    return result
}

interface CommandResponse {
    fun success(builder: (WritableMap) -> Unit)
    fun error(message: String)
}

open class RNMBXMapViewManager(context: ReactApplicationContext, val viewTagResolver: ViewTagResolver) :
    AbstractEventEmitter<RNMBXMapView>(context), RNMBXMapViewManagerInterface<RNMBXMapView> {
    private val mViews: MutableMap<Int, RNMBXMapView>

    private val mDelegate: ViewManagerDelegate<RNMBXMapView>

    init {
        mDelegate = RNMBXMapViewManagerDelegate<RNMBXMapView, RNMBXMapViewManager>(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXMapView>? {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createShadowNodeInstance(): LayoutShadowNode {
        return MapShadowNode(this)
    }

    override fun getShadowNodeClass(): Class<out LayoutShadowNode> {
        return MapShadowNode::class.java
    }

    override fun onAfterUpdateTransaction(mapView: RNMBXMapView) {
        super.onAfterUpdateTransaction(mapView)
        val first = !mapView.isInitialized
        mapView.applyAllChanges()
        if (first) {
            mViews[mapView.id] = mapView
            mapView.init()
        }
    }

    override fun addView(mapView: RNMBXMapView, childView: View, childPosition: Int) {
        mapView.addFeature(childView, childPosition)
    }

    override fun getChildCount(mapView: RNMBXMapView): Int {
        return mapView.featureCount
    }

    override fun getChildAt(mapView: RNMBXMapView, index: Int): View? {
        return mapView.getFeatureAt(index)
    }

    override fun removeViewAt(mapView: RNMBXMapView, index: Int) {
        mapView.removeFeatureAt(index)
    }

    fun getMapViewContext(themedReactContext: ThemedReactContext): Context {
        return activity ?: themedReactContext
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RNMBXMapView {
        val context = getMapViewContext(themedReactContext)
        return RNMBXMapView(context, this, options=null)
    }

    override fun onDropViewInstance(mapView: RNMBXMapView) {
        val reactTag = mapView.id

        viewTagResolver.viewRemoved(reactTag)

        if (mViews.containsKey(reactTag)) {
            mViews.remove(reactTag)
        }
        mapView.onDropViewInstance()
        super.onDropViewInstance(mapView)
    }

    fun getByReactTag(reactTag: Int): RNMBXMapView? {
        return mViews[reactTag]
    }

    fun tagAssigned(reactTag: Int) {
        return viewTagResolver.tagAssigned(reactTag)
    }

    // region React Props
    @ReactProp(name = "projection")
    override fun setProjection(mapView: RNMBXMapView, projection: Dynamic) {
        mapView.setReactProjection( if (projection.asString() == "globe") ProjectionName.GLOBE else ProjectionName.MERCATOR )
    }

    @ReactProp(name = "localizeLabels")
    override fun setLocalizeLabels(mapView: RNMBXMapView, localeMap: Dynamic) {
        val locale = localeMap.asMap().getString("locale")
        val layerIds = localeMap.asMap().getArray("layerIds")?.toArrayList()?.mapNotNull {it.toString()}
        mapView.setReactLocalizeLabels(locale, layerIds)
    }

    @ReactProp(name = "surfaceView")
    override fun setSurfaceView(mapView: RNMBXMapView, value: Dynamic) {
        if (mapView.isInitialized) {
            if (mapView.surfaceView != value.asBoolean()) {
                Logger.d(LOG_TAG, "surafaceView cannot be changed on existing map")
            }
        } else {
            mapView.surfaceView = value.asBoolean()
        }
    }

    @ReactProp(name = "gestureSettings")
    override fun setGestureSettings(mapView: RNMBXMapView, settings: Dynamic) {
        mapView.withMap {
           it.gesturesPlugin {
               val map = settings.asMap()
               this.updateSettings {
                   map.getAndLogIfNotBoolean("doubleTapToZoomInEnabled", LOG_TAG)?.let {
                       this.doubleTapToZoomInEnabled = it
                   }
                   map.getAndLogIfNotBoolean("doubleTouchToZoomOutEnabled", LOG_TAG)?.let {
                       this.doubleTouchToZoomOutEnabled = it
                   }
                   map.getAndLogIfNotBoolean("pinchPanEnabled", LOG_TAG)?.let {
                       this.pinchScrollEnabled = it
                   }
                   map.getAndLogIfNotBoolean("pinchZoomEnabled", LOG_TAG)?.let {
                       this.pinchToZoomEnabled = it
                   }
                   map.getAndLogIfNotBoolean("pinchZoomDecelerationEnabled", LOG_TAG)?.let {
                       this.pinchToZoomDecelerationEnabled = it
                   }
                   map.getAndLogIfNotBoolean("pitchEnabled", LOG_TAG)?.let {
                       this.pitchEnabled = it
                   }
                   map.getAndLogIfNotBoolean("quickZoomEnabled", LOG_TAG)?.let {
                       this.quickZoomEnabled = it
                   }
                   map.getAndLogIfNotBoolean("rotateEnabled", LOG_TAG)?.let {
                       this.rotateEnabled = it
                   }
                   map.getAndLogIfNotBoolean("rotateDecelerationEnabled", LOG_TAG)?.let {
                       this.rotateDecelerationEnabled = it
                   }
                   map.getAndLogIfNotBoolean("panEnabled", LOG_TAG)?.let {
                       this.scrollEnabled = it
                   }
                   map.getAndLogIfNotDouble("panDecelerationFactor", LOG_TAG)?.let {
                       this.scrollDecelerationEnabled = it > 0.0
                   }
                   map.getAndLogIfNotBoolean("simultaneousRotateAndPinchToZoomEnabled", LOG_TAG)?.let {
                       this.simultaneousRotateAndPinchToZoomEnabled = it
                   }
                   map.getAndLogIfNotDouble("zoomAnimationAmount", LOG_TAG)?.let {
                       this.zoomAnimationAmount = it.toFloat()
                   }
               }
           }
        }
    }

    @ReactProp(name = "styleURL")
    override fun setStyleURL(mapView: RNMBXMapView, styleURL:Dynamic) {
        mapView.setReactStyleURL(styleURL.asString())
    }

    @ReactProp(name = "preferredFramesPerSecond") @Suppress("UNUSED_PARAMETER")
    fun setPreferredFramesPerSecond(mapView: RNMBXMapView, preferredFramesPerSecond: Int) {
        //mapView.setReactPreferredFramesPerSecond(preferredFramesPerSecond);
    }

    @ReactProp(name = "zoomEnabled")
    override fun setZoomEnabled(map: RNMBXMapView, zoomEnabled: Dynamic) {
        map.withMapView {
            it.gestures.pinchToZoomEnabled = zoomEnabled.asBoolean()
            it.gestures.doubleTouchToZoomOutEnabled = zoomEnabled.asBoolean()
            it.gestures.doubleTapToZoomInEnabled = zoomEnabled.asBoolean()
        }
    }

    @ReactProp(name = "scrollEnabled")
    override fun setScrollEnabled(map: RNMBXMapView, scrollEnabled: Dynamic) {
        map.withMapView {
            it.gestures.scrollEnabled = scrollEnabled.asBoolean()
        }
    }

    @ReactProp(name = "pitchEnabled")
    override fun setPitchEnabled(map: RNMBXMapView, pitchEnabled: Dynamic) {
        map.withMapView {
            it.gestures.pitchEnabled = pitchEnabled.asBoolean()
        }
    }

    @ReactProp(name = "rotateEnabled")
    override fun setRotateEnabled(map: RNMBXMapView, rotateEnabled: Dynamic) {
        map.withMapView {
           it.gestures.rotateEnabled = rotateEnabled.asBoolean()
        }
    }

    @ReactProp(name = "attributionEnabled")
    override fun setAttributionEnabled(mapView: RNMBXMapView, attributionEnabled: Dynamic) {
        mapView.setReactAttributionEnabled(attributionEnabled.asBoolean())
    }

    @ReactProp(name = "attributionPosition")
    override fun setAttributionPosition(mapView: RNMBXMapView, attributionPosition: Dynamic) {
        mapView.setReactAttributionPosition(attributionPosition.asMap())
    }

    @ReactProp(name = "attributionViewMargins")
    override fun setAttributionViewMargins(mapView: RNMBXMapView, scaleBarMargins: Dynamic) {
        mapView.setReactAttributionViewMargins(scaleBarMargins.asMap())
    }

    @ReactProp(name = "attributionViewPosition")
    override fun setAttributionViewPosition(mapView: RNMBXMapView, attributionViewPosition: Dynamic) {
        mapView.setReactAttributionViewPosition(attributionViewPosition.asInt())
    }

    @ReactProp(name = "logoEnabled")
    override fun setLogoEnabled(mapView: RNMBXMapView, logoEnabled: Dynamic) {
        mapView.setReactLogoEnabled(logoEnabled.asBoolean())
    }

    @ReactProp(name = "logoPosition")
    override fun setLogoPosition(mapView: RNMBXMapView, logoPosition: Dynamic) {
        mapView.setReactLogoPosition(logoPosition.asMap())
    }

    @ReactProp(name = "scaleBarEnabled")
    override fun setScaleBarEnabled(mapView: RNMBXMapView, scaleBarEnabled: Dynamic) {
        mapView.setReactScaleBarEnabled(scaleBarEnabled.asBoolean())
    }

    @ReactProp(name = "scaleBarViewMargins")
    override fun setScaleBarViewMargins(mapView: RNMBXMapView, scaleBarMargins: Dynamic) {
        mapView.setReactScaleBarViewMargins(scaleBarMargins.asMap())
    }

    @ReactProp(name = "scaleBarPosition")
    override fun setScaleBarPosition(mapView: RNMBXMapView, scaleBarPosition: Dynamic) {
        mapView.setReactScaleBarPosition(scaleBarPosition.asMap())
    }

    @ReactProp(name = "compassEnabled")
    override fun setCompassEnabled(mapView: RNMBXMapView, compassEnabled: Dynamic) {
        mapView.setReactCompassEnabled(compassEnabled.asBoolean())
    }

    @ReactProp(name = "compassFadeWhenNorth")
    override fun setCompassFadeWhenNorth(mapView: RNMBXMapView, compassFadeWhenNorth: Dynamic) {
        mapView.setReactCompassFadeWhenNorth(compassFadeWhenNorth.asBoolean())
    }

    @ReactProp(name = "compassViewMargins")
    override fun setCompassViewMargins(mapView: RNMBXMapView, compassViewMargins: Dynamic) {
        mapView.setReactCompassViewMargins(compassViewMargins.asMap())
    }

    @ReactProp(name = "compassViewPosition")
    override fun setCompassViewPosition(mapView: RNMBXMapView, compassViewPosition: Dynamic) {
        mapView.setReactCompassViewPosition(compassViewPosition.asInt())
    }

    @ReactProp(name = "compassPosition")
    override fun setCompassPosition(mapView: RNMBXMapView, compassMargins: Dynamic) {
        mapView.setReactCompassPosition(compassMargins.asMap())
    }

    @ReactProp(name = "contentInset") @Suppress("UNUSED_PARAMETER")
    fun setContentInset(mapView: RNMBXMapView, array: ReadableArray) {
        // remember to add it to codegen if it will be used
        //mapView.setReactContentInset(array);
    }

    @ReactProp(name = "tintColor", customType = "Color") @Suppress("UNUSED_PARAMETER")
    fun setTintColor(mapView: RNMBXMapView, tintColor: Int) {
        // remember to add it to codegen if it will be used
        //mapView.setTintColor(tintColor);
    }

    @ReactProp(name = "requestDisallowInterceptTouchEvent")
    override fun setRequestDisallowInterceptTouchEvent(mapView: RNMBXMapView, requestDisallowInterceptTouchEvent: Dynamic) {
        mapView.requestDisallowInterceptTouchEvent = requestDisallowInterceptTouchEvent.asBoolean()
    }

    @ReactProp(name = "deselectAnnotationOnTap")
    override fun setDeselectAnnotationOnTap(mapView: RNMBXMapView, value: Dynamic?) {
        value?.let {
            mapView.deselectAnnotationOnTap = it.asBoolean()
        }
    }

    @ReactProp(name = "mapViewImpl")
    override fun setMapViewImpl(mapView: RNMBXMapView, value: Dynamic?) {
        value?.let {
            mapView.mapViewImpl = it.asString()
        }
    }

    override fun setCompassImage(view: RNMBXMapView, value: Dynamic?) {
        // TODO: No-op on Android?
    }

    //endregion
    //region Custom Events
    override fun customEvents(): Map<String, String>? {
        return eventMapOf(
            EventKeys.MAP_CLICK to "onPress",
            EventKeys.MAP_LONG_CLICK to "onLongPress",
            EventKeys.MAP_ONCHANGE to "onMapChange",
            EventKeys.MAP_ON_LOCATION_CHANGE to "onLocationChange",
            EventKeys.MAP_USER_TRACKING_MODE_CHANGE to "onUserTrackingModeChange",
            EventKeys.MAP_ANDROID_CALLBACK to "onAndroidCallback"
        )
    }

    override fun getCommandsMap(): Map<String, Int>? {
        return mapOf(
            "_useCommandName" to 1
        );
    }
    //endregion

    private class MapShadowNode(private val mViewManager: RNMBXMapViewManager) :
        LayoutShadowNode() {
        override fun dispose() {
            super.dispose()
            diposeNativeMapView()
        }

        /**
         * We need this mapview to dispose (calls into nativeMap.destroy) before ReactNative starts tearing down the views in
         * onDropViewInstance.
         */
        private fun diposeNativeMapView() {
            val mapView = mViewManager.getByReactTag(reactTag)
            if (mapView != null) {
                UiThreadUtil.runOnUiThread {
                    try {
//                            mapView.dispose();
                    } catch (ex: Exception) {
                        Log.e(LOG_TAG, " disposeNativeMapView() exception destroying map view", ex)
                    }
                }
            }
        }
    }

    companion object {
        const val LOG_TAG = "RNMBXMapViewManager"
        const val REACT_CLASS = "RNMBXMapView"
    }

    init {
        mViews = HashMap()
    }
}
