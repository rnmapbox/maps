package com.rnmapbox.rnmbx.components.mapview

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.PointF
import android.graphics.RectF
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.View.OnLayoutChangeListener
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewTreeLifecycleOwner
import com.facebook.react.bridge.*
import com.mapbox.android.gestures.*
import com.mapbox.bindgen.Value
import com.mapbox.geojson.Feature
import com.mapbox.geojson.FeatureCollection
import com.mapbox.geojson.Point
import com.mapbox.maps.*
import com.mapbox.maps.extension.localization.localizeLabels
import com.mapbox.maps.extension.observable.eventdata.MapLoadingErrorEventData
import com.mapbox.maps.extension.observable.eventdata.RenderFrameFinishedEventData
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.layers.Layer
import com.mapbox.maps.extension.style.layers.generated.*
import com.mapbox.maps.extension.style.layers.getLayer
import com.mapbox.maps.extension.style.layers.properties.generated.ProjectionName
import com.mapbox.maps.extension.style.layers.properties.generated.Visibility
import com.mapbox.maps.extension.style.projection.generated.Projection
import com.mapbox.maps.extension.style.projection.generated.setProjection
import com.mapbox.maps.plugin.attribution.attribution
import com.mapbox.maps.plugin.compass.compass
import com.mapbox.maps.plugin.delegates.listeners.*
import com.mapbox.maps.plugin.gestures.*
import com.mapbox.maps.plugin.logo.logo
import com.mapbox.maps.plugin.scalebar.scalebar
import com.mapbox.maps.viewannotation.ViewAnnotationManager
import com.rnmapbox.rnmbx.R
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerView
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerViewManager
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotation
import com.rnmapbox.rnmbx.components.camera.RNMBXCamera
import com.rnmapbox.rnmbx.components.images.RNMBXImages
import com.rnmapbox.rnmbx.components.location.LocationComponentManager
import com.rnmapbox.rnmbx.components.location.RNMBXNativeUserLocation
import com.rnmapbox.rnmbx.components.mapview.helpers.CameraChangeReason
import com.rnmapbox.rnmbx.components.mapview.helpers.CameraChangeTracker
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXLayer
import com.rnmapbox.rnmbx.components.styles.light.RNMBXLight
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXSource
import com.rnmapbox.rnmbx.components.styles.terrain.RNMBXTerrain
import com.rnmapbox.rnmbx.events.CameraChangeEvent
import com.rnmapbox.rnmbx.events.IEvent
import com.rnmapbox.rnmbx.events.MapChangeEvent
import com.rnmapbox.rnmbx.events.MapClickEvent
import com.rnmapbox.rnmbx.events.constants.EventTypes
import com.rnmapbox.rnmbx.utils.*
import com.rnmapbox.rnmbx.utils.extensions.toReadableArray
import java.util.*

import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotationCoordinator
import com.rnmapbox.rnmbx.components.images.ImageManager

import com.rnmapbox.rnmbx.v11compat.event.*
import com.rnmapbox.rnmbx.v11compat.feature.*
import com.rnmapbox.rnmbx.v11compat.mapboxmap.*
import com.rnmapbox.rnmbx.v11compat.ornamentsettings.*
import org.json.JSONException
import org.json.JSONObject

fun <T> MutableList<T>.removeIf21(predicate: (T) -> Boolean): Boolean {
    var removed = false
    val iterator = this.iterator()
    while (iterator.hasNext()) {
        val element = iterator.next()
        if (predicate(element)) {
            iterator.remove()
            removed = true
        }
    }
    return removed
}

data class OrnamentSettings(
    var enabled : Boolean? = false,
    var margins: ReadableMap? =null,
    var position: Int = -1
)

enum class MapGestureType {
    Move,Scale,Rotate,Fling,Shove
}

/***
 * Mapbox's MapView observers lifecycle events see MapboxLifecyclePluginImpl - (ON_START, ON_STOP, ON_DESTROY)
 * We need to emulate those.
 */
interface RNMBXLifeCycleOwner : LifecycleOwner {
    fun handleLifecycleEvent(event: Lifecycle.Event)
}

fun interface Cancelable {
    fun cancel()
}

class RNMBXLifeCycle {
    private var lifecycleOwner : RNMBXLifeCycleOwner? = null

    fun onAttachedToWindow(view: View) {
        if (lifecycleOwner == null) {
            lifecycleOwner = object : RNMBXLifeCycleOwner {
                private lateinit var lifecycleRegistry: LifecycleRegistry
                init {
                    lifecycleRegistry = LifecycleRegistry(this)
                    lifecycleRegistry.currentState = Lifecycle.State.CREATED
                }

                override fun handleLifecycleEvent(event: Lifecycle.Event) {
                    try {
                        lifecycleRegistry.handleLifecycleEvent(event)
                    } catch (e: RuntimeException) {
                        Log.e("RNMBXMapView", "handleLifecycleEvent, handleLifecycleEvent error: $e")
                    }
                }

                override fun getLifecycle(): Lifecycle {
                    return lifecycleRegistry
                }
            }
            ViewTreeLifecycleOwner.set(view, lifecycleOwner);
        }
        lifecycleOwner?.handleLifecycleEvent(Lifecycle.Event.ON_START)
    }

    fun onDetachedFromWindow() {
        if (lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.DESTROYED) {
            return
        }
        lifecycleOwner?.handleLifecycleEvent(androidx.lifecycle.Lifecycle.Event.ON_STOP)
    }

    fun onDestroy() {
        if (lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.STARTED || lifecycleOwner?.lifecycle?.currentState == Lifecycle.State.RESUMED) {
            lifecycleOwner?.handleLifecycleEvent(androidx.lifecycle.Lifecycle.Event.ON_STOP)
        }
        if (lifecycleOwner?.lifecycle?.currentState != Lifecycle.State.DESTROYED) {
            lifecycleOwner?.handleLifecycleEvent(androidx.lifecycle.Lifecycle.Event.ON_DESTROY)
        }
    }

    fun getState() : Lifecycle.State {
        return lifecycleOwner?.lifecycle?.currentState ?: Lifecycle.State.INITIALIZED;
    }

    var attachedToWindowWaiters : MutableList<()-> Unit> = mutableListOf()

    fun callIfAttachedToWindow(callback: () -> Unit) : com.rnmapbox.rnmbx.components.mapview.Cancelable {
        if (getState() == Lifecycle.State.STARTED) {
            callback()
            return com.rnmapbox.rnmbx.components.mapview.Cancelable {}
        } else {
            attachedToWindowWaiters.add(callback)
            return com.rnmapbox.rnmbx.components.mapview.Cancelable {
                attachedToWindowWaiters.removeIf21 { it === callback }
            }
        }
    }

    fun afterAttachFromLooper() {
        attachedToWindowWaiters.forEach { it() }
        attachedToWindowWaiters.clear()
    }
}

data class FeatureEntry(val feature: AbstractMapFeature?, val view: View?, var addedToMap: Boolean = false) {

}

typealias Factory = (impl: String, ViewGroup) -> MapView?;
public class RNMBXMapViewFactory {
    companion object {
        var factories = mutableMapOf<String,Factory>();
        fun regiser(impl: String, factory: Factory) {
            val (impl, options) = impl.split(":",limit=2)
            factories.put(impl, factory);
        }

        fun get(impl: String): Factory? {
            val (impl, options) = impl.split(":",limit=2) + null;
            return factories.get(impl);
        }
    }
}

open class RNMBXMapView(private val mContext: Context, var mManager: RNMBXMapViewManager, options: MapInitOptions?) : FrameLayout(mContext), OnMapClickListener, OnMapLongClickListener, OnLayoutChangeListener {
    /**
     * `PointAnnotations` are rendered to a canvas, but the React Native `Image` component is
     * implemented on top of Fresco (https://frescolib.org), which does not load images for
     * views not attached to the window. This provides an offscreen view where views can
     * be rendered to the canvas before being added as annotations.
     */
    public var offscreenAnnotationViewContainer: ViewGroup? = null


    public var imageManager = ImageManager()

    private val mSources: MutableMap<String, RNMBXSource<*>>
    private val mImages: MutableList<RNMBXImages>
    public val pointAnnotations: RNMBXPointAnnotationCoordinator by lazy {
        val gesturesPlugin: GesturesPlugin = mapView.gestures
        gesturesPlugin.removeOnMapClickListener(this)
        gesturesPlugin.removeOnMapLongClickListener(this)

        val result = RNMBXPointAnnotationCoordinator(mapView)

        gesturesPlugin.addOnMapClickListener(this)
        gesturesPlugin.addOnMapLongClickListener(this)

        result
    }
    private var mProjection: ProjectionName = ProjectionName.MERCATOR
    private var mLocaleString: String? = null
    private var mLocaleLayerIds: List<String>? = null
    private var mStyleURL: String? = null
    val isDestroyed = false
    private var mCamera: RNMBXCamera? = null
    private val mFeatures = mutableListOf<FeatureEntry>()
    private var mQueuedFeatures: MutableList<AbstractMapFeature>? = ArrayList()
    private val mCameraChangeTracker = CameraChangeTracker()
    private lateinit var mMap: MapboxMap

    private lateinit var mMapView: MapView
    val isInitialized: Boolean
        get() = this::mMapView.isInitialized

    var savedStyle: Style? = null
        private set

    private var styleLoaded = false

    private var mHandledMapChangedEvents: HashSet<String>? = null
    private var mLocationComponentManager: LocationComponentManager? = null
    var tintColor: Int? = null
        private set

    private var wasGestureActive = false
    private var isGestureActive = false

    var mapViewImpl: String? = null

    val mapView: MapView
        get() = this.mMapView

    val viewAnnotationManager: ViewAnnotationManager
        get() = mapView.viewAnnotationManager

    var requestDisallowInterceptTouchEvent: Boolean = false
        set(value) {
            val oldValue = field
            field = value
            updateRequestDisallowInterceptTouchEvent(oldValue, value)
        }

    var deselectAnnotationOnTap = false

    fun getMapboxMap(): MapboxMap {
        return mapView.getMapboxMap()
    }

    override fun setId(id: Int) {
        super.setId(id)
        mManager.tagAssigned(id)
    }

    private fun styleLoaded(style: Style) {
        savedStyle = style
        styleLoaded = true
        setUpImage(style)
        addFeaturesToMap(true)
        applyLocalizeLabels()
        style.setProjection(Projection(mProjection))
    }

    private fun setupEvents(map: MapboxMap) {
       map.addOnRenderFrameFinishedListener(
           object: OnRenderFrameFinishedListener {
               override fun onRenderFrameFinished(eventData: RenderFrameFinishedEventData) {
                   handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_FRAME_FULLY)
               }
           }
       )
    }

    private fun onMapReady(map: MapboxMap) {
        map.getStyle(object : Style.OnStyleLoaded {
            override fun onStyleLoaded(style: Style) {
                styleLoaded(style)
            }
        })
        val _this = this

        map.addOnCameraChangeListener(OnCameraChangeListener { cameraChangedEventData ->
            handleMapChangedEvent(EventTypes.REGION_IS_CHANGING)
            handleMapChangedEvent(EventTypes.CAMERA_CHANGED)
        })

        map.addOnMapIdleListener(OnMapIdleListener { mapIdleEventData ->
            sendRegionDidChangeEvent()
            handleMapChangedEvent(EventTypes.MAP_IDLE);
        })

        val gesturesPlugin: GesturesPlugin = mapView.gestures
        gesturesPlugin.addOnMapLongClickListener(_this)
        gesturesPlugin.addOnMapClickListener(_this)

        gesturesPlugin.addOnFlingListener(object: OnFlingListener {
            override fun onFling() {
                mapGesture(MapGestureType.Fling, true)
            }
        })

        gesturesPlugin.addOnShoveListener(object: OnShoveListener {
            override fun onShove(detector: ShoveGestureDetector) {
                mapGesture(MapGestureType.Shove, detector)
            }

            override fun onShoveBegin(detector: ShoveGestureDetector) {
                mapGestureBegin(MapGestureType.Shove, detector)
            }

            override fun onShoveEnd(detector: ShoveGestureDetector) {
                mapGestureEnd(MapGestureType.Shove, detector)
            }
        })

        gesturesPlugin.addOnScaleListener(object: OnScaleListener{
            override fun onScale(detector: StandardScaleGestureDetector) {
                mapGesture(MapGestureType.Scale, detector)
            }
            override fun onScaleBegin(detector: StandardScaleGestureDetector) {
                mapGestureBegin(MapGestureType.Scale, detector)
            }
            override fun onScaleEnd(detector: StandardScaleGestureDetector) {
                mapGestureEnd(MapGestureType.Scale, detector)
            }
        })

        gesturesPlugin.addOnRotateListener(object: OnRotateListener{
            override fun onRotate(detector: RotateGestureDetector) {
                mapGesture(MapGestureType.Rotate, detector)
            }
            override fun onRotateBegin(detector: RotateGestureDetector) {
                mapGestureBegin(MapGestureType.Rotate, detector)
            }
            override fun onRotateEnd(detector: RotateGestureDetector) {
                mapGestureEnd(MapGestureType.Rotate, detector)
            }
        })

        gesturesPlugin.addOnMoveListener(object : OnMoveListener {
            override fun onMoveBegin(moveGestureDetector: MoveGestureDetector) {
                mapGestureBegin(MapGestureType.Move, moveGestureDetector)
            }

            override fun onMove(moveGestureDetector: MoveGestureDetector): Boolean {
                return mapGesture(MapGestureType.Move, moveGestureDetector)
            }

            override fun onMoveEnd(moveGestureDetector: MoveGestureDetector) {
                mapGestureEnd(MapGestureType.Move, moveGestureDetector)
            }
        })

        map.subscribe({ event ->
            Logger.e(LOG_TAG, String.format("Map load failed: %s", event.data.toString()))
            val errorMessage = event.getMapLoadingErrorEventData().message
            val event = MapChangeEvent(this, EventTypes.MAP_LOADING_ERROR, writableMapOf(
                    "error" to errorMessage
            ))
            mManager.handleEvent(event)

                      }, Arrays.asList(MapEvents.MAP_LOADING_ERROR))
    }

    fun<T> mapGestureBegin(type:MapGestureType, gesture: T) {
        isGestureActive = true
        mCameraChangeTracker.setReason(CameraChangeReason.USER_GESTURE)
        handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE)
    }
    fun<T> mapGesture(type: MapGestureType, gesture: T): Boolean {
        mCameraChangeTracker.setReason(CameraChangeReason.USER_GESTURE)
        handleMapChangedEvent(EventTypes.REGION_IS_CHANGING)
        return false
    }
    fun<T> mapGestureEnd(type: MapGestureType, gesture: T) {
        isGestureActive = false
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

    // region Features
    fun addFeature(childView: View?, childPosition: Int) {
        var feature: AbstractMapFeature? = null
        if (childView is RNMBXSource<*>) {
            val source = childView
            mSources[source.iD.toString()] = source
            feature = childView as AbstractMapFeature?
        } else if (childView is RNMBXImages) {
            mImages.add(childView)
            feature = childView
        } else if (childView is RNMBXLight) {
            feature = childView
        } else if (childView is RNMBXTerrain) {
            feature = childView as AbstractMapFeature?
        } else if (childView is RNMBXNativeUserLocation) {
            feature = childView
        } else if (childView is RNMBXPointAnnotation) {
            val annotation = childView
            pointAnnotations.add(annotation)
            feature = childView
        } else if (childView is RNMBXMarkerView) {
            feature = childView
        } else if (childView is RNMBXCamera) {
            mCamera = childView
            feature = childView
        } else if (childView is RNMBXLayer<*>) {
            feature = childView as AbstractMapFeature?
        } else if (childView is AbstractMapFeature) {
            feature = childView as AbstractMapFeature
        } else if (childView is ViewGroup) {
            val children = childView
            Logger.w(LOG_TAG, "Adding non map components:${children.javaClass.name} as a child of a map is deprecated!")
            //for (i in 0 until children.childCount) {
            //    addView(children.getChildAt(i), childPosition)
            //}
        }

        val addToMap = styleLoaded || (feature?.requiresStyleLoad == false)

        var entry = FeatureEntry(feature, childView, false)
        if (addToMap) {
            feature?.addToMap(this)
            entry.addedToMap = true
        }
        mFeatures.add(childPosition, entry);
    }

    fun removeFeatureAt(childPosition: Int) {
        val entry = mFeatures[childPosition]
        val feature = entry.feature
        if (feature is RNMBXSource<*>) {
            mSources.remove(feature.iD)
        } else if (feature is RNMBXPointAnnotation) {
            val annotation = feature
            pointAnnotations.remove(annotation)
        } else if (feature is RNMBXImages) {
            mImages.remove(feature)
        }
        if (entry.addedToMap) {
            if (feature?.removeFromMap(this, RemovalReason.VIEW_REMOVAL) == true) {
                entry.addedToMap = false
            }
        }
        mFeatures.removeAt(childPosition)
    }

    val featureCount: Int
        get() = mFeatures.size

    fun getFeatureAt(i: Int): View? {
        return mFeatures[i].view
    }

    fun removeAllFeatureFromMap(reason: RemovalReason) {
        mFeatures.forEach {
            if (it.feature?.removeFromMap(this, reason) == true) {
                it.addedToMap = false
            }
        }
    }
    // endregion

    fun sendRegionChangeEvent(isAnimated: Boolean) {
        val didChangeEvent = MapChangeEvent(this, EventTypes.REGION_DID_CHANGE,
                makeRegionPayload(isAnimated))
        mManager.handleEvent(didChangeEvent)
        mCameraChangeTracker.setReason(CameraChangeReason.NONE)
    }

    private fun removeAllFeaturesFromMap(reason: RemovalReason) {
        mFeatures.forEach { it ->
            if (it.feature?.removeFromMap(this, reason) == true) {
                it.addedToMap = false
            }
        }
    }

    private fun addFeaturesToMap(styleLoaded: Boolean = false) {
        mFeatures.forEach {
            if (!it.addedToMap) {
                if (styleLoaded || it.feature?.requiresStyleLoad == false) {
                    it.feature?.addToMap(this)
                    it.addedToMap = true
                }
            }
        }
    }


    private val allTouchableSources: List<RNMBXSource<*>>
        private get() {
            val sources: MutableList<RNMBXSource<*>> = ArrayList()
            for (key in mSources.keys) {
                val source = mSources[key]
                if (source != null && source.hasPressListener()) {
                    sources.add(source)
                }
            }
            return sources
        }

    private fun getTouchableSourceWithHighestZIndex(sources: List<RNMBXSource<*>>?): RNMBXSource<*>? {
        if (sources == null || sources.size == 0) {
            return null
        }
        if (sources.size == 1) {
            return sources[0]
        }
        val layerToSourceMap: MutableMap<String, RNMBXSource<*>> = HashMap()
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

    // region properties
    var surfaceView: Boolean? = null

    enum class Property(val _apply: (RNMBXMapView) -> Unit) : PropertyUpdaterWithName<RNMBXMapView> {
        PROJECTION(RNMBXMapView::applyProjection),
        LOCALIZE_LABELS(RNMBXMapView::applyLocalizeLabels),
        STYLE_URL(RNMBXMapView::applyStyleURL),
        ATTRIBUTION(RNMBXMapView::applyAttribution),
        LOGO(RNMBXMapView::applyLogo),
        SCALEBAR(RNMBXMapView::applyScaleBar),
        COMPASS(RNMBXMapView::applyCompass),;

        override fun apply(mapView: RNMBXMapView) {
           _apply(mapView)
        }
    }

    val changes = PropertyChanges<RNMBXMapView>();

    var withMapWaiters = mutableListOf<(map: MapView)->Unit>();
    fun withMap(callback: (map: MapboxMap) -> Unit) {
        if (! this::mMap.isInitialized) {
            withMapWaiters.add { it -> callback(it.getMapboxMap()) }
        } else {
            callback(mMap)
        }
    }
    fun withMapView(callback: (map: MapView) -> Unit) {
        if (! this::mMapView.isInitialized) {
            withMapWaiters.add(callback)
        } else {
            callback(mMapView)
        }
    }
    fun applyAllChanges() {
        if (! this::mMapView.isInitialized) {
            createMapView()
            withMapWaiters.forEach { it(mMapView) }
            withMapWaiters.clear()
        }
        changes.apply(this)
    }


    fun setReactProjection(projection: ProjectionName) {
        if (projection != null) {
            mProjection = projection
        }
        changes.add(Property.PROJECTION)
    }

    fun applyProjection() {
        if (mMap != null) {
            mMap.getStyle()?.setProjection(Projection(mProjection))
        }
    }

    fun applyLocalizeLabels() {
        val localeStr = mLocaleString
        if (localeStr != null) {
            val locale = if (localeStr == "current") Locale.getDefault() else Locale.Builder()
                .setLanguageTag(localeStr).build()
            savedStyle?.localizeLabels(locale, mLocaleLayerIds)
        }
    }
    fun setReactLocalizeLabels(localeStr: String?, layerIds: List<String>?) {
        if (localeStr != null) {
            mLocaleString = localeStr
            mLocaleLayerIds = layerIds
        }
        changes.add(Property.LOCALIZE_LABELS)
    }

    fun setReactStyleURL(styleURL: String) {
        mStyleURL = styleURL
        changes.add(Property.STYLE_URL)
    }
    fun applyStyleURL() {
        val styleURL = mStyleURL
        if (mMap != null && styleURL != null) {
            removeAllFeatureFromMap(RemovalReason.STYLE_CHANGE)
            if (isJSONValid(styleURL)) {
                styleLoaded = false
                mMap.loadStyleJson(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        styleLoaded(style)
                    }
                })
            } else {
                styleLoaded = false
                mMap.loadStyleUri(styleURL, object : Style.OnStyleLoaded {
                    override fun onStyleLoaded(style: Style) {
                        styleLoaded(style)
                    }
                },
                    object : OnMapLoadErrorListener {
                        override fun onMapLoadError(mapLoadingErrorEventData: MapLoadingErrorEventData) {
                            Logger.w("MapLoadError", mapLoadingErrorEventData.message)
                        }
                    }
                )
                addFeaturesToMap(false)
            }
        }
    }
    //endregion

    interface HandleTap {
        fun run(hitTouchableSources: List<RNMBXSource<*>?>?, hits: Map<String?, List<Feature?>?>)
    }

    fun handleTapInSources(
            sources: LinkedList<RNMBXSource<*>>, screenPoint: ScreenCoordinate,
            hits: HashMap<String?, List<Feature?>?>,
            hitTouchableSources: ArrayList<RNMBXSource<*>?>,
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
            mapView.getMapboxMap().queryRenderedFeatures(RenderedQueryGeometry(screenBox),
                    RenderedQueryOptions(
                            source.layerIDs,
                            null
                    )
            ) { features ->
                if (features.isValue) {
                    features.value?.let { features ->
                        if (features.size > 0) {
                            val featuresList = ArrayList<Feature?>()
                            for (i in features) {
                                featuresList.add(i.feature)
                            }
                            hits[source.iD] = featuresList
                            hitTouchableSources.add(source)
                        }
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
        if (pointAnnotations.getAndClearAnnotationClicked()) {
            return true
        }
        if (deselectAnnotationOnTap) {
            if (pointAnnotations.deselectSelectedAnnotation()) {
                return true
            }
        }
        val screenPoint = mMap?.pixelForCoordinate(point)
        val touchableSources = allTouchableSources
        val hits = HashMap<String?, List<Feature?>?>()
        if (screenPoint != null) {
            handleTapInSources(LinkedList(touchableSources), screenPoint, hits, ArrayList(), object : HandleTap {
                override fun run(hitTouchableSources: List<RNMBXSource<*>?>?, hits: Map<String?, List<Feature?>?>) {
                    if (hits.size > 0) {
                        val source = getTouchableSourceWithHighestZIndex(hitTouchableSources as List<RNMBXSource<*>>?)
                        if (source != null && source.hasPressListener() && source.iD != null && source.iD in hits) {
                            source.onPress(RNMBXSource.OnPressEvent(
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
        if (pointAnnotations.getAndClearAnnotationDragged()) {
            return true
        }
        val screenPoint = mMap?.pixelForCoordinate(point)
        if (screenPoint != null) {
            val event = MapClickEvent(_this, LatLng(point), screenPoint, EventTypes.MAP_LONG_CLICK)
            mManager.handleEvent(event)
        }

        return false
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

    // region Events

    fun sendRegionDidChangeEvent() {
        handleMapChangedEvent(EventTypes.REGION_DID_CHANGE)
        mCameraChangeTracker.setReason(CameraChangeReason.NONE)
    }

    private fun handleMapChangedEvent(eventType: String) {
        this.wasGestureActive = isGestureActive
        if (!canHandleEvent(eventType)) return

        val event: IEvent
        event = when (eventType) {
            EventTypes.REGION_WILL_CHANGE, EventTypes.REGION_DID_CHANGE, EventTypes.REGION_IS_CHANGING -> MapChangeEvent(this, eventType, makeRegionPayload(null))
            EventTypes.CAMERA_CHANGED -> CameraChangeEvent(this, eventType, makeCameraPayload())
            EventTypes.MAP_IDLE -> MapChangeEvent(this, eventType, makeCameraPayload())
            else -> MapChangeEvent(this, eventType)
        }
        mManager.handleEvent(event)
    }

    fun setHandledMapChangedEvents(events: Array<String>) {
        mHandledMapChangedEvents = HashSet<String>(events.asList())
    }

    private fun canHandleEvent(event: String): Boolean {
        val changedEvents = mHandledMapChangedEvents
        return changedEvents == null || changedEvents.contains(event)
    }

    private fun makeCameraPayload(): WritableMap {
        val position = mMap?.cameraState ?: return WritableNativeMap()
        val properties = WritableNativeMap()
        properties.putDouble("zoom", position.zoom)
        properties.putDouble("heading", position.bearing)
        properties.putDouble("pitch", position.pitch)
        properties.putArray("center", position.center.toReadableArray())
        try {
            val bounds = mMap.coordinateBoundsForCamera(position.toCameraOptions())

            val boundsMap = WritableNativeMap()
            boundsMap.putArray("ne", bounds.northeast.toReadableArray())
            boundsMap.putArray("sw", bounds.southwest.toReadableArray())

            properties.putMap("bounds", boundsMap)
        } catch (ex: Exception) {
            Logger.e(LOG_TAG, "An error occurred while attempting to make the region", ex)
        }
        val gestures = WritableNativeMap()
        gestures.putBoolean("isGestureActive", wasGestureActive/*mCameraChangeTracker.isUserInteraction*/)
        // gestures.putBoolean("isAnimatingFromGesture", if (null == isAnimated) mCameraChangeTracker.isAnimated else isAnimated)

        val state: WritableMap = WritableNativeMap()
        state.putMap("properties", properties)
        state.putMap("gestures", gestures)

        state.putDouble("timestamp", System.currentTimeMillis().toDouble())

        return state
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

    // endregion

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
        mapReady.onMapReady(mapView.getMapboxMap())
    }

    //fun setTintColor(color: Int) {
    //    tintColor = color
    //    if (mLocationComponentManager != null) {
    //        mLocationComponentManager.tintColorChanged()
    //    }
    //}

    // region Methods

    fun getCenter(response: CommandResponse) {
        var center = mMap!!.cameraState!!.center

        response.success {
            val array: WritableArray = WritableNativeArray()
            array.pushDouble(center.longitude())
            array.pushDouble(center.latitude())
            it.putArray("center", array)
        }
    }

    fun getZoom(response: CommandResponse) {
        var zoom = mMap!!.cameraState!!.zoom

        response.success {
            it.putDouble("zoom", zoom)
        }
    }

    private fun getDisplayDensity(): Float {
        return mContext.resources.displayMetrics.density
    }

    fun getCoordinateFromView(pixel: ScreenCoordinate, response: CommandResponse) {
        val density: Float = getDisplayDensity()
        val screenCoordinate = ScreenCoordinate(pixel.x * density, pixel.y * density)

        val coordinate = mMap!!.coordinateForPixel(screenCoordinate)

        response.success {
            it.putArray("coordinateFromView", coordinate.toReadableArray())
        }
    }

    fun getPointInView(coordinate: Point, response: CommandResponse) {
        val point = mMap!!.pixelForCoordinate(coordinate)

        response.success {
            val array: WritableArray = WritableNativeArray()
            array.pushDouble(point.x)
            array.pushDouble(point.y)
            it.putArray("pointInView", array)
        }
    }

    fun queryRenderedFeaturesAtPoint(point: PointF, filter: Expression?, layerIDs: List<String>?, response: CommandResponse) {
        if (mMap == null) {
            Logger.e("queryRenderedFeaturesAtPoint", "mapbox map is null")
            return
        }
        val screenCoordinate = ScreenCoordinate(point.x.toDouble(), point.y.toDouble())
        val queryGeometry = RenderedQueryGeometry(screenCoordinate)
        val layers = layerIDs?.takeUnless { it.isEmpty() } ?: null;
        val queryOptions = RenderedQueryOptions(layers, filter)
        mMap.queryRenderedFeatures(queryGeometry, queryOptions) { features ->
            if (features.isValue) {
                val featuresList = ArrayList<Feature?>()
                for (i in features.value!!) {
                    featuresList.add(i.feature)
                }
                response.success {
                    it.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())
                }
            } else {
                response.error(features.error ?: "n/a")
            }
        }
    }

    fun queryRenderedFeaturesInRect(rect: RectF?, filter: Expression?, layerIDs: List<String>?, response: CommandResponse) {
        val size = mMap!!.getMapOptions().size
        val screenBox = if (rect == null) ScreenBox(ScreenCoordinate(0.0, 0.0), ScreenCoordinate(size?.width!!.toDouble(), size?.height!!.toDouble())) else ScreenBox(
                ScreenCoordinate(rect.right.toDouble(), rect.bottom.toDouble() ),
                ScreenCoordinate(rect.left.toDouble(), rect.top.toDouble()),
        )
        mMap.queryRenderedFeatures(
                RenderedQueryGeometry(screenBox),
                RenderedQueryOptions(layerIDs, filter)
        ) { features ->
            if (features.isValue) {
                val featuresList = ArrayList<Feature?>()
                for (i in features.value!!) {
                    featuresList.add(i.feature)
                }

                response.success {
                   it.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())
                }
            } else {
                response.error(features.error ?: "n/a")
            }
        }
    }

    fun querySourceFeatures(sourceId: String, filter: Expression?, sourceLayerIDs: List<String>?, response: CommandResponse) {
        mMap?.querySourceFeatures(
                sourceId,
                SourceQueryOptions(sourceLayerIDs, (filter ?: Value.nullValue()) as Value),
        ) { features ->
            if (features.isValue) {
                val featuresList = ArrayList<Feature?>()
                for (i in features.value!!) {
                    featuresList.add(i.feature)
                }

                response.success {
                    it.putString("data", FeatureCollection.fromFeatures(featuresList).toJson())
                }
            } else {
                response.error(features.error ?: "n/a")
            }
        }
    }

    fun getVisibleBounds(response: CommandResponse) {
        val bounds = mMap!!.coordinateBoundsForCamera(mMap!!.cameraState.toCameraOptions())

        response.success {
            it.putArray("visibleBounds", bounds.toReadableArray())
        }
    }

    fun takeSnap(writeToDisk: Boolean, response: CommandResponse) {
        mapView.snapshot { snapshot ->
            if (snapshot == null) {
                response.error("snapshot failed")
            } else {
                val uri: String? = if (writeToDisk) BitmapUtils.createTempFile(
                    mContext,
                    snapshot
                ) else BitmapUtils.createBase64(snapshot)

                response.success {
                    uri?.let { uri ->
                        it.putString("uri", uri)
                    }
                }
            }
        }
    }

    fun queryTerrainElevation(longitude: Double, latitude: Double, response: CommandResponse) {
        val result = mMap?.getElevation(Point.fromLngLat(longitude, latitude))

        if (result != null) {
            response.success {
                it.putDouble("data", result)
            }
        } else {
            response.error("no elevation data")
        }
    }

    fun clearData(response: CommandResponse) {
        mapView.getMapboxMap().clearData { expected ->
            if (expected.isError()) {
                response.error(expected.error!!.toString())
            } else {
                response.success { it.putBoolean("data", true) }
            }
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
        val style = mMap.getStyle();

        val styleLayers = style?.styleLayers
        if (styleLayers == null) {
            Logger.e("MapView", "setSourceVisibility, map.getStyle().styleLayers is null")
            return
        }

        styleLayers.forEach {
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
        const val LOG_TAG = "RNMBXMapView"
    }

    fun createAndAddMapView(mapViewImpl: String): MapView? {
        RNMBXMapViewFactory.get(mapViewImpl)?.let {
            return it(mapViewImpl, this);
        }
        return null;
    }

    fun createMapView() : MapView {
        var created = false;
        mapViewImpl?.also {impl ->
            createAndAddMapView(impl)?.let { mapView ->
                mMapView = mapView
                created = true;
            }
        }
        if (!created) {
            var options: MapInitOptions? = null
            if (surfaceView == false) {
                options = MapInitOptions(context = mContext, textureView = true)
            }
            val mapView = if (options != null) MapView(mContext, options) else MapView(mContext)
            mMapView = mapView


            val matchParent = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            mapView.setLayoutParams(matchParent)
            addView(mapView)
        }
        this.addOnLayoutChangeListener(this)

        val map = mapView.getMapboxMap()
        mMap = map

        val _this = this

        onMapReady(map)

        map.addOnMapLoadedListener(OnMapLoadedListener { (begin, end) -> _this.handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_MAP) })
        map.addOnStyleLoadedListener(OnStyleLoadedListener { (begin, end) -> _this.handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_STYLE) })
        map.addOnStyleImageMissingListener(OnStyleImageMissingListener { (begin, end, id) ->
            for (images in mImages) {
                if (images.addMissingImageToStyle(id, map)) {
                    return@OnStyleImageMissingListener
                }
            }
            for (images in mImages) {
                images.sendImageMissingEvent(id, map)
            }
        })

        RNMBXMarkerViewManager.markerViewContainerSizeFixer(this, mapView.viewAnnotationManager)

        this.setupEvents(map)
        return mapView
    }

    init {
        offscreenAnnotationViewContainer = FrameLayout(getContext())
        val p = FrameLayout.LayoutParams(0, 0)
        p.setMargins(-10000, -10000, -10000, -10000)
        offscreenAnnotationViewContainer?.setLayoutParams(p)
        addView(offscreenAnnotationViewContainer)

        mSources = HashMap()
        mImages = ArrayList()
    }

    // region Ornaments

    private fun toGravity(kind: String, viewPosition: Int): Int {
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
        changes.add(Property.COMPASS)
    }

    fun setReactCompassFadeWhenNorth(compassFadeWhenNorth: Boolean) {
        mCompassFadeWhenNorth = compassFadeWhenNorth
        changes.add(Property.COMPASS)
    }

    fun setReactCompassViewMargins(compassViewMargins: ReadableMap) {
        mCompassSettings.margins = compassViewMargins
        changes.add(Property.COMPASS)
    }

    fun setReactCompassViewPosition(compassViewPosition: Int) {
        mCompassSettings.position = compassViewPosition
        changes.add(Property.COMPASS)
    }

    fun setReactCompassPosition(compassPosition: ReadableMap) {
        mCompassSettings.setPosAndMargins(compassPosition)
        changes.add(Property.COMPASS)
    }

    private fun applyCompass() {
        mapView.compass.updateSettings {
            fadeWhenFacingNorth = mCompassFadeWhenNorth
            updateOrnament("compass", mCompassSettings, this.toGenericOrnamentSettings())
        }
        workaroundToRelayoutChildOfMapView()
    }

    var mScaleBarSettings = OrnamentSettings(enabled = false)

    fun setReactScaleBarEnabled(scaleBarEnabled: Boolean) {
        mScaleBarSettings.enabled = scaleBarEnabled
        changes.add(Property.SCALEBAR)
    }

    fun setReactScaleBarViewMargins(scaleBarMargins: ReadableMap) {
        mScaleBarSettings.margins = scaleBarMargins
        changes.add(Property.SCALEBAR)
    }

    fun setReactScaleBarViewPosition(scaleBarPosition: Int) {
        mScaleBarSettings.position = scaleBarPosition
        changes.add(Property.SCALEBAR)
    }

    fun setReactScaleBarPosition(scaleBarPosition: ReadableMap) {
        mScaleBarSettings.setPosAndMargins(scaleBarPosition)
        changes.add(Property.SCALEBAR)
    }

    private fun applyScaleBar() {
        mapView.scalebar.updateSettings {
            updateOrnament("scaleBar", mScaleBarSettings, this.toGenericOrnamentSettings())
        }
        workaroundToRelayoutChildOfMapView()
    }

    fun workaroundToRelayoutChildOfMapView() {
        if (mapView.width == 0 && mapView.height == 0) {
            return
        }

        mapView.requestLayout();
        mapView.forceLayout();

        mapView.measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        );
        mapView.layout(mapView.left, mapView.top, mapView.right, mapView.bottom)
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
    var mAttributionSettings = OrnamentSettings(enabled = getAttributionSettings().enabled)

    fun setReactAttributionEnabled(attributionEnabled: Boolean?) {
        mAttributionSettings.enabled = attributionEnabled
        changes.add(Property.ATTRIBUTION)
    }

    fun setReactAttributionViewMargins(margins: ReadableMap) {
        mAttributionSettings.margins = margins
        changes.add(Property.ATTRIBUTION)
    }

    fun setReactAttributionViewPosition(position: Int) {
        mAttributionSettings.position = position
        changes.add(Property.ATTRIBUTION)
    }

    fun setReactAttributionPosition(position: ReadableMap?) {
        mAttributionSettings.setPosAndMargins(position)
        changes.add(Property.ATTRIBUTION)
    }

    private fun applyAttribution() {
        mapView.attribution.updateSettings {
            updateOrnament("attribution", mAttributionSettings, this.toGenericOrnamentSettings())
        }
        workaroundToRelayoutChildOfMapView()
    }
    //endregion

    // region Logo
    private var mLogoEnabled: Boolean? = null;
    private var mLogoGravity: Int? = null
    private var mLogoMargin: IntArray? = null

    var mLogoSettings = OrnamentSettings(enabled = null)

    fun setReactLogoEnabled(enabled: Boolean?) {
        mLogoSettings.enabled = enabled
        changes.add(Property.LOGO)
    }

    fun setReactLogoMargins(margins: ReadableMap) {
        mLogoSettings.margins = margins
        changes.add(Property.LOGO)
    }

    fun setReactLogoViewPosition(position: Int) {
        mLogoSettings.position = position
        changes.add(Property.LOGO)
    }

    fun setReactLogoPosition(position: ReadableMap?) {
        mLogoSettings.setPosAndMargins(position)
        changes.add(Property.LOGO)
    }

    private fun applyLogo() {
        mapView.logo.updateSettings {
            updateOrnament("logo", mLogoSettings, this.toGenericOrnamentSettings())
        }
        workaroundToRelayoutChildOfMapView()
    }
    // endregion

    // region lifecycle
    private val lifecycle : RNMBXLifeCycle by lazy { RNMBXLifeCycle() }

    fun getLifecycleState() : Lifecycle.State {
        return this.lifecycle.getState()
    }

    override fun onDetachedFromWindow() {
        lifecycle.onDetachedFromWindow()
        super.onDetachedFromWindow();
    }

    /* FMTODO
    override fun onDestroy() {
        this.removeOnLayoutChangeListener(this)
        removeAllFeaturesFromMap(RemovalReason.ON_DESTROY)
        mapView.viewAnnotationManager.removeAllViewAnnotations()
        mLocationComponentManager?.onDestroy();

        lifecycle.onDestroy()
        super.onDestroy()
    }
     */

    fun onDropViewInstance() {
        removeAllFeaturesFromMap(RemovalReason.ON_DESTROY)
        mapView.viewAnnotationManager.removeAllViewAnnotations()
        lifecycle.onDestroy()
    }

    override fun onAttachedToWindow() {
        lifecycle.onAttachedToWindow(this)
        super.onAttachedToWindow()
        Handler(Looper.getMainLooper()).post {
            lifecycle.afterAttachFromLooper()
        }
    }

    fun callIfAttachedToWindow(callback: () -> Unit) {
       lifecycle.callIfAttachedToWindow(callback)
    }

    override fun onLayoutChange(
        v: View?,
        left: Int,
        top: Int,
        right: Int,
        bottom: Int,
        oldLeft: Int,
        oldTop: Int,
        oldRight: Int,
        oldBottom: Int
    ) {
        mapView.post {
            mapView.measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
            )
            mapView.layout(mapView.left, mapView.top, mapView.right, mapView.bottom)
        }
    }


    // endregion
}

// region requestDisallowInterceptTouchEvent
fun RNMBXMapView.updateRequestDisallowInterceptTouchEvent(oldValue: Boolean, value: Boolean) {
    if (oldValue == value) {
        return
    }
    if (value) {
        withMapView {
            it.setOnTouchListener { view, event ->
                this.requestDisallowInterceptTouchEvent(true)
                mapView.onTouchEvent(event)
                true
            }
        }
    } else {
        withMapView {
            it.setOnTouchListener { view, event ->
                mapView.onTouchEvent(event)
            }
        }
    }
}
// endregion


fun OrnamentSettings.setPosAndMargins(posAndMargins: ReadableMap?) {
    if (posAndMargins == null) { return }

    val bottom_mask = 2;
    val right_mask = 1;

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



