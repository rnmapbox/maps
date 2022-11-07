package com.mapbox.rctmgl.components.mapview

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.PointF
import android.graphics.RectF
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewTreeLifecycleOwner
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
import com.mapbox.maps.extension.style.layers.properties.generated.ProjectionName
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.mapbox.maps.extension.style.projection.generated.Projection
import com.mapbox.maps.extension.style.projection.generated.setProjection
import com.mapbox.maps.plugin.annotation.Annotation
import com.mapbox.maps.plugin.annotation.annotations
import com.mapbox.maps.plugin.annotation.generated.*
import com.mapbox.maps.plugin.attribution.attribution
import com.mapbox.maps.plugin.attribution.generated.AttributionSettings
import com.mapbox.maps.plugin.compass.compass
import com.mapbox.maps.plugin.compass.generated.CompassSettings
import com.mapbox.maps.plugin.delegates.listeners.*
import com.mapbox.maps.plugin.gestures.*
import com.mapbox.maps.plugin.logo.generated.LogoSettings
import com.mapbox.maps.plugin.logo.logo
import com.mapbox.maps.plugin.scalebar.generated.ScaleBarSettings
import com.mapbox.maps.plugin.scalebar.scalebar
import com.mapbox.rctmgl.R
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerViewManager
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
import com.mapbox.rctmgl.utils.BitmapUtils
import com.mapbox.rctmgl.utils.GeoJSONUtils
import com.mapbox.rctmgl.utils.LatLng
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.rctmgl.utils.extensions.toReadableArray
import org.json.JSONException
import org.json.JSONObject
import java.util.*


data class OrnamentSettings(
    var enabled : Boolean? = false,
    var margins: ReadableMap? =null,
    var position: Int = -1
)


interface RCTMGLMapViewLifecycleOwner : LifecycleOwner {
    fun handleLifecycleEvent(event: Lifecycle.Event)
}

open class RCTMGLMapView(private val mContext: Context, var mManager: RCTMGLMapViewManager /*, MapboxMapOptions options*/) : MapView(mContext), OnMapClickListener, OnMapLongClickListener {
    /**
     * `PointAnnotations` are rendered to a canvas, but the React Native `Image` component is
     * implemented on top of Fresco (https://frescolib.org), which does not load images for
     * views not attached to the window. This provides an offscreen view where views can
     * be rendered to the canvas before being added as annotations.
     */
    public var offscreenAnnotationViewContainer: ViewGroup? = null

    private val mSources: MutableMap<String, RCTSource<*>>
    private val mImages: MutableList<RCTMGLImages>
    private var mPointAnnotationManager: PointAnnotationManager? = null
    private var mActiveMarkerID: Long = -1
    private var mProjection: ProjectionName = ProjectionName.MERCATOR
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
    private var mAnnotationClicked = false
    private var mAnnotationDragged = false
    private var mLocationComponentManager: LocationComponentManager? = null
    var tintColor: Int? = null
        private set

    val pointAnnotationManager: PointAnnotationManager?
        get() {
            if (mPointAnnotationManager == null) {
                val _this = this
                val gesturesPlugin: GesturesPlugin = this.gestures
                gesturesPlugin.removeOnMapClickListener(_this)
                gesturesPlugin.removeOnMapLongClickListener(_this)

                mPointAnnotationManager = annotations.createPointAnnotationManager()
                mPointAnnotationManager?.addClickListener(OnPointAnnotationClickListener { pointAnnotation ->
                        onMarkerClick(pointAnnotation)
                        false
                    }
                )
                mPointAnnotationManager?.addDragListener(object : OnPointAnnotationDragListener {
                    override fun onAnnotationDragStarted(_annotation: Annotation<*>) {
                        mAnnotationDragged = true;
                        var reactAnnotation: RCTMGLPointAnnotation? = null
                        for (key in mPointAnnotations.keys) {
                            val annotation = mPointAnnotations[key]
                            val curMarkerID = annotation?.mapboxID
                            if (_annotation.id == curMarkerID) {
                                reactAnnotation = annotation
                            }
                        }
                        reactAnnotation?.let { it.onDragStart() }
                    }

                   override fun onAnnotationDrag(_annotation: Annotation<*>) {
                        var reactAnnotation: RCTMGLPointAnnotation? = null
                        for (key in mPointAnnotations.keys) {
                            val annotation = mPointAnnotations[key]
                            val curMarkerID = annotation?.mapboxID
                            if (_annotation.id == curMarkerID) {
                                reactAnnotation = annotation
                            }
                        }
                        reactAnnotation?.let { it.onDrag() }
                    }

                    override fun onAnnotationDragFinished(_annotation: Annotation<*>) {
                        mAnnotationDragged = false;
                        var reactAnnotation: RCTMGLPointAnnotation? = null
                        for (key in mPointAnnotations.keys) {
                            val annotation = mPointAnnotations[key]
                            val curMarkerID = annotation?.mapboxID
                            if (_annotation.id == curMarkerID) {
                                reactAnnotation = annotation
                            }
                        }
                        reactAnnotation?.let { it.onDragEnd() }
                    }
                })
                gesturesPlugin.addOnMapClickListener(_this)
                gesturesPlugin.addOnMapLongClickListener(_this)

            }
            return mPointAnnotationManager
        }

    private fun onMapReady(map: MapboxMap) {
        map.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                savedStyle = style
                setUpImage(style)
                addQueuedFeaturesToMap()
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

    // region features
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

    fun removeAllFeatures() {
        mFeatures.forEach {
            it.removeFromMap(this)
        }
        mFeatures.clear()
        val queuedFeatures = mQueuedFeatures
        if (queuedFeatures != null) {
            queuedFeatures.clear()
        }
    }
    // endregion

    fun sendRegionChangeEvent(isAnimated: Boolean) {
        val event: IEvent = MapChangeEvent(this, EventTypes.REGION_DID_CHANGE,
                makeRegionPayload(isAnimated))
        mManager.handleEvent(event)
        mCameraChangeTracker.setReason(CameraChangeTracker.EMPTY)
    }

    private fun removeAllFeaturesFromMap() {
        mFeatures.forEach { it -> it.removeFromMap(this) }
    }

    private fun addQueuedFeaturesToMap() {
        mQueuedFeatures?.let { queuedFeatures ->
            queuedFeatures.forEach {
                it.addToMap(this)
                mFeatures.add(it)
            }
            queuedFeatures.clear()
        }
        mQueuedFeatures = null;
    }

    private fun addAllFeaturesToMap() {
        mQueuedFeatures?.also {
            this.addQueuedFeaturesToMap()
        } ?: run {
            mFeatures.forEach { it.addToMap(this) }
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

    fun setReactProjection(projection: ProjectionName) {
        if (projection != null) {
            mProjection = projection
        }

        if (mMap != null) {
            mMap.getStyle()?.setProjection(Projection(projection))
        }
    }

    fun setReactStyleURL(styleURL: String) {
        mStyleURL = styleURL
        if (mMap != null) {
            removeAllFeaturesFromMap()
            if (isJSONValid(mStyleURL)) {
                mMap.loadStyleJson(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        style.setProjection(Projection(mProjection))
                        addAllFeaturesToMap()
                    }
                })
            } else {
                mMap.loadStyleUri(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        savedStyle = style
                        style.setProjection(Projection(mProjection))
                        addAllFeaturesToMap()
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
        if (mAnnotationDragged) {
            mAnnotationDragged = false
            return true
        }
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

    fun waitForLayer(layerID: String?, callback: FoundLayerCallback) {
        if(layerID == null){
            callback.found(null)
            return
        }
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
            val bounds = mMap.coordinateBoundsForCamera(position.toCameraOptions())
            properties.putArray("visibleBounds", bounds.toReadableArray())
        } catch (ex: Exception) {
            Logger.e(LOG_TAG, "An error occurred while attempting to make the region", ex)
        }
        return GeoJSONUtils.toPointFeature(latLng, properties)
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

        sendResponse(callbackID, {
            val array: WritableArray = WritableNativeArray()
            array.pushDouble(center.longitude())
            array.pushDouble(center.latitude())
            it.putArray("center", array)
        })
    }

    fun getZoom(callbackID: String?) {
        var zoom = mMap!!.cameraState!!.zoom

        sendResponse(callbackID, {
            it.putDouble("zoom", zoom)
        })
    }

    private fun getDisplayDensity(): Float {
        return mContext.resources.displayMetrics.density
    }

    fun getCoordinateFromView(callbackID: String?, pixel: ScreenCoordinate) {
        val density: Float = getDisplayDensity()
        val screenCoordinate = ScreenCoordinate(pixel.x * density, pixel.y * density)

        val coordinate = mMap!!.coordinateForPixel(pixel)

        sendResponse(callbackID, {
            it.putArray("coordinateFromView", coordinate.toReadableArray())
        })
    }

    fun getPointInView(callbackID: String?, coordinate: Point) {
        val point = mMap!!.pixelForCoordinate(coordinate)

        sendResponse(callbackID, {
            val array: WritableArray = WritableNativeArray()
            array.pushDouble(point.x)
            array.pushDouble(point.y)
            it.putArray("pointInView", array)
        })
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

                sendResponse(callbackID, {
                    it.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())
                })
            } else {
                Logger.e("queryRenderedFeaturesAtPoint", features.error ?: "n/a")
            }
        }
    }

    fun queryRenderedFeaturesInRect(callbackID: String?, rect: RectF, filter: Expression?, layerIDs: List<String>?) {
        val size = mMap!!.getMapOptions().size
        val screenBox = if (rect.isEmpty()) ScreenBox(ScreenCoordinate(0.0, 0.0), ScreenCoordinate(size?.width!!.toDouble(), size?.height!!.toDouble())) else ScreenBox(
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

    fun sendResponse(callbackID: String?, buildPayload: (map: WritableMap) -> Unit) {
        val payload: WritableMap = WritableNativeMap()
        buildPayload(payload)
        var event = AndroidCallbackEvent(this, callbackID, payload)
        mManager.handleEvent(event)
    }

    fun getVisibleBounds(callbackID: String?) {
        val bounds = mMap!!.coordinateBoundsForCamera(mMap!!.cameraState.toCameraOptions())

        sendResponse(callbackID, {
            it.putArray("visibleBounds", bounds.toReadableArray())
        })
    }

    fun takeSnap(callbackID: String?, writeToDisk: Boolean) {
        this.snapshot { snapshot ->
            if (snapshot == null) {
                Logger.e("takeSnap", "snapshot failed")

                sendResponse(callbackID, {
                    it.putNull("data")
                    it.putString("error", "no snapshot")
                })
            } else {
                val uri: String = if (writeToDisk) BitmapUtils.createTempFile(
                    mContext,
                    snapshot
                ) else BitmapUtils.createBase64(snapshot)

                sendResponse(callbackID, {
                    it.putString("uri", uri)
                })
            }
        }
    }

    fun queryTerrainElevation(callbackID: String?, longitude: Double, latitude: Double) {
        val result = mMap?.getElevation(Point.fromLngLat(longitude, latitude))

        sendResponse(callbackID, {
            if (result != null) {
                it.putDouble("data", result)
            } else {
                Logger.e("queryTerrainElevation", "no elevation data")

                it.putNull("data")
                it.putString("error", "no elevation")
            }
        })
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
        offscreenAnnotationViewContainer = FrameLayout(getContext())
        val p = FrameLayout.LayoutParams(0, 0)
        p.setMargins(-10000, -10000, -10000, -10000)
        offscreenAnnotationViewContainer?.setLayoutParams(p)
        addView(offscreenAnnotationViewContainer)

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

        RCTMGLMarkerViewManager.markerViewContainerSizeFixer(this, viewAnnotationManager)
    }

    // region Ornaments

    private fun toGravity(kind: String, viewPosition: Int): Int {
        return when (viewPosition) {
            0 -> (Gravity.TOP or Gravity.LEFT)
            1 -> (Gravity.TOP or Gravity.RIGHT)
            2 -> (Gravity.BOTTOM or Gravity.LEFT)
            3 -> (Gravity.BOTTOM or Gravity.RIGHT)
            else -> {
                Logger.e(
                    "MapView",
                    "Unexpected viewPosition for $kind: $viewPosition should be between 0 and 3"
                )
                0
            }
        }
    }

    private fun updateOrnament(kind: String, from: OrnamentSettings, to: GenericOrnamentSettings) {
        from.enabled?.let { to.enabled = it }
        if (from.position >= 0) {
            to.position = toGravity(kind, from.position)
        }

        from.margins?.let {
            val pixelDensity = resources.displayMetrics.density
            val x: Int? = it.getDouble("x")?.let { (it * pixelDensity).toInt() }
            val y: Int? = it.getDouble("y")?.let { (it * pixelDensity).toInt() }

            val horizontalGravity = to.position and Gravity.HORIZONTAL_GRAVITY_MASK
            val verticalGravity = to.position and Gravity.VERTICAL_GRAVITY_MASK

            when (horizontalGravity) {
                Gravity.LEFT -> { to.setHMargins(x?.toFloat(), 0f)  }
                Gravity.RIGHT -> { to.setHMargins(0f, x?.toFloat())  }
                Gravity.CENTER_HORIZONTAL ->{ to.setHMargins(x?.toFloat(), x?.toFloat())  }
                else -> Logger.e(
                    "MapView",
                    "${kind}ViewMargins: unexpected absolute pos: $horizontalGravity"
                )
            }
            when (verticalGravity) {
                Gravity.TOP -> { to.setVMargins(y?.toFloat(), 0f)  }
                Gravity.BOTTOM -> { to.setVMargins(0f, y?.toFloat())  }
                Gravity.CENTER_VERTICAL -> { to.setVMargins(y?.toFloat(), y?.toFloat())  }
                else -> Logger.e(
                    "MapView",
                    "${kind}ViewMargins: unexpected vertical pos: $verticalGravity"
                )
            }
        }
    }

    var mCompassSettings = OrnamentSettings(enabled = false)
    var mCompassFadeWhenNorth = false

    fun setReactCompassEnabled(compassEnabled: Boolean) {
        mCompassSettings.enabled = compassEnabled
        updateCompass()
    }

    fun setReactCompassFadeWhenNorth(compassFadeWhenNorth: Boolean) {
        mCompassFadeWhenNorth = compassFadeWhenNorth
        updateCompass()
    }

    fun setReactCompassViewMargins(compassViewMargins: ReadableMap) {
        mCompassSettings.margins = compassViewMargins
        updateCompass()
    }

    fun setReactCompassViewPosition(compassViewPosition: Int) {
        mCompassSettings.position = compassViewPosition
        updateCompass()
    }

    fun setReactCompassPosition(compassPosition: ReadableMap) {
        mCompassSettings.setPosAndMargins(compassPosition)
        updateCompass()
    }

    private fun updateCompass() {
        compass.updateSettings {
            fadeWhenFacingNorth = mCompassFadeWhenNorth
            updateOrnament("compass", mCompassSettings, this.toGenericOrnamentSettings())
        }
    }

    var mScaleBarSettings = OrnamentSettings(enabled = false)

    fun setReactScaleBarEnabled(scaleBarEnabled: Boolean) {
        mScaleBarSettings.enabled = scaleBarEnabled
        updateScaleBar()
    }

    fun setReactScaleBarViewMargins(scaleBarMargins: ReadableMap) {
        mScaleBarSettings.margins = scaleBarMargins
        updateScaleBar()
    }

    fun setReactScaleBarViewPosition(scaleBarPosition: Int) {
        mScaleBarSettings.position = scaleBarPosition
        updateScaleBar()
    }

    fun setReactScaleBarPosition(scaleBarPosition: ReadableMap) {
        mScaleBarSettings.setPosAndMargins(scaleBarPosition)
        updateScaleBar()
    }

    private fun updateScaleBar() {
        scalebar.updateSettings {
            updateOrnament("scaleBar", mScaleBarSettings, this.toGenericOrnamentSettings())
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

    var mLogoSettings = OrnamentSettings(enabled = null)

    fun setReactLogoEnabled(enabled: Boolean?) {
        mLogoSettings.enabled = enabled
        updateLogo()
    }

    fun setReactLogoMargins(margins: ReadableMap) {
        mLogoSettings.margins = margins
        updateLogo()
    }

    fun setReactLogoViewPosition(position: Int) {
        mLogoSettings.position = position
        updateLogo()
    }

    fun setReactLogoPosition(position: ReadableMap?) {
        mLogoSettings.setPosAndMargins(position)
        updateLogo()
    }

    private fun updateLogo() {
        logo.updateSettings {
            updateOrnament("logo", mLogoSettings, this.toGenericOrnamentSettings())
        }

        logo.updateSettings {
            println(String.format("logo :: position - before 0x%08x", position))
            //position = Gravity.BOTTOM or Gravity.RIGHT
            println(String.format("eq bottom|right %b", position == (Gravity.BOTTOM or Gravity.RIGHT)))
            if (position == Gravity.BOTTOM or Gravity.RIGHT) {
                position = Gravity.BOTTOM or Gravity.RIGHT
            }
            println(String.format("logo :: position - after 0x%08x", position))
        }
    }
/*
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
 */
    // endregion

    // region lifecycle
    private var lifecycleOwner : RCTMGLMapViewLifecycleOwner? = null

    override fun onDetachedFromWindow() {
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        super.onDetachedFromWindow();
    }

    override fun onDestroy() {
        removeAllFeatures()
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
        super.onDestroy()
    }

    fun onDropViewInstance() {
        removeAllFeatures()
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    }

    override fun onAttachedToWindow() {
        if (lifecycleOwner == null) {
            lifecycleOwner = object : RCTMGLMapViewLifecycleOwner {
                private lateinit var lifecycleRegistry: LifecycleRegistry
                init {
                    lifecycleRegistry = LifecycleRegistry(this)
                    lifecycleRegistry.currentState = Lifecycle.State.CREATED
                }

                override fun handleLifecycleEvent(event: Lifecycle.Event) {
                    lifecycleRegistry.handleLifecycleEvent(event)
                }

                override fun getLifecycle(): Lifecycle {
                    return lifecycleRegistry
                }
            }
            ViewTreeLifecycleOwner.set(this, lifecycleOwner);
        } else {
            lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
        }
        super.onAttachedToWindow()
    }

    // endregion
}

fun OrnamentSettings.setPosAndMargins(posAndMargins: ReadableMap?) {
    if (posAndMargins == null) { return }

    val bottom_mask = 1;
    val right_mask = 2;

    var margins = WritableNativeMap()
    var position = 0;
    if (posAndMargins
            .hasKey("bottom")) {
        margins.putInt("y", posAndMargins.getInt("bottom"))
        position = position or bottom_mask
    } else {
        if (posAndMargins.hasKey("top")) {
            margins.putInt("y", posAndMargins.getInt("top"))
        }
    }

    if (posAndMargins.hasKey("left")) {
        margins.putInt("x", posAndMargins.getInt("left"))
    } else {
        if (posAndMargins.hasKey("right")) {
            position = position or right_mask
            margins.putInt("x", posAndMargins.getInt("right"))
        }
    }
    this.position = position
    this.margins = margins
}

interface GenericOrnamentSettings {
    fun setHMargins(left: Float?, right: Float?)
    fun setVMargins(top: Float?, bottom: Float?)
    var enabled: Boolean
    var position: Int
}

fun ScaleBarSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private val settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) { settings.position = value }
}

fun CompassSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private val settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) { settings.position = value }
}

fun LogoSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private val settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) {
            println(String.format("logo :: position: 0x%08x", value))
            settings.position = value
        }
}
