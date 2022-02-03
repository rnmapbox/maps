package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PointF;
import android.graphics.RectF;
import android.location.Location;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.annotation.UiThread;

import android.util.DisplayMetrics;
import android.util.Pair;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
// import com.mapbox.mapboxsdk.log.Logger;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.android.gestures.MoveGestureDetector;
import com.mapbox.bindgen.Expected;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
/*
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.maps.AttributionDialogManager;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.localization.LocalizationPlugin;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolClickListener;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolDragListener;
import com.mapbox.mapboxsdk.plugins.annotation.Symbol;
import com.mapbox.mapboxsdk.plugins.annotation.SymbolManager;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;

 */
import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraBounds;
import com.mapbox.maps.CameraState;
import com.mapbox.maps.Event;
import com.mapbox.maps.MapEvents;
import com.mapbox.maps.Observer;
import com.mapbox.maps.QueriedFeature;
import com.mapbox.maps.QueryFeaturesCallback;
import com.mapbox.maps.RenderedQueryOptions;
import com.mapbox.maps.ScreenBox;
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.maps.StyleObjectInfo;
import com.mapbox.maps.extension.observable.eventdata.MapLoadedEventData;
import com.mapbox.maps.extension.observable.eventdata.MapLoadingErrorEventData;
import com.mapbox.maps.plugin.annotation.AnnotationPlugin;
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotation;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadedListener;
import com.mapbox.maps.plugin.gestures.GesturesPlugin;
import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.maps.plugin.gestures.OnMoveListener;
import com.mapbox.maps.extension.style.layers.LayerUtils;
import com.mapbox.maps.plugin.delegates.MapPluginExtensionsDelegate;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener;
import com.mapbox.maps.extension.observable.model.MapLoadErrorType;
import com.mapbox.maps.plugin.delegates.MapPluginProviderDelegate;
import com.mapbox.maps.plugin.annotation.AnnotationPluginImplKt;
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManagerKt;

import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.maps.viewannotation.ViewAnnotationManager;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;

import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;

import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView;

import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.images.RCTMGLImages;
import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocation;

import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;

import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
/*import com.mapbox.rctmgl.events.AndroidCallbackEvent;
*/
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrain;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
/*
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.GeoViewport;

 */

import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.LatLng;
import com.mapbox.rctmgl.utils.Logger;
import com.mapbox.rctmgl.events.MapClickEvent;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import org.json.*;

import javax.annotation.Nullable;

import com.mapbox.maps.MapView;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.extension.style.layers.Layer;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener;

import kotlin.jvm.functions.Function1;



// import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.visibility;

public class RCTMGLMapView extends MapView implements OnMapClickListener {
    public static final String LOG_TAG = "RCTMGLMapView";
    RCTMGLMapViewManager mManager;
    private Context mContext;
    private Map<String, RCTSource> mSources;
    private List<RCTMGLImages> mImages;

    private PointAnnotationManager mPointAnnotationManager;
    private long mActiveMarkerID = -1;

    private String mStyleURL;

    private boolean mDestroyed;

    private RCTMGLCamera mCamera;
    private List<AbstractMapFeature> mFeatures = new ArrayList<>();
    private List<AbstractMapFeature> mQueuedFeatures = new ArrayList<>();
    private Map<String, RCTMGLPointAnnotation> mPointAnnotations;

    private CameraChangeTracker mCameraChangeTracker = new CameraChangeTracker();

    private MapboxMap mMap;

    private Style mSavedStyle;

    private HashSet<String> mHandledMapChangedEvents = null;

    private ViewGroup mOffscreenAnnotationViewContainer = null;
    private boolean mAnnotationClicked = false;

    private LocationComponentManager mLocationComponentManager = null;

    private Integer mTintColor = null;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager/*, MapboxMapOptions options*/) {
        super(context);
        mContext = context;

        mManager = manager;
        mMap = this.getMapboxMap();
        mSources = new HashMap<>();
        mImages = new ArrayList<>();
        mPointAnnotations = new HashMap<>();

        this.onMapReady(mMap);


        RCTMGLMapView _this = this;
        mMap.addOnMapLoadedListener(new OnMapLoadedListener() {
            @Override
            public void onMapLoaded(@NonNull MapLoadedEventData mapLoadedEventData) {
                _this.handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_MAP);
            }
        });
    }

    AnnotationPlugin getAnnotations() {
        return AnnotationPluginImplKt.getAnnotations(this);
    }

    public PointAnnotationManager getPointAnnotationManager() {
        if (mPointAnnotationManager == null) {
            RCTMGLMapView _this = this;
            mMap.gesturesPlugin(new Function1<GesturesPlugin, Object>() {
                @Override
                public Object invoke(GesturesPlugin gesturesPlugin) {
                    gesturesPlugin.removeOnMapClickListener(_this);
                    return null;
                }
            });

            mPointAnnotationManager = PointAnnotationManagerKt.createPointAnnotationManager(getAnnotations(), this);
            mPointAnnotationManager.addClickListener(new OnPointAnnotationClickListener() {
                     @Override
                     public boolean onAnnotationClick(@NonNull PointAnnotation pointAnnotation) {
                         onMarkerClick(pointAnnotation);
                         return false;
                     }
                 }
            );

            mMap.gesturesPlugin(new Function1<GesturesPlugin, Object>() {
                @Override
                public Object invoke(GesturesPlugin gesturesPlugin) {
                    gesturesPlugin.addOnMapClickListener(_this);
                    return null;
                }
            });
        }
        return mPointAnnotationManager;
    }

    private void onMapReady(MapboxMap map) {
        map.getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                mSavedStyle = style;
                createSymbolManager(style);
                setUpImage(style);
                addQueuedFeatures();
                setupLocalization(style);
            }
        });

        RCTMGLMapView _this = this;
        map.gesturesPlugin(new Function1<GesturesPlugin, Object>() {
            @Override
            public Object invoke(GesturesPlugin gesturesPlugin) {
                gesturesPlugin.addOnMapClickListener(_this);
                gesturesPlugin.addOnMoveListener(new OnMoveListener() {
                    @Override
                    public void onMoveBegin(@NonNull MoveGestureDetector moveGestureDetector) {
                        mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE);
                        handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE);
                    }

                    @Override
                    public boolean onMove(@NonNull MoveGestureDetector moveGestureDetector) {
                        mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE);
                        handleMapChangedEvent(EventTypes.REGION_IS_CHANGING);
                        return false;
                    }

                    @Override
                    public void onMoveEnd(@NonNull MoveGestureDetector moveGestureDetector) {
                    }
                });
                return null;
            }
        });

        map.subscribe(new Observer() {
            @Override
            public void notify(@NonNull Event event) {
                Logger.e(LOG_TAG, String.format("Map load failed: %s", event.getData().toString()));
            }
        }, Arrays.asList(MapEvents.MAP_LOADING_ERROR));
    }

    public void init() {
        // Required for rendering properly in Android Oreo
        getViewTreeObserver().dispatchOnGlobalLayout();
    }
    
    public boolean isDestroyed() {
        return mDestroyed;
    }

    public void getStyle(Style.OnStyleLoaded onStyleLoaded) {
        if (mMap == null) {
            return;
        }

        mMap.getStyle(onStyleLoaded);
    }

    public void addFeature(View childView, int childPosition) {
        AbstractMapFeature feature = null;

        if (childView instanceof RCTSource) {
            RCTSource source = (RCTSource) childView;
            mSources.put(source.getID(), source);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLImages) {
            RCTMGLImages images = (RCTMGLImages) childView;
            mImages.add(images);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLLight) {
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLTerrain) {
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLNativeUserLocation) {
            feature = (AbstractMapFeature) childView;
        }  else if (childView instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) childView;
            mPointAnnotations.put(annotation.getID(), annotation);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLMarkerView) {
            RCTMGLMarkerView marker = (RCTMGLMarkerView) childView;
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLCamera) {
            mCamera = (RCTMGLCamera) childView;
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTLayer) {
            feature = (RCTLayer) childView;
        } else if (childView instanceof ViewGroup) {
            ViewGroup children = (ViewGroup) childView;

            for (int i = 0; i < children.getChildCount(); i++) {
                addFeature(children.getChildAt(i), childPosition);
            }
        }

        if (feature != null) {
            if (mQueuedFeatures == null) {
                feature.addToMap(this);
                mFeatures.add(childPosition, feature);
            } else {
                mQueuedFeatures.add(childPosition, feature);
            }
        }
    }

    public void removeFeature(int childPosition) {
        AbstractMapFeature feature = features().get(childPosition);

        if (feature == null) {
            return;
         }

        if (feature instanceof RCTSource) {
            RCTSource source = (RCTSource) feature;
            mSources.remove(source.getID());
        } else if (feature instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) feature;

            if (annotation.getMapboxID() == mActiveMarkerID) {
                mActiveMarkerID = -1;
            }

            mPointAnnotations.remove(annotation.getID());
        } else if (feature instanceof RCTMGLImages) {
            RCTMGLImages images = (RCTMGLImages) feature;
            mImages.remove(images);
        }

        feature.removeFromMap(this);
        features().remove(feature);
    }

    private List<AbstractMapFeature> features() {
        if (mQueuedFeatures != null && mQueuedFeatures.size() > 0) {
            return mQueuedFeatures;
        } else {
            return mFeatures;
        }
    }

    public int getFeatureCount() {
        return features().size();
    }

    public AbstractMapFeature getFeatureAt(int i) {
        return features().get(i);
    }

    public void sendRegionChangeEvent(boolean isAnimated) {
        IEvent event = new MapChangeEvent(this, EventTypes.REGION_DID_CHANGE,
                makeRegionPayload(new Boolean(isAnimated)));

        mManager.handleEvent(event);
        mCameraChangeTracker.setReason(CameraChangeTracker.EMPTY);
    }

    private void removeAllSourcesFromMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.removeFromMap(this);
        }
    }

    private void addAllSourcesToMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.addToMap(this);
        }
    }

    private List<RCTSource> getAllTouchableSources() {
        List<RCTSource> sources = new ArrayList<>();

        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            if (source != null && source.hasPressListener()) {
                sources.add(source);
            }
        }

        return sources;
    }

    private RCTSource getTouchableSourceWithHighestZIndex(List<RCTSource> sources) {
        if (sources == null || sources.size() == 0) {
            return null;
        }

        if (sources.size() == 1) {
            return sources.get(0);
        }

        Map<String, RCTSource> layerToSourceMap = new HashMap<>();
        for (RCTSource source : sources) {
            List<String> layerIDs = source.getLayerIDs();

            for (String layerID : layerIDs) {
                layerToSourceMap.put(layerID, source);
            }
        }

        List<StyleObjectInfo> mapboxLayers = mMap.getStyle().getStyleLayers();
        for (int i = mapboxLayers.size() - 1; i >= 0; i--) {
            StyleObjectInfo mapboxLayer = mapboxLayers.get(i);

            String layerID = mapboxLayer.getId();
            if (layerToSourceMap.containsKey(layerID)) {
                return layerToSourceMap.get(layerID);
            }
        }

        return null;
    }

    public boolean isJSONValid(String test) {
        try {
            new JSONObject(test);
        } catch (JSONException ex) {
            return false;
        }
        return true;
    }

    public void setReactStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            removeAllSourcesFromMap();

            if (isJSONValid(mStyleURL)) {

                mMap.loadStyleJson(mStyleURL, new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        addAllSourcesToMap();
                    }
                });
            } else {
                mMap.loadStyleUri(styleURL, new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        mSavedStyle = style;
                        addAllSourcesToMap();
                        addQueuedFeatures();
                    }},
                    new OnMapLoadErrorListener() {
                        @Override
                        public void onMapLoadError(@NonNull MapLoadingErrorEventData mapLoadingErrorEventData) {
                            Logger.w("MapLoadError",mapLoadingErrorEventData.getMessage());
                        }
                    }
                );
            }
        }
    }

    interface HandleTap {
        void run(List<RCTSource> hitTouchableSources, Map<String, List<Feature>> hits);
    };

    void handleTapInSources(
            LinkedList<RCTSource> sources, ScreenCoordinate screenPoint,
            HashMap<String, List<Feature>> hits,
            ArrayList<RCTSource> hitTouchableSources,
            HandleTap handleTap
            ) {
        if (sources.isEmpty()) {
            handleTap.run(hitTouchableSources, hits);
            return;
        }
        RCTSource source = sources.removeFirst();
        Map<String, Double> hitbox = source.getTouchHitbox();
        if (hitbox != null) {

            double halfWidth = hitbox.get("width").floatValue() / 2.0f;
            double halfHeight = hitbox.get("height").floatValue() / 2.0f;

            ScreenBox screenBox = new ScreenBox(
                    new ScreenCoordinate(screenPoint.getX() - halfWidth,
                            screenPoint.getY() - halfHeight
                    ),
                    new ScreenCoordinate(screenPoint.getX() + halfWidth,
                            screenPoint.getY() + halfHeight)
            );

            getMapboxMap().queryRenderedFeatures(screenBox,
                    new RenderedQueryOptions(
                            source.getLayerIDs(),
                            null
                    ),
                    new QueryFeaturesCallback() {
                        @Override
                        public void run(@NonNull Expected<String, List<QueriedFeature>> features) {
                            HashMap<String, List< Feature>> newHits = hits;
                            if (features.isValue()) {
                                if (features.getValue().size() > 0) {
                                    ArrayList<Feature> featuresList = new ArrayList<>();
                                    for (QueriedFeature i : features.getValue()) {
                                        featuresList.add(i.getFeature());
                                    }

                                    newHits.put(
                                            source.getID(),
                                            featuresList
                                    );
                                    hitTouchableSources.add(source);
                                }
                            } else {
                                Logger.e("handleTapInSources", features.getError());
                            }
                            handleTapInSources(sources, screenPoint, newHits, hitTouchableSources, handleTap);
                        }
                    }
            );

        }
    }

    @Override
    public boolean onMapClick(@NonNull Point point) {

        RCTMGLMapView _this = this;
        /*if (mPointAnnotationManager != nil) {
            getAnnotations()
        }*/
        if (mAnnotationClicked) {
            mAnnotationClicked = false;
            return true;
        }

        ScreenCoordinate screenPoint = mMap.pixelForCoordinate(point);
        List<RCTSource> touchableSources = getAllTouchableSources();
        HashMap<String, List<Feature>> hits = new HashMap<>();
        handleTapInSources(new LinkedList<>(touchableSources), screenPoint, hits, new ArrayList<>(), new HandleTap() {
            @Override
            public void run(List<RCTSource> hitTouchableSources, Map<String, List<Feature>> hits) {

                if (hits.size() > 0) {
                    RCTSource source = getTouchableSourceWithHighestZIndex(hitTouchableSources);
                    if (source != null && source.hasPressListener()) {
                        source.onPress(new RCTSource.OnPressEvent(
                                hits.get(source.getID()),
                                GeoJSONUtils.toLatLng(point),
                                new PointF((float)screenPoint.getX(), (float)screenPoint.getY())
                        ));
                        return;
                    }
                }

                MapClickEvent event = new MapClickEvent(_this, new LatLng(point), screenPoint);
                mManager.handleEvent(event);
            }
        });
        return false;
    }

    public void onMarkerClick(@NonNull PointAnnotation symbol) {
        mAnnotationClicked = true;
        final long selectedMarkerID = symbol.getId();

        RCTMGLPointAnnotation activeAnnotation = null;
        RCTMGLPointAnnotation nextActiveAnnotation = null;

        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);
            final long curMarkerID = annotation.getMapboxID();
            if (mActiveMarkerID == curMarkerID) {
                activeAnnotation = annotation;
            }
            if (selectedMarkerID == curMarkerID && mActiveMarkerID != curMarkerID) {
                nextActiveAnnotation = annotation;
            }
        }

        if (activeAnnotation != null) {
            deselectAnnotation(activeAnnotation);
        }

        if (nextActiveAnnotation != null) {
            selectAnnotation(nextActiveAnnotation);
        }
    }

    public void selectAnnotation(RCTMGLPointAnnotation annotation) {
        mActiveMarkerID = annotation.getMapboxID();
        annotation.onSelect(true);
    }

    public void deselectAnnotation(RCTMGLPointAnnotation annotation) {
        mActiveMarkerID = -1;
        annotation.onDeselect();
    }

    public interface FoundLayerCallback {
        public void found(Layer layer);
    }

    private Map<String, List<FoundLayerCallback>> layerWaiters = new HashMap<String, List<FoundLayerCallback>>();

    public void layerAdded(Layer layer) {
        String layerId = layer.getLayerId();

        List<FoundLayerCallback> callbacks = layerWaiters.get(layerId);
        if (callbacks != null) {
            for (FoundLayerCallback callback : callbacks) {
                callback.found(layer);
            }
        }
        layerWaiters.remove(layerId);
    }

    public void waitForLayer(String layerID, FoundLayerCallback callback) {
        if (getSavedStyle() != null) {
            Layer layer = LayerUtils.getLayer(getSavedStyle(), layerID);
            if (layer != null) {
                callback.found(layer);
                return;
            }
        }
        List<FoundLayerCallback> waiters = layerWaiters.get(layerID);
        if (waiters == null) {
            waiters = new ArrayList<FoundLayerCallback>();
            layerWaiters.put(layerID, waiters);
        }
        waiters.add(callback);
    }


    public void sendRegionDidChangeEvent() {
        handleMapChangedEvent(EventTypes.REGION_DID_CHANGE);
        mCameraChangeTracker.setReason(mCameraChangeTracker.EMPTY);
    }

    private void handleMapChangedEvent(String eventType) {
        if (!canHandleEvent(eventType))
            return;

        IEvent event;

        switch (eventType) {
            case EventTypes.REGION_WILL_CHANGE:
            case EventTypes.REGION_DID_CHANGE:
            case EventTypes.REGION_IS_CHANGING:
                event = new MapChangeEvent(this, eventType, makeRegionPayload(null));
                break;
            default:
                event = new MapChangeEvent(this, eventType);
        }

        mManager.handleEvent(event);
    }

    private boolean canHandleEvent(String event) {
        return mHandledMapChangedEvents == null || mHandledMapChangedEvents.contains(event);
    }

    private WritableMap makeRegionPayload(Boolean isAnimated) {
        CameraState position = mMap.getCameraState();
        if(position == null) {
            return new WritableNativeMap();
        }
        LatLng latLng = new LatLng(position.getCenter().latitude(), position.getCenter().longitude());

        WritableMap properties = new WritableNativeMap();

        properties.putDouble("zoomLevel", position.getZoom());
        properties.putDouble("heading", position.getBearing());
        properties.putDouble("pitch", position.getPitch());
        properties.putBoolean("animated",
                (null == isAnimated) ? mCameraChangeTracker.isAnimated() : isAnimated.booleanValue());
        properties.putBoolean("isUserInteraction", mCameraChangeTracker.isUserInteraction());

        try {
            CameraBounds bounds = mMap.getBounds();
            properties.putArray("visibleBounds", GeoJSONUtils.fromCameraBounds(bounds));
        } catch(Exception ex) {
            Logger.e(LOG_TAG, "An error occurred while attempting to make the region", ex);
        }

        return GeoJSONUtils.toPointFeature(latLng, properties);
    }

    public void createSymbolManager(Style style) {
        /*
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

    public void addQueuedFeatures() {
        if (mQueuedFeatures != null && mQueuedFeatures.size() > 0) {
            for (int i = 0; i < mQueuedFeatures.size(); i++) {
                AbstractMapFeature feature = mQueuedFeatures.get(i);
                feature.addToMap(this);
                mFeatures.add(feature);
            }
            mQueuedFeatures = null;
        }
    }

    private void setupLocalization(Style style) {
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
    private void setUpImage(@NonNull Style loadedStyle) {
        loadedStyle.addImage("MARKER_IMAGE_ID", BitmapFactory.decodeResource(
                this.getResources(), R.drawable.red_marker)
        );
    }

    /**
     * PointAnnotations are rendered to a canvas, but react native Image component is
     * implemented on top of Fresco, and fresco will not load images when their view is
     * not attached to the window. So we'll have an offscreen view where we add those views
     * so they can rendered full to canvas.
     */
    public ViewGroup offscreenAnnotationViewContainer() {
        if (mOffscreenAnnotationViewContainer == null) {
            mOffscreenAnnotationViewContainer = new FrameLayout(getContext());
            FrameLayout.LayoutParams flParams = new FrameLayout.LayoutParams(0,0);
            flParams.setMargins(-10000, -10000, -10000,-10000);
            mOffscreenAnnotationViewContainer.setLayoutParams(flParams);
            addView(mOffscreenAnnotationViewContainer);
        }
        return mOffscreenAnnotationViewContainer;
    }

    public Style getSavedStyle() {
        // v10todo, style gets null if we add anyhing
        return mSavedStyle;
    }

    public LocationComponentManager getLocationComponentManager() {
        if (mLocationComponentManager == null) {
            mLocationComponentManager = new LocationComponentManager(this, mContext);
        }
        return mLocationComponentManager;
    }

    public void getMapAsync(OnMapReadyCallback mapReady) {
        mapReady.onMapReady(getMapboxMap());
    }

    public Integer getTintColor() {
        return mTintColor;
    }

    void setTintColor(int color) {
        mTintColor = color;

        if (mLocationComponentManager != null) {
            mLocationComponentManager.tintColorChanged();
        }
    }

    public void queryTerrainElevation(String callbackID, double longitude, double latitude) {
        Double result = mMap.getElevation(Point.fromLngLat(longitude,latitude));

        WritableMap payload = new WritableNativeMap();
        payload.putDouble("data", result);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

}