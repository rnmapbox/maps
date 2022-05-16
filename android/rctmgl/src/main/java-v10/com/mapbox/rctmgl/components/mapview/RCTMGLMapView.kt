package com.mapbox.rctmgl.components.mapview

import android.content.Context
import com.mapbox.maps.extension.style.layers.getLayer
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.AnnotationPlugin
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrain
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener
import com.mapbox.maps.extension.observable.eventdata.MapLoadingErrorEventData
import android.graphics.PointF
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import android.graphics.BitmapFactory
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.mapbox.geojson.Feature
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadedListener
import com.mapbox.maps.extension.style.layers.Layer
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.mapbox.maps.plugin.compass.compass
import com.mapbox.maps.plugin.gestures.*
import com.mapbox.rctmgl.R
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation
import com.mapbox.rctmgl.components.camera.RCTMGLCamera
import com.mapbox.rctmgl.components.images.RCTMGLImages
import com.mapbox.rctmgl.components.location.LocationComponentManager
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocation
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker
import com.mapbox.rctmgl.components.styles.layers.RCTLayer
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight
import com.mapbox.rctmgl.components.styles.sources.RCTSource
import com.mapbox.rctmgl.events.AndroidCallbackEvent
import com.mapbox.rctmgl.events.IEvent
import com.mapbox.rctmgl.events.MapChangeEvent
import com.mapbox.rctmgl.events.MapClickEvent
import com.mapbox.rctmgl.events.constants.EventTypes
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.utils.LatLng
import com.mapbox.rctmgl.utils.Logger
import org.json.JSONException
import org.json.JSONObject
import java.lang.Exception
import java.util.*

open class RCTMGLMapView(private val mContext: Context, var mManager: RCTMGLMapViewManager /*, MapboxMapOptions options*/) : MapView(mContext), OnMapClickListener {
    private val mSources: MutableMap<String, RCTSource<*>>
    private val mImages: MutableList<RCTMGLImages>
    private var mPointAnnotationManager: PointAnnotationManager? = null
    private var mActiveMarkerID: Long = -1
    private var mStyleURL: String? = null
    val isDestroyed = false
    private var mCamera: RCTMGLCamera? = null
    private val mFeatures: MutableList<AbstractMapFeature> = ArrayList()
    private var mQueuedFeatures: MutableList<AbstractMapFeature>? = ArrayList()
    private val mPointAnnotations: MutableMap<String, RCTMGLPointAnnotation>
    private val mCameraChangeTracker = CameraChangeTracker()
    private val mMap: MapboxMap?

    // v10todo, style gets null if we add anyhing
    var savedStyle: Style? = null
        private set
    private val mHandledMapChangedEvents: HashSet<String>? = null
    private var mOffscreenAnnotationViewContainer: ViewGroup? = null
    private var mAnnotationClicked = false
    private var mLocationComponentManager: LocationComponentManager? = null
    var tintColor: Int? = null
        private set

    val pointAnnotationManager: PointAnnotationManager?
        get() {
            if (mPointAnnotationManager == null) {
                val _this = this
                val gesturesPlugin: GesturesPlugin = this.gestures
                gesturesPlugin.removeOnMapClickListener(_this)

                mPointAnnotationManager = annotations.createPointAnnotationManager()
                mPointAnnotationManager?.addClickListener(OnPointAnnotationClickListener { pointAnnotation ->
                        onMarkerClick(pointAnnotation)
                        false
                    }
                )
                gesturesPlugin.addOnMapClickListener(_this)

            }
            return mPointAnnotationManager
        }

    private fun onMapReady(map: MapboxMap) {
        map.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                savedStyle = style
                createSymbolManager(style)
                setUpImage(style)
                addQueuedFeatures()
                setupLocalization(style)
            }
        })
        val _this = this

        val gesturesPlugin: GesturesPlugin = this.gestures
        gesturesPlugin.addOnMapClickListener(_this)
        gesturesPlugin.addOnMoveListener(object : OnMoveListener {
            override fun onMoveBegin(moveGestureDetector: MoveGestureDetector) {
                mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE)
                handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE)
            }

            override fun onMove(moveGestureDetector: MoveGestureDetector): Boolean {
                mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE)
                handleMapChangedEvent(EventTypes.REGION_IS_CHANGING)
                return false
            }

            override fun onMoveEnd(moveGestureDetector: MoveGestureDetector) {}
        })


        map.subscribe({ event -> Logger.e(LOG_TAG, String.format("Map load failed: %s", event.data.toString())) }, Arrays.asList(MapEvents.MAP_LOADING_ERROR))
    }

    fun init() {
        // Required for rendering properly in Android Oreo
        viewTreeObserver.dispatchOnGlobalLayout()
    }

    fun getStyle(onStyleLoaded: Style.OnStyleLoaded) {
        if (mMap == null) {
            return
        }
        mMap.getStyle(onStyleLoaded)
    }

    fun addFeature(childView: View?, childPosition: Int) {
        var feature: AbstractMapFeature? = null
        if (childView is RCTSource<*>) {
            val source = childView
            mSources[source.iD.toString()] = source
            feature = childView as AbstractMapFeature?
        } else if (childView is RCTMGLImages) {
            mImages.add(childView)
            feature = childView
        } else if (childView is RCTMGLLight) {
            feature = childView
        } else if (childView is RCTMGLTerrain) {
            feature = childView as AbstractMapFeature?
        } else if (childView is RCTMGLNativeUserLocation) {
            feature = childView
        } else if (childView is RCTMGLPointAnnotation) {
            val annotation = childView
            mPointAnnotations[annotation.iD.toString()] = annotation
            feature = childView
        } else if (childView is RCTMGLMarkerView) {
            val marker = childView
            feature = childView
        } else if (childView is RCTMGLCamera) {
            mCamera = childView
            feature = childView
        } else if (childView is RCTLayer<*>) {
            feature = childView as AbstractMapFeature?
        } else if (childView is ViewGroup) {
            val children = childView
            for (i in 0 until children.childCount) {
                addFeature(children.getChildAt(i), childPosition)
            }
        }
        if (feature != null) {
            if (mQueuedFeatures == null) {
                feature.addToMap(this)
                mFeatures.add(childPosition, feature)
            } else {
                mQueuedFeatures?.add(childPosition, feature)
            }
        }
    }

    fun removeFeature(childPosition: Int) {
        val feature = features()[childPosition]
                ?: return
        if (feature is RCTSource<*>) {
            mSources.remove(feature.iD)
        } else if (feature is RCTMGLPointAnnotation) {
            val annotation = feature
            if (annotation.mapboxID == mActiveMarkerID) {
                mActiveMarkerID = -1
            }
            mPointAnnotations.remove(annotation.iD)
        } else if (feature is RCTMGLImages) {
            mImages.remove(feature)
        }
        feature.removeFromMap(this)
        features().remove(feature)
    }

    private fun features(): MutableList<AbstractMapFeature> {
        return if (mQueuedFeatures != null && mQueuedFeatures!!.size > 0) (
            mQueuedFeatures!!
        )
         else {
            mFeatures
        }
    }

    val featureCount: Int
        get() = features().size

    fun getFeatureAt(i: Int): AbstractMapFeature {
        return features()[i]
    }

    fun sendRegionChangeEvent(isAnimated: Boolean) {
        val event: IEvent = MapChangeEvent(this, EventTypes.REGION_DID_CHANGE,
                makeRegionPayload(isAnimated))
        mManager.handleEvent(event)
        mCameraChangeTracker.setReason(CameraChangeTracker.EMPTY)
    }

    private fun removeAllSourcesFromMap() {
        if (mSources.size == 0) {
            return
        }
        for (key in mSources.keys) {
            val source = mSources[key]
            source?.removeFromMap(this)
        }
    }

    private fun addAllSourcesToMap() {
        if (mSources.size == 0) {
            return
        }
        for (key in mSources.keys) {
            val source = mSources[key]
            source?.addToMap(this)
        }
    }

    private val allTouchableSources: List<RCTSource<*>>
        private get() {
            val sources: MutableList<RCTSource<*>> = ArrayList()
            for (key in mSources.keys) {
                val source = mSources[key]
                if (source != null && source.hasPressListener()) {
                    sources.add(source)
                }
            }
            return sources
        }

    private fun getTouchableSourceWithHighestZIndex(sources: List<RCTSource<*>>?): RCTSource<*>? {
        if (sources == null || sources.size == 0) {
            return null
        }
        if (sources.size == 1) {
            return sources[0]
        }
        val layerToSourceMap: MutableMap<String, RCTSource<*>> = HashMap()
        for (source in sources) {
            val layerIDs: Array<out String>? = source.layerIDs.toTypedArray()
            if (layerIDs != null) {
                for (layerID in layerIDs) {
                    layerToSourceMap[layerID] = source
                }
            }
        }
        val mapboxLayers = mMap?.getStyle()?.styleLayers
        if (mapboxLayers != null) {
            for (i in mapboxLayers.indices.reversed()) {
                val mapboxLayer = mapboxLayers[i]
                val layerID = mapboxLayer.id
                if (layerToSourceMap.containsKey(layerID)) {
                    return layerToSourceMap[layerID]
                }
            }
        }
        return null
    }

    fun isJSONValid(test: String?): Boolean {
        if (test == null) {
            return false
        }
        try {
            JSONObject(test)
        } catch (ex: JSONException) {
            return false
        }
        return true
    }

    fun setReactStyleURL(styleURL: String) {
        if (mMap != null) {
            removeAllSourcesFromMap()
            if (isJSONValid(mStyleURL)) {
                mMap.loadStyleJson(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        addAllSourcesToMap()
                    }
                })
            } else {
                mMap.loadStyleUri(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        savedStyle = style
                        addAllSourcesToMap()
                        addQueuedFeatures()
                    }
                },
                        object : OnMapLoadErrorListener {
                            override fun onMapLoadError(mapLoadingErrorEventData: MapLoadingErrorEventData) {
                                Logger.w("MapLoadError", mapLoadingErrorEventData.message)
                            }
                        }
                )
            }
        }
    }

    interface HandleTap {
        fun run(hitTouchableSources: List<RCTSource<*>?>?, hits: Map<String?, List<Feature?>?>)
    }

    fun handleTapInSources(
            sources: LinkedList<RCTSource<*>>, screenPoint: ScreenCoordinate,
            hits: HashMap<String?, List<Feature?>?>,
            hitTouchableSources: ArrayList<RCTSource<*>?>,
            handleTap: HandleTap
    ) {
        if (sources.isEmpty()) {
            handleTap.run(hitTouchableSources, hits)
            return
        }
        val source = sources.removeFirst()
        val hitbox = source.touchHitbox
        if (hitbox != null) {
            val halfWidth = (hitbox["width"]!!.toFloat() / 2.0f).toDouble()
            val halfHeight = (hitbox["height"]!!.toFloat() / 2.0f).toDouble()
            val screenBox = ScreenBox(
                    ScreenCoordinate(screenPoint.x - halfWidth,
                            screenPoint.y - halfHeight
                    ),
                    ScreenCoordinate(screenPoint.x + halfWidth,
                            screenPoint.y + halfHeight)
            )
            getMapboxMap().queryRenderedFeatures(screenBox,
                    RenderedQueryOptions(
                            source.layerIDs,
                            null
                    )
            ) { features ->
                if (features.isValue) {
                    if (features.value!!.size > 0) {
                        val featuresList = ArrayList<Feature?>()
                        for (i in features.value!!) {
                            featuresList.add(i.feature)
                        }
                        hits[source.iD] = featuresList
                        hitTouchableSources.add(source)
                    }
                } else {
                    Logger.e("handleTapInSources", features.error)
                }
                handleTapInSources(sources, screenPoint, hits, hitTouchableSources, handleTap)
            }
        }
    }

    override fun onMapClick(point: Point): Boolean {
        val _this = this
        /*if (mPointAnnotationManager != nil) {
            getAnnotations()
        }*/if (mAnnotationClicked) {
            mAnnotationClicked = false
            return true
        }
        val screenPoint = mMap?.pixelForCoordinate(point)
        val touchableSources = allTouchableSources
        val hits = HashMap<String?, List<Feature?>?>()
        if (screenPoint != null) {
            handleTapInSources(LinkedList(touchableSources), screenPoint, hits, ArrayList(), object : HandleTap {
                override fun run(hitTouchableSources: List<RCTSource<*>?>?, hits: Map<String?, List<Feature?>?>) {
                    if (hits.size > 0) {
                        val source = getTouchableSourceWithHighestZIndex(hitTouchableSources as List<RCTSource<*>>?)
                        if (source != null && source.hasPressListener() && source.iD != null && source.iD in hits) {
                            source.onPress(RCTSource.OnPressEvent(
                                    hits[source.iD] as List<Feature>,
                                    GeoJSONUtils.toLatLng(point),
                                    PointF(screenPoint.x.toFloat(), screenPoint.y.toFloat())
                            ))
                            return
                        }
                    }
                    val event = MapClickEvent(_this, LatLng(point), screenPoint)
                    mManager.handleEvent(event)
                }

            })
        }
        return false
    }

    fun onMarkerClick(symbol: PointAnnotation) {
        mAnnotationClicked = true
        val selectedMarkerID = symbol.id
        var activeAnnotation: RCTMGLPointAnnotation? = null
        var nextActiveAnnotation: RCTMGLPointAnnotation? = null
        for (key in mPointAnnotations.keys) {
            val annotation = mPointAnnotations[key]
            val curMarkerID = annotation?.mapboxID
            if (mActiveMarkerID == curMarkerID) {
                activeAnnotation = annotation
            }
            if (selectedMarkerID == curMarkerID && mActiveMarkerID != curMarkerID) {
                nextActiveAnnotation = annotation
            }
        }
        activeAnnotation?.let { deselectAnnotation(it) }
        nextActiveAnnotation?.let { selectAnnotation(it) }
    }

    fun selectAnnotation(annotation: RCTMGLPointAnnotation) {
        mActiveMarkerID = annotation.mapboxID
        annotation.onSelect(true)
    }

    fun deselectAnnotation(annotation: RCTMGLPointAnnotation) {
        mActiveMarkerID = -1
        annotation.onDeselect()
    }

    interface FoundLayerCallback {
        fun found(layer: Layer?)
    }

    private val layerWaiters: MutableMap<String, MutableList<FoundLayerCallback>> = HashMap()
    fun layerAdded(layer: Layer) {
        val layerId = layer.layerId
        val callbacks: List<FoundLayerCallback>? = layerWaiters[layerId]
        if (callbacks != null) {
            for (callback in callbacks) {
                callback.found(layer)
            }
        }
        layerWaiters.remove(layerId)
    }

    fun waitForLayer(layerID: String, callback: FoundLayerCallback) {
        if (savedStyle != null) {
            val layer = savedStyle?.getLayer(layerID)
            if (layer != null) {
                callback.found(layer)
                return
            }
        }
        var waiters = layerWaiters[layerID]
        if (waiters == null) {
            waiters = ArrayList()
            layerWaiters[layerID] = waiters
        }
        waiters.add(callback)
    }

    fun sendRegionDidChangeEvent() {
        handleMapChangedEvent(EventTypes.REGION_DID_CHANGE)
        mCameraChangeTracker.setReason(CameraChangeTracker.EMPTY)
    }

    private fun handleMapChangedEvent(eventType: String) {
        if (!canHandleEvent(eventType)) return
        val event: IEvent
        event = when (eventType) {
            EventTypes.REGION_WILL_CHANGE, EventTypes.REGION_DID_CHANGE, EventTypes.REGION_IS_CHANGING -> MapChangeEvent(this, eventType, makeRegionPayload(null))
            else -> MapChangeEvent(this, eventType)
        }
        mManager.handleEvent(event)
    }

    private fun canHandleEvent(event: String): Boolean {
        return mHandledMapChangedEvents == null || mHandledMapChangedEvents.contains(event)
    }

    private fun makeRegionPayload(isAnimated: Boolean?): WritableMap {
        val position = mMap?.cameraState ?: return WritableNativeMap()
        val latLng = LatLng(position.center.latitude(), position.center.longitude())
        val properties: WritableMap = WritableNativeMap()
        properties.putDouble("zoomLevel", position.zoom)
        properties.putDouble("heading", position.bearing)
        properties.putDouble("pitch", position.pitch)
        properties.putBoolean("animated",
                if (null == isAnimated) mCameraChangeTracker.isAnimated else isAnimated)
        properties.putBoolean("isUserInteraction", mCameraChangeTracker.isUserInteraction)
        try {
            val bounds = mMap.getBounds()
            properties.putArray("visibleBounds", GeoJSONUtils.fromCameraBounds(bounds))
        } catch (ex: Exception) {
            Logger.e(LOG_TAG, "An error occurred while attempting to make the region", ex)
        }
        return GeoJSONUtils.toPointFeature(latLng, properties)
    }

    fun createSymbolManager(style: Style?) {
        /*
        v10 TODO
        symbolManager = new SymbolManager(this, mMap, style);
        symbolManager.setIconAllowOverlap(true);
        symbolManager.addClickListener(new OnSymbolClickListener() {
            @Override
            public void onAnnotationClick(Symbol symbol) {
                onMarkerClick(symbol);
            }
        });
        symbolManager.addDragListener(new OnSymbolDragListener() {
            @Override
            public void onAnnotationDragStarted(Symbol symbol) {
                mAnnotationClicked = true;
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDragStart();
                }
            }

            @Override
            public void onAnnotationDrag(Symbol symbol) {
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDrag();
                }
            }

            @Override
            public void onAnnotationDragFinished(Symbol symbol) {
                mAnnotationClicked = false;
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDragEnd();
                }
            }
        });
        mMap.addOnMapClickListener(this);
        mMap.addOnMapLongClickListener(this);
         */
    }

    fun addQueuedFeatures() {
        if (mQueuedFeatures != null && mQueuedFeatures!!.size > 0) {
            for (i in mQueuedFeatures!!.indices) {
                val feature = mQueuedFeatures!![i]
                feature.addToMap(this)
                mFeatures.add(feature)
            }
            mQueuedFeatures = null
        }
    }

    private fun setupLocalization(style: Style) {
        /*
        mLocalizationPlugin = new LocalizationPlugin(RCTMGLMapView.this, mMap, style);
        if (mLocalizeLabels) {
            try {
                mLocalizationPlugin.matchMapLanguageWithDeviceDefault();
            } catch (Exception e) {
                final String localeString = Locale.getDefault().toString();
                Logger.w(LOG_TAG, String.format("Could not find matching locale for %s", localeString));
            }
        }*/
    }

    /**
     * Adds the marker image to the map for use as a SymbolLayer icon
     */
    private fun setUpImage(loadedStyle: Style) {
        loadedStyle.addImage("MARKER_IMAGE_ID", BitmapFactory.decodeResource(
                this.resources, R.drawable.red_marker)
        )
    }

    /**
     * PointAnnotations are rendered to a canvas, but react native Image component is
     * implemented on top of Fresco, and fresco will not load images when their view is
     * not attached to the window. So we'll have an offscreen view where we add those views
     * so they can rendered full to canvas.
     */
    fun offscreenAnnotationViewContainer(): ViewGroup {
        if (mOffscreenAnnotationViewContainer == null) {
            mOffscreenAnnotationViewContainer = FrameLayout(context)
            val flParams = LayoutParams(0, 0)
            flParams.setMargins(-10000, -10000, -10000, -10000)
            (mOffscreenAnnotationViewContainer as FrameLayout).setLayoutParams(flParams)
            addView(mOffscreenAnnotationViewContainer)
        }
        return mOffscreenAnnotationViewContainer!!
    }

    val locationComponentManager: LocationComponentManager
        get() {
            if (mLocationComponentManager == null) {
                mLocationComponentManager = LocationComponentManager(this, mContext)
            }
            return mLocationComponentManager!!
        }

    fun getMapAsync(mapReady: OnMapReadyCallback) {
        mapReady.onMapReady(getMapboxMap())
    }

    //fun setTintColor(color: Int) {
    //    tintColor = color
    //    if (mLocationComponentManager != null) {
    //        mLocationComponentManager.tintColorChanged()
    //    }
    //}

    fun queryTerrainElevation(callbackID: String?, longitude: Double, latitude: Double) {
        val result = mMap?.getElevation(Point.fromLngLat(longitude, latitude))
        val payload: WritableMap = WritableNativeMap()
        if (result != null) {
            payload.putDouble("data", result)
            val event = AndroidCallbackEvent(this, callbackID, payload)
            mManager.handleEvent(event)
        }
    }

    companion object {
        const val LOG_TAG = "RCTMGLMapView"
    }

    init {
        mMap = getMapboxMap()
        mSources = HashMap()
        mImages = ArrayList()
        mPointAnnotations = HashMap()
        onMapReady(mMap)
        val _this = this
        mMap.addOnMapLoadedListener(OnMapLoadedListener { (begin, end) -> _this.handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_MAP) })
    }
}