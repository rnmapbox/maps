package com.mapbox.rctmgl.components.mapview

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.PointF
import android.graphics.RectF
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.bridge.*
import com.mapbox.android.gestures.MoveGestureDetector
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.extension.observable.eventdata.MapLoadingErrorEventData
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.Layer
import com.mapbox.maps.extension.style.layers.generated.*
import com.mapbox.maps.extension.style.layers.getLayer
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.mapbox.maps.plugin.attribution.attribution
import com.mapbox.maps.plugin.attribution.generated.AttributionSettings
import com.mapbox.maps.plugin.compass.compass
import com.mapbox.maps.plugin.delegates.listeners.*
import com.mapbox.maps.plugin.gestures.*
import com.mapbox.maps.plugin.logo.generated.LogoSettings
import com.mapbox.maps.plugin.logo.logo
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
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrain
import com.mapbox.rctmgl.events.AndroidCallbackEvent
import com.mapbox.rctmgl.events.IEvent
import com.mapbox.rctmgl.events.MapChangeEvent
import com.mapbox.rctmgl.events.MapClickEvent
import com.mapbox.rctmgl.events.constants.EventTypes
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.utils.LatLng
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.rctmgl.utils.extensions.toReadableArray
import org.json.JSONException
import org.json.JSONObject
import java.util.*


open class RCTMGLMapView(private val mContext: Context, var mManager: RCTMGLMapViewManager /*, MapboxMapOptions options*/) : MapView(mContext), OnMapClickListener, OnMapLongClickListener {
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

        map.addOnCameraChangeListener(OnCameraChangeListener { cameraChangedEventData ->
            handleMapChangedEvent(EventTypes.REGION_IS_CHANGING)
        })

        map.addOnMapIdleListener(OnMapIdleListener { mapIdleEventData ->
            sendRegionDidChangeEvent()
        })

        val gesturesPlugin: GesturesPlugin = this.gestures
        gesturesPlugin.addOnMapLongClickListener(_this)
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
            getMapboxMap().queryRenderedFeatures(RenderedQueryGeometry(screenBox),
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
                    Logger.e("handleTapInSources", features.error ?: "n/a")
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

    override fun onMapLongClick(point: Point): Boolean {
        val _this = this
        val screenPoint = mMap?.pixelForCoordinate(point)
        if (screenPoint != null) {
            val event = MapClickEvent(_this, LatLng(point), screenPoint, EventTypes.MAP_LONG_CLICK)
            mManager.handleEvent(event)
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

    // region Callbacks

    fun getCenter(callbackID: String?) {
        var center = mMap!!.cameraState!!.center
        val array: WritableArray = WritableNativeArray()
        array.pushDouble(center.longitude())
        array.pushDouble(center.latitude())
        val payload: WritableMap = WritableNativeMap()
        payload.putArray("center", array)

        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    fun getZoom(callbackID: String?) {
        var zoom = mMap!!.cameraState!!.zoom

        val payload: WritableMap = WritableNativeMap()
        payload.putDouble("zoom", zoom)

        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    private fun getDisplayDensity(): Float {
        return mContext.resources.displayMetrics.density
    }

    fun getCoordinateFromView(callbackID: String?, pixel: ScreenCoordinate) {
        val density: Float = getDisplayDensity()
        val screenCoordinate = ScreenCoordinate(pixel.x * density, pixel.y * density)

        val coordinate = mMap!!.coordinateForPixel(pixel)

        val payload: WritableMap = WritableNativeMap()
        payload.putArray("coordinateFromView", coordinate.toReadableArray())

        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    fun getPointInView(callbackID: String?, coordinate: Point) {
        val point = mMap!!.pixelForCoordinate(coordinate)

        val array: WritableArray = WritableNativeArray()
        array.pushDouble(point.x)
        array.pushDouble(point.y)
        val payload: WritableMap = WritableNativeMap()
        payload.putArray("pointInView", array)

        val event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    fun queryRenderedFeaturesAtPoint(callbackID: String?, point: PointF, filter: Expression?, layerIDs: List<String>?) {
        mMap?.queryRenderedFeatures(
            ScreenCoordinate(point.x.toDouble(), point.y.toDouble()),
            RenderedQueryOptions(layerIDs, filter)
        ) { features ->
            if (features.isValue) {
                val featuresList = ArrayList<Feature?>()
                for (i in features.value!!) {
                    featuresList.add(i.feature)
                }

                val payload: WritableMap = WritableNativeMap()
                payload.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())

                var event = AndroidCallbackEvent(this, callbackID, payload)
                mManager.handleEvent(event)
            } else {
                Logger.e("queryRenderedFeaturesAtPoint", features.error ?: "n/a")
            }
        }
    }

    fun queryRenderedFeaturesInRect(callbackID: String?, rect: RectF, filter: Expression?, layerIDs: List<String>?) {
        val screenBox = ScreenBox(
                ScreenCoordinate(rect.right.toDouble(), rect.bottom.toDouble() ),
                ScreenCoordinate(rect.left.toDouble(), rect.top.toDouble()),
        )
        mMap?.queryRenderedFeatures(
                RenderedQueryGeometry(screenBox),
                RenderedQueryOptions(layerIDs, filter)
        ) { features ->
            if (features.isValue) {
                val featuresList = ArrayList<Feature?>()
                for (i in features.value!!) {
                    featuresList.add(i.feature)
                }

                val payload: WritableMap = WritableNativeMap()
                payload.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())

                var event = AndroidCallbackEvent(this, callbackID, payload)
                mManager.handleEvent(event)
            } else {
                Logger.e("queryRenderedFeaturesInRect", features.error ?: "n/a")
            }
        }
    }

    fun queryTerrainElevation(callbackID: String?, longitude: Double, latitude: Double) {
        val result = mMap?.getElevation(Point.fromLngLat(longitude, latitude))
        val payload: WritableMap = WritableNativeMap()
        if (result != null) {
            payload.putDouble("data", result)
            val event = AndroidCallbackEvent(this, callbackID, payload)
            mManager.handleEvent(event)
        }
    }

    fun match(layer: Layer, sourceId:String, sourceLayerId: String?) : Boolean {
        fun match(actSourceId: String, actSourceLayerId: String?) : Boolean {
            return (actSourceId == sourceId && ((sourceLayerId == null) || (sourceLayerId == actSourceLayerId)))
        }
        return when (layer) {
            is BackgroundLayer -> false
            is LocationIndicatorLayer -> false
            is SkyLayer -> false
            is CircleLayer -> match(layer.sourceId, layer.sourceLayer)
            is FillExtrusionLayer -> match(layer.sourceId, layer.sourceLayer)
            is FillLayer -> match(layer.sourceId, layer.sourceLayer)
            is HeatmapLayer -> match(layer.sourceId, layer.sourceLayer)
            is HillshadeLayer -> match(layer.sourceId, layer.sourceLayer)
            is LineLayer -> match(layer.sourceId, layer.sourceLayer)
            is RasterLayer -> match(layer.sourceId, layer.sourceLayer)
            is SymbolLayer -> match(layer.sourceId, layer.sourceLayer)
            else -> {
                logE("MapView", "Layer type: $layer.type unknown.")
                false
            }
        }
    }

    fun setSourceVisibility(
        visible: Boolean,
        sourceId: String,
        sourceLayerId: String?
    ) {
        if (mMap == null) {
            Logger.e("MapView", "setSourceVisibility, map is null")
            return
        }
        val style = mMap!!.getStyle();
        style!!.styleLayers.forEach {
            val layer = style.getLayer(it.id)
            if ((layer != null) && match(layer, sourceId, sourceLayerId)) {
                layer.visibility(
                    if (visible) Visibility.VISIBLE else Visibility.NONE
                )
            }
        }
    }

    // endregion

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
        mMap.addOnStyleImageMissingListener(OnStyleImageMissingListener { (begin, end, id) ->
            for (images in mImages) {
                if (images.addMissingImageToStyle(id, mMap)) {
                    return@OnStyleImageMissingListener
                }
            }
            for (images in mImages) {
                images.sendImageMissingEvent(id, mMap)
            }
        })
    }

    // region Ornaments

    fun toGravity(kind: String, viewPosition: Int): Int {
        return when (viewPosition) {
            0 -> (Gravity.TOP or Gravity.START)
            1 -> (Gravity.TOP or Gravity.END)
            2 -> (Gravity.BOTTOM or Gravity.START)
            3 -> (Gravity.BOTTOM or Gravity.END)
            else -> {
                Logger.e(
                    "MapView",
                    "Unexpected viewPosition for $kind: $viewPosition should be between 0 and 3"
                )
                0
            }
        }
    }

    var mCompassEnabled = false
    var mCompassViewMargins: ReadableMap? = null
    var mCompassViewPosition: Int = -1

    fun setReactCompassEnabled(compassEnabled: Boolean) {
        mCompassEnabled = compassEnabled
        updateCompass()
    }

    fun setReactCompassViewMargins(compassViewMargins: ReadableMap) {
        mCompassViewMargins = compassViewMargins
        updateCompass()
    }

    fun setReactCompassViewPosition(compassViewPosition: Int) {
        mCompassViewPosition = compassViewPosition
        updateCompass()
    }

    fun setReactCompassMargins(compassMargins: ReadableMap) {
        val bottom_mask = 1;
        val right_mask = 2;

        var margins = WritableNativeMap()
        var position = 0;
        if (compassMargins.hasKey("bottom")) {
            margins.putInt("y", compassMargins.getInt("bottom"))
            position = position or bottom_mask
        } else {
            if (compassMargins.hasKey("top")) {
                margins.putInt("y", compassMargins.getInt("top"))
            }
        }

        if (compassMargins.hasKey("left")) {
            margins.putInt("x", compassMargins.getInt("left"))
        } else {
            if (compassMargins.hasKey("right")) {
                margins.putInt("x", compassMargins.getInt("right"))
            }
        }
        mCompassViewPosition = position
        mCompassViewMargins = margins
        updateCompass()
    }

    private fun updateCompass() {
        compass.updateSettings {
            enabled = mCompassEnabled
            if (mCompassViewPosition >= 0) {
                position = toGravity("compass", mCompassViewPosition)
            }

            val compassViewMargins = mCompassViewMargins
            if (compassViewMargins != null) {
                val pixelDensity = resources.displayMetrics.density.toInt()
                val x: Int = compassViewMargins.getInt("x") * pixelDensity
                val y: Int = compassViewMargins.getInt("y") * pixelDensity

                val horizontalGravity = position and Gravity.HORIZONTAL_GRAVITY_MASK
                val verticalGravity = position and Gravity.VERTICAL_GRAVITY_MASK

                when (horizontalGravity) {
                    Gravity.LEFT -> {
                        marginLeft = x.toFloat()
                    }
                    Gravity.RIGHT -> marginRight = x.toFloat()
                    Gravity.CENTER_HORIZONTAL -> marginLeft = x.toFloat()
                    else -> Logger.e(
                        "MapView",
                        "compassViewMargins: unexpected absolute pos: $horizontalGravity"
                    )
                }
                when (verticalGravity) {
                    Gravity.TOP -> marginTop = y.toFloat()
                    Gravity.BOTTOM -> marginBottom = y.toFloat()
                    Gravity.CENTER_VERTICAL -> marginTop = y.toFloat()
                    else -> Logger.e(
                        "MapView",
                        "compassViewMargins: unexpected vertical pos: $verticalGravity"
                    )
                }
            }
        }
    }
    // endregion

    private fun getGravityAndMargin (position:ReadableMap): Pair<Int, IntArray> {
        var gravity = Gravity.NO_GRAVITY
        if (position.hasKey("left")) {
            gravity = gravity or Gravity.START
        }
        if (position.hasKey("right")) {
            gravity = gravity or Gravity.END
        }
        if (position.hasKey("top")) {
            gravity = gravity or Gravity.TOP
        }
        if (position.hasKey("bottom")) {
            gravity = gravity or Gravity.BOTTOM
        }
        val density = getDisplayDensity()
        val margin = intArrayOf(
            if (position.hasKey("left")) density.toInt() * position.getInt("left") else 0,
            if (position.hasKey("top")) density.toInt() * position.getInt("top") else 0,
            if (position.hasKey("right")) density.toInt() * position.getInt("right") else 0,
            if (position.hasKey("bottom")) density.toInt() * position.getInt("bottom") else 0,
        )
        return Pair(gravity, margin)
    }

    // region Attribution
    private var mAttributionEnabled: Boolean? = null;
    private var mAttributionGravity: Int? = null
    private var mAttributionMargin: IntArray? = null

    fun setReactAttributionEnabled(attributionEnabled: Boolean?) {
        mAttributionEnabled = attributionEnabled ?: AttributionSettings().enabled
        updateAttribution()
    }

    fun setReactAttributionPosition(position: ReadableMap?) {
        if (position == null) {
            // reset from explicit to default
            if (mAttributionGravity != null) {
                val defaultOptions = AttributionSettings()
                mAttributionGravity = defaultOptions.position
                mAttributionMargin = intArrayOf(defaultOptions.marginLeft.toInt(),defaultOptions.marginTop.toInt(),defaultOptions.marginRight.toInt(),defaultOptions.marginBottom.toInt())
                updateAttribution()
            }
            return
        }

        val (attributionGravity, attributionMargin) = getGravityAndMargin(position)
        mAttributionGravity = attributionGravity
        mAttributionMargin = attributionMargin
        updateAttribution()
    }

    private fun updateAttribution() {
        attribution.updateSettings {
            if(mAttributionEnabled!= null){
                enabled = mAttributionEnabled!!
            }
            if(mAttributionGravity != null){
                position = mAttributionGravity!!
            }
            if(mAttributionMargin != null){
                marginLeft = mAttributionMargin!![0].toFloat()
                marginTop = mAttributionMargin!![1].toFloat()
                marginRight = mAttributionMargin!![2].toFloat()
                marginBottom = mAttributionMargin!![3].toFloat()
            }
        }
    }
    //endregion

    // region Logo
    private var mLogoEnabled: Boolean? = null;
    private var mLogoGravity: Int? = null
    private var mLogoMargin: IntArray? = null

    fun setReactLogoEnabled(logoEnabled: Boolean?) {
        mLogoEnabled = logoEnabled ?: LogoSettings().enabled
        updateLogo()
    }

    fun setReactLogoPosition(position: ReadableMap?) {
        if (position == null) {
            // reset from explicit to default
            if (mLogoGravity != null) {
                val defaultOptions = LogoSettings()
                mLogoGravity = defaultOptions.position
                mLogoMargin = intArrayOf(defaultOptions.marginLeft.toInt(),defaultOptions.marginTop.toInt(),defaultOptions.marginRight.toInt(),defaultOptions.marginBottom.toInt())
                updateLogo()
            }
            return
        }
        val (logoGravity, logoMargin) = getGravityAndMargin(position)
        mLogoGravity = logoGravity
        mLogoMargin = logoMargin
        updateLogo()
    }

    private fun updateLogo() {
        logo.updateSettings {
            if(mLogoEnabled != null){
                enabled = mLogoEnabled!!
            }
            if(mLogoGravity != null){
                position = mLogoGravity!!
            }
            if(mLogoMargin != null){
                marginLeft = mLogoMargin!![0].toFloat()
                marginTop = mLogoMargin!![1].toFloat()
                marginRight = mLogoMargin!![2].toFloat()
                marginBottom = mLogoMargin!![3].toFloat()
            }
        }
    }
    // endregion
}
