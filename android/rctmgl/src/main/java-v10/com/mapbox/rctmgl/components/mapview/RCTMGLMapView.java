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
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.maps.plugin.gestures.OnMoveListener;
import com.mapbox.maps.plugin.gestures.MapboxMapUtils;
// import com.mapbox.maps.plugin.gestures.GesturesUtils;
import com.mapbox.maps.extension.style.layers.LayerUtils;
import com.mapbox.maps.plugin.delegates.MapPluginExtensionsDelegate;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener;
import com.mapbox.maps.plugin.delegates.listeners.eventdata.MapLoadErrorType;

import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;
/*
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerViewManager;
import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.images.RCTMGLImages;
import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocation;
*/
import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.images.RCTMGLImages;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
/*
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
*/
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
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

// import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.visibility;

public class RCTMGLMapView extends MapView implements OnMapClickListener {
    public static final String LOG_TAG = "RCTMGLMapView";
    RCTMGLMapViewManager mManager;
    private Map<String, RCTSource> mSources;
    private List<RCTMGLImages> mImages;

    private String mStyleURL;

    private boolean mDestroyed;

    private RCTMGLCamera mCamera;
    private List<AbstractMapFeature> mFeatures = new ArrayList<>();
    private List<AbstractMapFeature> mQueuedFeatures = new ArrayList<>();

    private CameraChangeTracker mCameraChangeTracker = new CameraChangeTracker();

    private MapboxMap mMap;

    private Style mSavedStyle;

    private HashSet<String> mHandledMapChangedEvents = null;



    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager/*, MapboxMapOptions options*/) {
        super(context);

        mManager = manager;
        mMap = this.getMapboxMap();
        mSources = new HashMap<>();
        mImages = new ArrayList<>();

        this.onMapReady(mMap);
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

        MapboxMapUtils.addOnMapClickListener(map, this);
        MapboxMapUtils.addOnMoveListener(map, new OnMoveListener() {

            @Override
            public void onMoveEnd(@NonNull MoveGestureDetector moveGestureDetector) {

            }

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
        });
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
            /*
        } else if (childView instanceof RCTMGLLight) {
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLNativeUserLocation) {
            feature = (AbstractMapFeature) childView;
        }  else if (childView instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) childView;
            mPointAnnotations.put(annotation.getID(), annotation);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLMarkerView) {
            RCTMGLMarkerView marker = (RCTMGLMarkerView) childView;
            feature = (AbstractMapFeature) childView; */
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

    public void removeFeature(int index) {
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
                        public void onMapLoadError(@NonNull MapLoadErrorType mapLoadErrorType, @NonNull String s) {
                            Logger.w("Hello","Hallo", null);
                        }
                    }
                );
            }
        }
    }

    @Override
    public boolean onMapClick(@NonNull Point point) {
        ScreenCoordinate screenPoint = mMap.pixelForCoordinate(point);

        MapClickEvent event = new MapClickEvent(this, new LatLng(point), screenPoint);
        mManager.handleEvent(event);
        return false;
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
            Logger.e(LOG_TAG, String.format("An error occurred while attempting to make the region: %s", ex.getMessage()));
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

    public Style getSavedStyle() {
        // v10todo, style gets null if we add anyhing
        return mSavedStyle;
    }
}