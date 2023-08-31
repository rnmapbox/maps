package com.mapbox.rctmgl.components.mapview

import android.content.Context
import android.util.Log
import android.view.View
import com.facebook.react.bridge.*

import com.mapbox.rctmgl.components.AbstractEventEmitter
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.rctmgl.events.constants.EventKeys
import com.facebook.react.common.MapBuilder
import com.mapbox.maps.extension.style.layers.properties.generated.ProjectionName
import com.mapbox.maps.plugin.gestures.gestures
import com.mapbox.rctmgl.utils.ConvertUtils
import com.mapbox.rctmgl.utils.ExpressionParser
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.rctmgl.utils.extensions.toCoordinate
import com.mapbox.rctmgl.utils.extensions.toScreenCoordinate
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

open class RCTMGLMapViewManager(context: ReactApplicationContext) :
    AbstractEventEmitter<RCTMGLMapView>(context) {
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
        mapView!!.removeFeatureAt(index)
    }

    fun getMapViewContext(themedReactContext: ThemedReactContext): Context {
        return activity ?: themedReactContext
    }

    override fun createViewInstance(themedReactContext: ThemedReactContext): RCTMGLMapView {
        val context = getMapViewContext(themedReactContext)
        return RCTMGLMapView(context, this, options=null)
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

    @ReactProp(name = "zoomEnabled")
    fun setZoomEnabled(map: RCTMGLMapView, zoomEnabled: Boolean) {
        val mapView = map.mapView
        mapView.gestures.pinchToZoomEnabled = zoomEnabled
        mapView.gestures.doubleTouchToZoomOutEnabled = zoomEnabled
        mapView.gestures.doubleTapToZoomInEnabled = zoomEnabled
    }

    @ReactProp(name = "scrollEnabled")
    fun setScrollEnabled(map: RCTMGLMapView, scrollEnabled: Boolean) {
        val mapView = map.mapView
        mapView.gestures.scrollEnabled = scrollEnabled
    }

    @ReactProp(name = "pitchEnabled")
    fun setPitchEnabled(map: RCTMGLMapView, pitchEnabled: Boolean) {
        val mapView = map.mapView
        mapView.gestures.pitchEnabled = pitchEnabled
    }

    @ReactProp(name = "rotateEnabled")
    fun setRotateEnabled(map: RCTMGLMapView, rotateEnabled: Boolean) {
        val mapView = map.mapView
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

    @ReactProp(name = "requestDisallowInterceptTouchEvent")
    fun setRequestDisallowInterceptTouchEvent(mapView: RCTMGLMapView, requestDisallowInterceptTouchEvent: Boolean) {
        mapView.requestDisallowInterceptTouchEvent = requestDisallowInterceptTouchEvent
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
        return mapOf(
            "_useCommandName" to 1
        );
    }

    override fun receiveCommand(mapView: RCTMGLMapView, command: String, args: ReadableArray?) {
        // allows method calls to work with componentDidMount
        val mapboxMap = mapView.getMapboxMap()
            ?: //            mapView.enqueuePreRenderMapMethod(commandID, args);
            return
        when (command) {
            "queryTerrainElevation" -> {
                val coords = args!!.getArray(1)
                mapView.queryTerrainElevation(
                    args.getString(0),
                    coords.getDouble(0),
                    coords.getDouble(1)
                )
            }
            "getZoom" -> {
                mapView.getZoom(args!!.getString(0));
            }
            "getCenter" -> {
                mapView.getCenter(args!!.getString(0));
            }
            "getPointInView" -> {
                mapView.getPointInView(args!!.getString(0), args.getArray(1).toCoordinate())
            }
            "getCoordinateFromView" -> {
                mapView.getCoordinateFromView(args!!.getString(0), args.getArray(1).toScreenCoordinate());
            }
            "setSourceVisibility" -> {
                mapView!!.setSourceVisibility(
                    args!!.getBoolean(1),
                    args!!.getString(2),
                    args!!.getString(3)
                );
            }
            "queryRenderedFeaturesAtPoint" -> {
                mapView.queryRenderedFeaturesAtPoint(
                    args!!.getString(0),
                    ConvertUtils.toPointF(args!!.getArray(1)),
                    ExpressionParser.from(args!!.getArray(2)),
                    ConvertUtils.toStringList(args!!.getArray(3))
                );
            }
            "queryRenderedFeaturesInRect" -> {
                val layerIds = ConvertUtils.toStringList(args!!.getArray(3))
                mapView.queryRenderedFeaturesInRect(
                        args!!.getString(0),
                        ConvertUtils.toRectF(args.getArray(1)),
                        ExpressionParser.from(args!!.getArray(2)),
                        if (layerIds.size == 0) null else layerIds
                );
            }
            "querySourceFeatures" -> {
                val sourceLayerIds = ConvertUtils.toStringList(args!!.getArray(3))
                mapView.querySourceFeatures(
                        args!!.getString(0),
                        args!!.getString(1),
                        ExpressionParser.from(args!!.getArray(2)),
                        if (sourceLayerIds.size == 0) null else sourceLayerIds
                );
            }
            "getVisibleBounds" -> {
                mapView.getVisibleBounds(args!!.getString(0));
            }
            "takeSnap" -> {
                mapView.takeSnap(args!!.getString(0), args!!.getBoolean(1))
            }
            "setHandledMapChangedEvents" -> {
                args?.let {
                    mapView.setHandledMapChangedEvents(it.getArray(1).asArrayString());
                }
            }
            "clearData" -> {
                mapView.clearData(args!!.getString(0))
            }
            else -> {
                Logger.w("RCTMGLMapView.receiveCommand", "unexpected command: ${command}")
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
    }

    init {
        mViews = HashMap()
    }
}
