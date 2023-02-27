package com.mapbox.rctmgl.components.mapview

import android.util.Log
import android.view.View
import com.facebook.react.bridge.*

import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rctmgl.events.constants.EventKeys
import com.mapbox.maps.MapboxMap
import com.facebook.react.common.MapBuilder
import com.mapbox.maps.extension.style.layers.properties.generated.ProjectionName
import com.mapbox.maps.plugin.compass.compass
import com.mapbox.maps.plugin.gestures.gestures
import com.mapbox.maps.plugin.logo.logo
import com.mapbox.rctmgl.utils.ConvertUtils
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.utils.extensions.toCoordinate
import com.mapbox.rctmgl.utils.extensions.toScreenCoordinate
import java.lang.Exception
import java.util.HashMap

open class RCTMGLMapViewManager(context: ReactApplicationContext?) :
    AbstractEventEmitter<RCTMGLMapView?>(context) {
    private val mViews: MutableMap<Int, RCTMGLMapView>
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createShadowNodeInstance(): LayoutShadowNode {
        return MapShadowNode(this)
    }

    override fun getShadowNodeClass(): Class<out LayoutShadowNode> {
        return MapShadowNode::class.java
    }

    override fun onAfterUpdateTransaction(mapView: RCTMGLMapView) {
        super.onAfterUpdateTransaction(mapView)
        if (mapView.getMapboxMap() == null) {
            mViews[mapView.id] = mapView
            mapView.init()
        }
    }

    override fun addView(mapView: RCTMGLMapView?, childView: View?, childPosition: Int) {
        mapView!!.addFeature(childView, childPosition)
    }

    override fun getChildCount(mapView: RCTMGLMapView?): Int {
        return mapView!!.featureCount
    }

    override fun getChildAt(mapView: RCTMGLMapView?, index: Int): View? {
        return mapView!!.getFeatureAt(index)
    }

    override fun removeViewAt(mapView: RCTMGLMapView?, index: Int) {
        mapView!!.removeFeature(index)
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RCTMGLMapView {
        return RCTMGLMapView(themedReactContext, this /*, null*/)
    }

    override fun onDropViewInstance(mapView: RCTMGLMapView) {
        val reactTag = mapView.id
        if (mViews.containsKey(reactTag)) {
            mViews.remove(reactTag)
        }
        mapView.onDropViewInstance()
        super.onDropViewInstance(mapView)
    }

    fun getByReactTag(reactTag: Int): RCTMGLMapView? {
        return mViews[reactTag]
    }

    // region React Props
    @ReactProp(name = "projection")
    fun setProjection(mapView: RCTMGLMapView, projection: String?) {
        mapView.setReactProjection( if (projection == "globe") ProjectionName.GLOBE else ProjectionName.MERCATOR )
    }

    @ReactProp(name = "localizeLabels")
    fun setLocalizeLabels(mapView: RCTMGLMapView, localeMap: ReadableMap?) {
        val locale = localeMap?.getString("locale")
        val layerIds = localeMap?.getArray("layerIds")?.toArrayList()?.mapNotNull {it?.toString()}
        mapView.setReactLocalizeLabels(locale, layerIds)
    }

    @ReactProp(name = "styleURL")
    fun setStyleURL(mapView: RCTMGLMapView, styleURL: String?) {
        mapView.setReactStyleURL(styleURL!!)
    }

    @ReactProp(name = "preferredFramesPerSecond")
    fun setPreferredFramesPerSecond(mapView: RCTMGLMapView?, preferredFramesPerSecond: Int) {
        //mapView.setReactPreferredFramesPerSecond(preferredFramesPerSecond);
    }

    @ReactProp(name = "localizeLabels")
    fun setLocalizeLabels(mapView: RCTMGLMapView?, localizeLabels: Boolean) {
        //mapView.setLocalizeLabels(localizeLabels);
    }

    @ReactProp(name = "zoomEnabled")
    fun setZoomEnabled(mapView: RCTMGLMapView, zoomEnabled: Boolean) {
        mapView.gestures.pinchToZoomEnabled = zoomEnabled
        mapView.gestures.doubleTouchToZoomOutEnabled = zoomEnabled
        mapView.gestures.doubleTapToZoomInEnabled = zoomEnabled
    }

    @ReactProp(name = "scrollEnabled")
    fun setScrollEnabled(mapView: RCTMGLMapView, scrollEnabled: Boolean) {
        mapView.gestures.scrollEnabled = scrollEnabled
    }

    @ReactProp(name = "pitchEnabled")
    fun setPitchEnabled(mapView: RCTMGLMapView, pitchEnabled: Boolean) {
        mapView.gestures.pitchEnabled = pitchEnabled
    }

    @ReactProp(name = "rotateEnabled")
    fun setRotateEnabled(mapView: RCTMGLMapView, rotateEnabled: Boolean) {
        mapView.gestures.rotateEnabled = rotateEnabled
    }

    @ReactProp(name = "attributionEnabled")
    fun setAttributionEnabled(mapView: RCTMGLMapView?, attributionEnabled: Boolean?) {
        mapView!!.setReactAttributionEnabled(attributionEnabled);
    }

    @ReactProp(name = "attributionPosition")
    fun setAttributionPosition(mapView: RCTMGLMapView?, attributionPosition: ReadableMap?) {
        mapView!!.setReactAttributionPosition(attributionPosition);
    }

    @ReactProp(name = "attributionViewMargins")
    fun setAttributionViewMargins(mapView: RCTMGLMapView?, scaleBarMargins: ReadableMap?) {
        mapView!!.setReactAttributionViewMargins(scaleBarMargins!!);
    }

    @ReactProp(name = "attributionViewPosition")
    fun setAttributionViewPosition(mapView: RCTMGLMapView?, scaleBarPosition: Int) {
        mapView!!.setReactAttributionViewPosition(scaleBarPosition!!)
    }

    @ReactProp(name = "logoEnabled")
    fun setLogoEnabled(mapView: RCTMGLMapView?, logoEnabled: Boolean?) {
        mapView!!.setReactLogoEnabled(logoEnabled);
    }

    @ReactProp(name = "logoPosition")
    fun setLogoPosition(mapView: RCTMGLMapView?, logoPosition: ReadableMap?) {
        mapView!!.setReactLogoPosition(logoPosition);
    }

    @ReactProp(name = "scaleBarEnabled")
    fun setScaleBarEnabled(mapView: RCTMGLMapView?, scaleBarEnabled: Boolean) {
        mapView!!.setReactScaleBarEnabled(scaleBarEnabled);
    }

    @ReactProp(name = "scaleBarViewMargins")
    fun setScaleBarViewMargins(mapView: RCTMGLMapView?, scaleBarMargins: ReadableMap?) {
        mapView!!.setReactScaleBarViewMargins(scaleBarMargins!!);
    }

    @ReactProp(name = "scaleBarViewPosition")
    fun setScaleBarViewPosition(mapView: RCTMGLMapView?, scaleBarPosition: Int) {
        mapView!!.setReactScaleBarViewPosition(scaleBarPosition!!)
    }

    @ReactProp(name = "scaleBarPosition")
    fun scaleBarViewPosition(mapView: RCTMGLMapView?, scaleBarPosition: ReadableMap) {
        mapView!!.setReactScaleBarPosition(scaleBarPosition)
    }

    @ReactProp(name = "compassEnabled")
    fun setCompassEnabled(mapView: RCTMGLMapView?, compassEnabled: Boolean) {
        mapView!!.setReactCompassEnabled(compassEnabled);
    }

    @ReactProp(name = "compassFadeWhenNorth")
    fun setCompassFadeWhenNorth(mapView: RCTMGLMapView?, compassFadeWhenNorth: Boolean) {
        mapView!!.setReactCompassFadeWhenNorth(compassFadeWhenNorth!!);
    }

    @ReactProp(name = "compassViewMargins")
    fun setCompassViewMargins(mapView: RCTMGLMapView?, compassViewMargins: ReadableMap?) {
        mapView!!.setReactCompassViewMargins(compassViewMargins!!);
    }

    @ReactProp(name = "compassViewPosition")
    fun setCompassViewPosition(mapView: RCTMGLMapView?, compassViewPosition: Int) {
        mapView!!.setReactCompassViewPosition(compassViewPosition!!)
    }

    @ReactProp(name = "compassPosition")
    fun setCompassPosition(mapView: RCTMGLMapView?, compassMargins: ReadableMap) {
        mapView!!.setReactCompassPosition(compassMargins)
    }

    @ReactProp(name = "contentInset")
    fun setContentInset(mapView: RCTMGLMapView?, array: ReadableArray?) {
        //mapView.setReactContentInset(array);
    }

    @ReactProp(name = "tintColor", customType = "Color")
    fun setTintColor(mapView: RCTMGLMapView?, tintColor: Int?) {
        //mapView.setTintColor(tintColor);
    }

    //endregion
    //region Custom Events
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.MAP_CLICK, "onPress")
            .put(EventKeys.MAP_LONG_CLICK, "onLongPress")
            .put(EventKeys.MAP_ONCHANGE, "onMapChange")
            .put(EventKeys.MAP_ON_LOCATION_CHANGE, "onLocationChange")
            .put(EventKeys.MAP_USER_TRACKING_MODE_CHANGE, "onUserTrackingModeChange")
            .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
            .build()
    }

    override fun getCommandsMap(): Map<String, Int>? {
        return MapBuilder.builder<String, Int>()
            .put("queryRenderedFeaturesAtPoint", METHOD_QUERY_FEATURES_POINT)
            .put("queryRenderedFeaturesInRect", METHOD_QUERY_FEATURES_RECT)
            .put("getVisibleBounds", METHOD_VISIBLE_BOUNDS)
            .put("getPointInView", METHOD_GET_POINT_IN_VIEW)
            .put("getCoordinateFromView", METHOD_GET_COORDINATE_FROM_VIEW)
            .put("takeSnap", METHOD_TAKE_SNAP)
            .put("getZoom", METHOD_GET_ZOOM)
            .put("getCenter", METHOD_GET_CENTER)
            .put("setHandledMapChangedEvents", METHOD_SET_HANDLED_MAP_EVENTS)
            .put("showAttribution", METHOD_SHOW_ATTRIBUTION)
            .put("setSourceVisibility", METHOD_SET_SOURCE_VISIBILITY)
            .put("queryTerrainElevation", METHOD_QUERY_TERRAIN_ELEVATION)
            .build()
    }

    override fun receiveCommand(mapView: RCTMGLMapView, commandID: Int, args: ReadableArray?) {
        // allows method calls to work with componentDidMount
        val mapboxMap = mapView.getMapboxMap()
            ?: //            mapView.enqueuePreRenderMapMethod(commandID, args);
            return
        when (commandID) {
            METHOD_QUERY_TERRAIN_ELEVATION -> {
                val coords = args!!.getArray(1)
                mapView.queryTerrainElevation(
                    args.getString(0),
                    coords.getDouble(0),
                    coords.getDouble(1)
                )
            }
            METHOD_GET_ZOOM -> {
                mapView.getZoom(args!!.getString(0));
            }
            METHOD_GET_CENTER -> {
                mapView.getCenter(args!!.getString(0));
            }
            METHOD_GET_POINT_IN_VIEW -> {
                mapView.getPointInView(args!!.getString(0), args.getArray(1).toCoordinate())
            }
            METHOD_GET_COORDINATE_FROM_VIEW -> {
                mapView.getCoordinateFromView(args!!.getString(0), args.getArray(1).toScreenCoordinate());
            }
            METHOD_SET_SOURCE_VISIBILITY -> {
                mapView!!.setSourceVisibility(
                    args!!.getBoolean(1),
                    args!!.getString(2),
                    args!!.getString(3)
                );
            }
            METHOD_QUERY_FEATURES_POINT -> {
                mapView.queryRenderedFeaturesAtPoint(
                    args!!.getString(0),
                    ConvertUtils.toPointF(args!!.getArray(1)),
                    ExpressionParser.from(args!!.getArray(2)),
                    ConvertUtils.toStringList(args!!.getArray(3))
                );
            }
            METHOD_QUERY_FEATURES_RECT -> {
                val layerIds = ConvertUtils.toStringList(args!!.getArray(3))
                mapView.queryRenderedFeaturesInRect(
                        args!!.getString(0),
                        ConvertUtils.toRectF(args.getArray(1)),
                        ExpressionParser.from(args!!.getArray(2)),
                        if (layerIds.size == 0) null else layerIds
                );
            }
            METHOD_VISIBLE_BOUNDS -> {
                mapView.getVisibleBounds(args!!.getString(0));
            }
            METHOD_TAKE_SNAP -> {
                mapView.takeSnap(args!!.getString(0), args!!.getBoolean(1))
            }
        }
        /*
        switch (commandID) {
            case METHOD_TAKE_SNAP:
                mapView.takeSnap(args.getString(0), args.getBoolean(1));
                break;
            case METHOD_SET_HANDLED_MAP_EVENTS:
                if(args != null) {
                    ArrayList<String> eventsArray = new ArrayList<>();
                    for (int i = 1; i < args.size(); i++) {
                        eventsArray.add(args.getString(i));
                    }
                    mapView.setHandledMapChangedEvents(eventsArray);
                }
                break;
            case METHOD_SHOW_ATTRIBUTION:
                mapView.showAttribution();
                break;


        }*/
    }
    //endregion

    private class MapShadowNode(private val mViewManager: RCTMGLMapViewManager) :
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
        const val LOG_TAG = "RCTMGLMapViewManager"
        const val REACT_CLASS = "RCTMGLMapView"

        //endregion
        //region React Methods
        const val METHOD_QUERY_FEATURES_POINT = 2
        const val METHOD_QUERY_FEATURES_RECT = 3
        const val METHOD_VISIBLE_BOUNDS = 4
        const val METHOD_GET_POINT_IN_VIEW = 5
        const val METHOD_GET_COORDINATE_FROM_VIEW = 6
        const val METHOD_TAKE_SNAP = 7
        const val METHOD_GET_ZOOM = 8
        const val METHOD_GET_CENTER = 9
        const val METHOD_SET_HANDLED_MAP_EVENTS = 10
        const val METHOD_SHOW_ATTRIBUTION = 11
        const val METHOD_SET_SOURCE_VISIBILITY = 12
        const val METHOD_QUERY_TERRAIN_ELEVATION = 13
    }

    init {
        mViews = HashMap()
    }
}
