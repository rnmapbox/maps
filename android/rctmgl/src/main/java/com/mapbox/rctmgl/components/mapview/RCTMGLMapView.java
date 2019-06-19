package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.PointF;
import android.graphics.RectF;
import android.location.Location;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.MotionEvent;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.android.core.permissions.PermissionsManager;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerView;
import com.mapbox.mapboxsdk.plugins.markerview.MarkerViewManager;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.localization.LocalizationPlugin;
// import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;
import com.mapbox.mapboxsdk.style.layers.PropertyFactory;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
import com.mapbox.rctmgl.components.annotation.RCTMGLCalloutAdapter;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotationAdapter;
import com.mapbox.rctmgl.components.camera.CameraStop;
import com.mapbox.rctmgl.components.camera.CameraUpdateQueue;
import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.MapClickEvent;
import com.mapbox.rctmgl.events.MapUserTrackingModeEvent;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.location.LocationManager;
import com.mapbox.rctmgl.location.UserLocation;
import com.mapbox.rctmgl.location.UserLocationLayerConstants;
import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
import com.mapbox.rctmgl.location.UserTrackingState;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.GeoViewport;
import com.mapbox.rctmgl.utils.SimpleEventCallback;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Locale;
import java.util.Map;

import javax.annotation.Nullable;


/**
 * Created by nickitaliano on 8/18/17.
 */

@SuppressWarnings({"MissingPermission"})
public class RCTMGLMapView extends MapView implements
        OnMapReadyCallback, MapboxMap.OnMapClickListener, MapboxMap.OnMapLongClickListener,
        /* MapView.OnMapChangedListener*/
        MapView.OnCameraDidChangeListener, MapView.OnDidFailLoadingMapListener,
        MapView.OnDidFinishLoadingMapListener, MapView.OnWillStartRenderingFrameListener,
        MapView.OnDidFinishRenderingFrameListener, MapView.OnWillStartRenderingMapListener,
        MapView.OnDidFinishRenderingMapListener, MapView.OnDidFinishLoadingStyleListener,
        MapboxMap.OnMarkerClickListener, MapView.OnStyleImageMissingListener {
    public static final String LOG_TAG = RCTMGLMapView.class.getSimpleName();

    private RCTMGLMapViewManager mManager;
    private Context mContext;
    private Handler mHandler;
    private LifecycleEventListener mLifeCycleListener;
    private boolean mPaused;
    private boolean mDestroyed;

    private RCTMGLCamera mCamera;
    private List<AbstractMapFeature> mFeatures;
    private List<AbstractMapFeature> mQueuedFeatures;
    private Map<String, RCTMGLPointAnnotation> mPointAnnotations;
    private Map<String, RCTSource> mSources;

    private CameraChangeTracker mCameraChangeTracker = new CameraChangeTracker();
    private Map<Integer, ReadableArray> mPreRenderMethodMap = new HashMap<>();

    private MapboxMap mMap;

    private String mStyleURL;

    private boolean mLocalizeLabels;
    private Boolean mScrollEnabled;
    private Boolean mPitchEnabled;
    private Boolean mRotateEnabled;
    private Boolean mAttributionEnabled;
    private Boolean mLogoEnabled;
    private Boolean mCompassEnabled;
    private Boolean mZoomEnabled;

    private MarkerViewManager markerViewManager;

    private long mActiveMarkerID = -1;

    private ReadableArray mInsets;

    private HashSet<String> mHandledMapChangedEvents = null;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager, MapboxMapOptions options) {
        super(context, options);

        mContext = context;

        onCreate(null);
        onStart();
        onResume();
        getMapAsync(this);

        mManager = manager;

        mSources = new HashMap<>();
        mPointAnnotations = new HashMap<>();
        mQueuedFeatures = new ArrayList<>();
        mFeatures = new ArrayList<>();

        mHandler = new Handler();

        setLifecycleListeners();

//        addOnMapChangedListener(this);
        addOnCameraDidChangeListener(this);
        addOnDidFailLoadingMapListener(this);
        addOnDidFinishLoadingMapListener(this);
        addOnStyleImageMissingListener(this);

        addOnWillStartRenderingFrameListener(this);
        addOnDidFinishRenderingFrameListener(this);
        addOnWillStartRenderingMapListener(this);
        addOnDidFinishRenderingMapListener(this);
        addOnDidFinishLoadingStyleListener(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        mPaused = false;
    }

    @Override
    public void onPause() {
        super.onPause();
        mPaused = true;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mDestroyed = true;
    }

    public void enqueuePreRenderMapMethod(Integer methodID, @Nullable ReadableArray args) {
        mPreRenderMethodMap.put(methodID, args);
    }

    public void addFeature(View childView, int childPosition) {
        AbstractMapFeature feature = null;

        if (childView instanceof RCTSource) {
            RCTSource source = (RCTSource) childView;
            mSources.put(source.getID(), source);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLLight) {
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) childView;
            mPointAnnotations.put(annotation.getID(), annotation);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLCamera) {
            RCTMGLCamera camera = (RCTMGLCamera) childView;
            mCamera = camera;
            feature = (AbstractMapFeature) childView;
        } else {
            ViewGroup children = (ViewGroup) childView;

            for (int i = 0; i < children.getChildCount(); i++) {
                addFeature(children.getChildAt(i), childPosition);
            }
        }

        if (feature != null) {
            if (mMap != null) {
                feature.addToMap(this);
                mFeatures.add(childPosition, feature);
            } else {
                mQueuedFeatures.add(childPosition, feature);
            }
        }
    }

    public void removeFeature(int childPosition) {
        AbstractMapFeature feature = mFeatures.get(childPosition);

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
        }

        feature.removeFromMap(this);
        mFeatures.remove(feature);
    }

    public int getFeatureCount() {
        return mFeatures.size();
    }

    public AbstractMapFeature getFeatureAt(int i) {
        return mFeatures.get(i);
    }

    public synchronized void dispose() {
        if (mDestroyed) {
            return;
        }

        if (!layerWaiters.isEmpty()) {
            Log.w(LOG_TAG, String.format("The following layers were waited on but never appeared %s", layerWaiters.keySet()));
            layerWaiters.clear();
        }

        ReactContext reactContext = (ReactContext) mContext;
        reactContext.removeLifecycleEventListener(mLifeCycleListener);

        if (!mPaused) {
            onPause();
        }

        onStop();
        onDestroy();
    }

    public VisibleRegion getVisibleRegion(LatLng center, double zoomLevel) {
        DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();
        int[] contentPadding = mMap.getPadding();

        // we want to get the width, and height scaled based on pixel density, that also includes content padding
        // (width * percentOfWidthWeWant - (leftPadding + rightPadding)) / dpi
        int mapWidth = (int)((mMap.getWidth() * 0.75 - (contentPadding[0] + contentPadding[2])) / metrics.scaledDensity);
        int mapHeight = (int)((mMap.getHeight() * 0.75 - (contentPadding[1] + contentPadding[3])) / metrics.scaledDensity);
        VisibleRegion region = GeoViewport.getRegion(center, (int) zoomLevel, mapWidth, mapHeight);
        return region;
    }

    public CameraPosition getCameraPosition() {
        return mMap.getCameraPosition();
    }

    public void animateCamera(CameraUpdate cameraUpdate, MapboxMap.CancelableCallback callback) {
        mMap.animateCamera(cameraUpdate, callback);
    }

    public void moveCamera(CameraUpdate cameraUpdate, MapboxMap.CancelableCallback callback) {
        mMap.moveCamera(cameraUpdate, callback);
    }

    public void moveCamera(CameraUpdate cameraUpdate) {
        mMap.moveCamera(cameraUpdate);
    }

    public void easeCamera(CameraUpdate cameraUpdate, int duration, MapboxMap.CancelableCallback callback) {
        mMap.easeCamera(cameraUpdate, duration, callback);
    }

    public void easeCamera(CameraUpdate cameraUpdate) {
        mMap.easeCamera(cameraUpdate);
    }

    public RCTMGLPointAnnotation getPointAnnotationByID(String annotationID) {
        if (annotationID == null) {
            return null;
        }

        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);

            if (annotation != null && annotationID.equals(annotation.getID())) {
                return annotation;
            }
        }

        return null;
    }

    public RCTMGLPointAnnotation getPointAnnotationByMarkerID(long markerID) {
        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);

            if (annotation != null && markerID == annotation.getMapboxID()) {
                return annotation;
            }
        }

        return null;
    }

    public MapboxMap getMapboxMap() {
        return mMap;
    }

    public interface FoundLayerCallback {
        public void found(Layer layer);
    }

    private Map<String, List<FoundLayerCallback>> layerWaiters = new HashMap<String,List<FoundLayerCallback>>();

    public void layerAdded(Layer layer) {
        String layerId = layer.getId();

        List<FoundLayerCallback> callbacks = layerWaiters.get(layerId);
        if (callbacks != null) {
            for (FoundLayerCallback callback : callbacks) {
                callback.found(layer);
            }
        }
        layerWaiters.remove(layerId);
    }

    public void waitForLayer(String layerID, FoundLayerCallback callback) {
        Layer layer = mMap.getStyle().getLayer(layerID);
        if (layer != null) {
            callback.found(layer);
        } else {
            List<FoundLayerCallback> waiters = layerWaiters.get(layerID);
            if (waiters == null) {
                waiters = new ArrayList<FoundLayerCallback>();
                layerWaiters.put(layerID, waiters);
            }
            waiters.add(callback);
        }
    }

    //region Map Callbacks

    @Override
    public void onMapReady(final MapboxMap mapboxMap) {
        mMap = mapboxMap;

        mMap.setStyle(new Style.Builder().fromUrl(mStyleURL));

        reflow(); // the internal widgets(compass, attribution, etc) need this to position themselves correctly

        mMap.setOnMarkerClickListener(this);

        markerViewManager = new MarkerViewManager(this, mMap); /* mMap.getMarkerViewManager(); */
        // FMTODO markerViewManager.addMarker(new RCTMGLPointAnnotationAdapter(this, mContext));
        // FMTODO markerViewManager.addMarkerViewAdapter(new RCTMGLPointAnnotationAdapter(this, mContext));
        // FMTODO markerViewManager.setOnMarkerViewClickListener(this);
        mMap.setInfoWindowAdapter(new RCTMGLCalloutAdapter(this));

        mMap.addOnMapClickListener(this);
        mMap.addOnMapLongClickListener(this);

        // in case props were set before the map was ready lets set them
        updateInsets();
        updateUISettings();

        if (mQueuedFeatures.size() > 0) {
            for (int i = 0; i < mQueuedFeatures.size(); i++) {
                AbstractMapFeature feature = mQueuedFeatures.get(i);
                feature.addToMap(this);
                mFeatures.add(feature);
            }
            mQueuedFeatures = null;
        }

        /* FMTODO
        if (mPointAnnotations.size() > 0) {
            markerViewManager.invalidateViewMarkersInVisibleRegion();
        } */

        mMap.addOnCameraIdleListener(new MapboxMap.OnCameraIdleListener() {
            @Override
            public void onCameraIdle() {
                /* FMTODO
                if (mPointAnnotations.size() > 0) {
                    markerViewManager.invalidateViewMarkersInVisibleRegion();
                } */

                Log.d("MOVE_EVENT", "onCameraIdle SENDING DID_CHANGE EVENT isUserInteraction: " + mCameraChangeTracker.isUserInteraction() + " isAnimated: " + mCameraChangeTracker.isAnimated());
                sendRegionDidChangeEvent();            }
        });

        mMap.addOnCameraMoveStartedListener(new MapboxMap.OnCameraMoveStartedListener() {
            @Override
            public void onCameraMoveStarted(int reason) {
                mCameraChangeTracker.setReason(reason);
                Log.d("MOVE_EVENT", "onCameraMoveStarted SENDING WILL_CHANGE EVENT reason: " + reason + " isUserInteraction: " + mCameraChangeTracker.isUserInteraction() + " isAnimated: " + mCameraChangeTracker.isAnimated());
                handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE);
            }
        });


        /*mLocalizationPlugin = new LocalizationPlugin(this, mMap);
        if (mLocalizeLabels) {
            try {
                mLocalizationPlugin.matchMapLanguageWithDeviceDefault();
            } catch (Exception e) {
                final String localeString = Locale.getDefault().toString();
                Log.w(LOG_TAG, String.format("Could not find matching locale for %s", localeString));
            }
        }*/
    }

    public void reflow() {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                measure(
                        View.MeasureSpec.makeMeasureSpec(getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(getMeasuredHeight(), View.MeasureSpec.EXACTLY));
                layout(getLeft(), getTop(), getRight(), getBottom());
            }
        });
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        boolean result = super.onTouchEvent(ev);

        if (result) {
            requestDisallowInterceptTouchEvent(true);
        }

        return result;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        if (!mPaused) {
            super.onLayout(changed, left, top, right, bottom);
        }
    }

    @Override
    public boolean onMapClick(@NonNull LatLng point) {
        boolean isEventCaptured = false;

        if (mActiveMarkerID != -1) {
            for (String key : mPointAnnotations.keySet()) {
                RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);

                if (mActiveMarkerID == annotation.getMapboxID()) {
                    isEventCaptured = deselectAnnotation(annotation);
                }
            }
        }

        if (isEventCaptured) {
            return true;
        }

        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
        List<RCTSource> touchableSources = getAllTouchableSources();

        Map<String, Feature> hits = new HashMap<>();
        List<RCTSource> hitTouchableSources = new ArrayList<>();
        for (RCTSource touchableSource : touchableSources) {
            Map<String, Double> hitbox = touchableSource.getTouchHitbox();
            if (hitbox == null) {
                continue;
            }

            float halfWidth = hitbox.get("width").floatValue() / 2.0f;
            float halfHeight = hitbox.get("height").floatValue() / 2.0f;

            RectF hitboxF = new RectF();
            hitboxF.set(
                    screenPoint.x - halfWidth,
                    screenPoint.y - halfHeight,
                    screenPoint.x + halfWidth,
                    screenPoint.y + halfHeight);

            List<Feature> features = mMap.queryRenderedFeatures(hitboxF, touchableSource.getLayerIDs());
            if (features.size() > 0) {
                hits.put(touchableSource.getID(), features.get(0));
                hitTouchableSources.add(touchableSource);
            }
        }

        if (hits.size() > 0) {
            RCTSource source = getTouchableSourceWithHighestZIndex(hitTouchableSources);
            if (source != null && source.hasPressListener()) {
                source.onPress(hits.get(source.getID()));
                return true;
            }
        }

        MapClickEvent event = new MapClickEvent(this, point, screenPoint);
        mManager.handleEvent(event);
        return false;
    }

    @Override
    public boolean onMapLongClick(@NonNull LatLng point) {
        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
        MapClickEvent event = new MapClickEvent(this, point, screenPoint, EventTypes.MAP_LONG_CLICK);
        mManager.handleEvent(event);
        return false;
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker) {
        final long selectedMarkerID = marker.getId();

        RCTMGLPointAnnotation activeAnnotation = null;
        RCTMGLPointAnnotation nextActiveAnnotation = null;

        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);
            final long curMarkerID = annotation.getMapboxID();

            if (selectedMarkerID == curMarkerID) {
                nextActiveAnnotation = annotation;
            } else if (mActiveMarkerID == curMarkerID) {
                activeAnnotation = annotation;
            }
        }

        if (activeAnnotation != null) {
            deselectAnnotation(activeAnnotation);
        }

        if (nextActiveAnnotation != null) {
            selectAnnotation(nextActiveAnnotation);
        }

        return true;
    }

    public void selectAnnotation(RCTMGLPointAnnotation annotation) {
        final long id = annotation.getMapboxID();

        if (id != mActiveMarkerID) {
            final Marker marker = annotation.getMarker();
            mMap.selectMarker(marker);
            annotation.onSelect(true);
            mActiveMarkerID = id;

            RCTMGLCallout calloutView = annotation.getCalloutView();
            if (!marker.isInfoWindowShown() && calloutView != null) {
                marker.showInfoWindow(mMap, this);
            }
        }
    }

    public boolean deselectAnnotation(RCTMGLPointAnnotation annotation) {
        Marker marker = annotation.getMarker();

        RCTMGLCallout calloutView = annotation.getCalloutView();
        if (calloutView != null) {
            marker.hideInfoWindow();
        }

        mMap.deselectMarker(marker);
        mActiveMarkerID = -1;
        annotation.onDeselect();

        return calloutView != null;
    }

    @Override
    public void onCameraDidChange(boolean animated) {
        mCameraChangeTracker.setIsAnimating(animated);
    }

    @Override
    public void onDidFailLoadingMap(String errorMessage) {
        handleMapChangedEvent(EventTypes.DID_FAIL_LOADING_MAP);
    }

    @Override
    public void onDidFinishLoadingMap() {
        handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_MAP);
    }

    @Override
    public void onWillStartRenderingFrame() {
        handleMapChangedEvent(EventTypes.WILL_START_RENDERING_FRAME);
    }

    @Override
    public void onDidFinishRenderingFrame(boolean fully) {
        if (fully) {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
        } else {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_FRAME);
        }
    }

    @Override
    public void onWillStartRenderingMap() {
        handleMapChangedEvent(EventTypes.WILL_START_RENDERING_MAP);
    }

    @Override
    public void onDidFinishRenderingMap(boolean fully) {
        if (fully) {
            if (mPreRenderMethodMap.size() > 0) {
                for (Integer methodID : mPreRenderMethodMap.keySet()) {
                    mManager.receiveCommand(this, methodID, mPreRenderMethodMap.get(methodID));
                }
                mPreRenderMethodMap.clear();
            }
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_MAP_FULLY);
        } else {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_MAP);
        }
    }

    @Override
    public void onDidFinishLoadingStyle() {
        handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_STYLE);
    }

    @Override
    public void onStyleImageMissing(@NonNull String id) {
        List<RCTMGLShapeSource> allShapeSources = getAllShapeSources();
        for (RCTMGLShapeSource shapeSource : allShapeSources) {
            if (shapeSource.addMissingImageToStyle(id)) {
                return;
            }
        }

    }

    /*
    public void onMapChanged(int changed) {
        String eventType = null;

        switch (changed) {
            case REGION_WILL_CHANGE:
            case REGION_IS_CHANGING:
            case REGION_DID_CHANGE:
                break;
            case REGION_WILL_CHANGE_ANIMATED:
                mCameraChangeTracker.setIsAnimating(true); //*
                break;
            case REGION_DID_CHANGE_ANIMATED:
                mCameraChangeTracker.setIsAnimating(false); //*
                break;
            case WILL_START_LOADING_MAP:
                eventType = EventTypes.WILL_START_LOADING_MAP;
                break;
            case DID_FAIL_LOADING_MAP:
                eventType = EventTypes.DID_FAIL_LOADING_MAP; //*
                break;
            case DID_FINISH_LOADING_MAP:
                eventType = EventTypes.DID_FINISH_LOADING_MAP; //*
                break;
            case WILL_START_RENDERING_FRAME:
                eventType = EventTypes.WILL_START_RENDERING_FRAME; //*
                break;
            case DID_FINISH_RENDERING_FRAME:
                eventType = EventTypes.DID_FINISH_RENDERING_FRAME; //*
                break;
            case DID_FINISH_RENDERING_FRAME_FULLY_RENDERED:
                eventType = EventTypes.DID_FINISH_RENDERING_FRAME_FULLY; //*
                break;
            case WILL_START_RENDERING_MAP:
                eventType = EventTypes.WILL_START_RENDERING_MAP; // *
                break;
            case DID_FINISH_RENDERING_MAP:
                eventType = EventTypes.DID_FINISH_RENDERING_MAP; // *
                break;
            case DID_FINISH_RENDERING_MAP_FULLY_RENDERED: // * FMTODO no equivalent
                if (mPreRenderMethodMap.size() > 0) {
                    for (Integer methodID : mPreRenderMethodMap.keySet()) {
                        mManager.receiveCommand(this, methodID, mPreRenderMethodMap.get(methodID));
                    }
                    mPreRenderMethodMap.clear();
                }
                eventType = EventTypes.DID_FINISH_RENDERING_MAP_FULLY;
                break;
            case DID_FINISH_LOADING_STYLE:
                eventType = EventTypes.DID_FINISH_LOADING_STYLE; //*
                break;
        }

        if (eventType != null) {
            handleMapChangedEvent(eventType);
        }
    } */

    //endregion

    //region Property getter/setters

    public void setReactStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            removeAllSourcesFromMap();

            mMap.setStyle(styleURL, new Style.OnStyleLoaded() {
                @Override
                public void onStyleLoaded(@NonNull Style style) {
                    addAllSourcesToMap();
                }
            });
        }
    }

    public void setReactContentInset(ReadableArray array) {
        mInsets = array;
        updateInsets();
    }

    public void setLocalizeLabels(boolean localizeLabels) {
        mLocalizeLabels = localizeLabels;
    }

    public void setReactZoomEnabled(boolean zoomEnabled) {
        mZoomEnabled = zoomEnabled;
        updateUISettings();
    }

    public void setReactScrollEnabled(boolean scrollEnabled) {
        mScrollEnabled = scrollEnabled;
        updateUISettings();
    }

    public void setReactPitchEnabled(boolean pitchEnabled) {
        mPitchEnabled = pitchEnabled;
        updateUISettings();
    }

    public void setReactRotateEnabled(boolean rotateEnabled) {
        mRotateEnabled = rotateEnabled;
        updateUISettings();
    }

    public void setReactLogoEnabled(boolean logoEnabled) {
        mLogoEnabled = logoEnabled;
        updateUISettings();
    }

    public void setReactCompassEnabled(boolean compassEnabled) {
        mCompassEnabled = compassEnabled;
        updateUISettings();
    }

    public void setReactAttributionEnabled(boolean attributionEnabled) {
        mAttributionEnabled = attributionEnabled;
        updateUISettings();
    }

    //endregion

    //region Methods
    public void queryRenderedFeaturesAtPoint(String callbackID, PointF point, Expression filter, List<String> layerIDs) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        List<Feature> features = mMap.queryRenderedFeatures(point, filter, layerIDs.toArray(new String[layerIDs.size()]));

        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void getZoom(String callbackID) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        CameraPosition position = mMap.getCameraPosition();

        WritableMap payload = new WritableNativeMap();
        payload.putDouble("zoom", position.zoom);
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void queryRenderedFeaturesInRect(String callbackID, RectF rect, Expression filter, List<String> layerIDs) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        List<Feature> features = mMap.queryRenderedFeatures(rect, filter, layerIDs.toArray(new String[layerIDs.size()]));

        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void getVisibleBounds(String callbackID) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        VisibleRegion region = mMap.getProjection().getVisibleRegion();

        WritableMap payload = new WritableNativeMap();
        payload.putArray("visibleBounds", GeoJSONUtils.fromLatLngBounds(region.latLngBounds));
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void getPointInView(String callbackID, LatLng mapCoordinate) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);

        PointF pointInView = mMap.getProjection().toScreenLocation(mapCoordinate);
        WritableMap payload = new WritableNativeMap();

        WritableArray array = new WritableNativeArray();
        array.pushDouble(pointInView.x);
        array.pushDouble(pointInView.y);
        payload.putArray("pointInView", array);
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void getCoordinateFromView(String callbackID, PointF pointInView) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);

        LatLng mapCoordinate = mMap.getProjection().fromScreenLocation(pointInView);
        WritableMap payload = new WritableNativeMap();

        WritableArray array = new WritableNativeArray();
        array.pushDouble(mapCoordinate.getLongitude());
        array.pushDouble(mapCoordinate.getLatitude());
        payload.putArray("coordinateFromView", array);
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void takeSnap(final String callbackID, final boolean writeToDisk) {
        final AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);

        if (mMap == null) {
            throw new Error("takeSnap should only be called after the map has rendered");
        }

        mMap.snapshot(new MapboxMap.SnapshotReadyCallback() {
            @Override
            public void onSnapshotReady(Bitmap snapshot) {
                WritableMap payload = new WritableNativeMap();
                String uri = writeToDisk ? BitmapUtils.createTempFile(mContext, snapshot) : BitmapUtils.createBase64(snapshot);
                payload.putString("uri", uri);
                event.setPayload(payload);
                mManager.handleEvent(event);
            }
        });
    }

    public void getCenter(String callbackID) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        LatLng center = mMap.getCameraPosition().target;

        WritableArray array = new WritableNativeArray();
        array.pushDouble(center.getLongitude());
        array.pushDouble(center.getLatitude());
        WritableMap payload = new WritableNativeMap();
        payload.putArray("center", array);
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void showAttribution() {
        View attributionView = findViewById(com.mapbox.mapboxsdk.R.id.attributionView);
        attributionView.callOnClick();
    }

    public void init() {
        // very important, this will make sure that mapbox-gl-native initializes the gl surface
        // https://github.com/mapbox/react-native-mapbox-gl/issues/955
        getViewTreeObserver().dispatchOnGlobalLayout();
    }

    public boolean isDestroyed(){
        return mDestroyed;
    }

    private void updateUISettings() {
        if (mMap == null) {
            return;
        }
        // Gesture settings
        UiSettings uiSettings = mMap.getUiSettings();

        if (mScrollEnabled != null && uiSettings.isRotateGesturesEnabled() != mScrollEnabled) {
            uiSettings.setScrollGesturesEnabled(mScrollEnabled);
        }

        if (mPitchEnabled != null && uiSettings.isTiltGesturesEnabled() != mPitchEnabled) {
            uiSettings.setTiltGesturesEnabled(mPitchEnabled);
        }

        if (mRotateEnabled != null && uiSettings.isRotateGesturesEnabled() != mRotateEnabled) {
            uiSettings.setRotateGesturesEnabled(mRotateEnabled);
        }

        if (mAttributionEnabled != null && uiSettings.isAttributionEnabled() != mAttributionEnabled) {
            uiSettings.setAttributionEnabled(mAttributionEnabled);
        }

        if (mLogoEnabled != null && uiSettings.isLogoEnabled() != mLogoEnabled) {
            uiSettings.setLogoEnabled(mLogoEnabled);
        }

        if (mCompassEnabled != null && uiSettings.isCompassEnabled() != mCompassEnabled) {
            uiSettings.setCompassEnabled(mCompassEnabled);
        }

        if (mZoomEnabled != null && uiSettings.isZoomGesturesEnabled() != mZoomEnabled) {
            uiSettings.setZoomGesturesEnabled(mZoomEnabled);
        }
    }

    private void updateInsets() {
        if (mMap == null || mInsets == null) {
            return;
        }

        final DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();
        int top = 0, right = 0, bottom = 0, left = 0;

        if (mInsets.size() == 4) {
            top = mInsets.getInt(0);
            right = mInsets.getInt(1);
            bottom = mInsets.getInt(2);
            left = mInsets.getInt(3);
        } else if (mInsets.size() == 2) {
            top = mInsets.getInt(0);
            right = mInsets.getInt(1);
            bottom = top;
            left = right;
        } else if (mInsets.size() == 1) {
            top = mInsets.getInt(0);
            right = top;
            bottom = top;
            left = top;
        }

        mMap.setPadding(
                Float.valueOf(left * metrics.scaledDensity).intValue(),
                Float.valueOf(top * metrics.scaledDensity).intValue(),
                Float.valueOf(right * metrics.scaledDensity).intValue(),
                Float.valueOf(bottom * metrics.scaledDensity).intValue());
    }

    private void setLifecycleListeners() {
        final ReactContext reactContext = (ReactContext) mContext;

        mLifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                onResume();
            }

            @Override
            public void onHostPause() {
                onPause();
            }

            @Override
            public void onHostDestroy() {
                dispose();
            }
        };

        reactContext.addLifecycleEventListener(mLifeCycleListener);
    }

    private WritableMap makeRegionPayload(Boolean isAnimated) {
        CameraPosition position = mMap.getCameraPosition();
        LatLng latLng = new LatLng(position.target.getLatitude(), position.target.getLongitude());

        WritableMap properties = new WritableNativeMap();
        properties.putDouble("zoomLevel", position.zoom);
        properties.putDouble("heading", position.bearing);
        properties.putDouble("pitch", position.tilt);
        properties.putBoolean("animated", (null == isAnimated) ? mCameraChangeTracker.isAnimated() : isAnimated.booleanValue());
        properties.putBoolean("isUserInteraction", mCameraChangeTracker.isUserInteraction());

        VisibleRegion visibleRegion = mMap.getProjection().getVisibleRegion();
        properties.putArray("visibleBounds", GeoJSONUtils.fromLatLngBounds(visibleRegion.latLngBounds));

        return GeoJSONUtils.toPointFeature(latLng, properties);
    }

    public void sendRegionChangeEvent(boolean isAnimated) {
        IEvent event = new MapChangeEvent(this, makeRegionPayload(new Boolean(isAnimated)), EventTypes.REGION_DID_CHANGE);
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

    private List<RCTMGLShapeSource> getAllShapeSources() {
        List<RCTMGLShapeSource> shapeSources = new ArrayList<>();

        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);

            if (source instanceof RCTMGLShapeSource) {
                shapeSources.add((RCTMGLShapeSource)source);
            }
        }

        return shapeSources;
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
            String[] layerIDs = source.getLayerIDs();

            for (String layerID : layerIDs) {
                layerToSourceMap.put(layerID, source);
            }
        }

        // getLayers returns from back(N - 1) to front(0)
        List<Layer> mapboxLayers = mMap.getStyle().getLayers();
        for (int i = mapboxLayers.size() - 1; i >= 0; i--) {
            Layer mapboxLayer = mapboxLayers.get(i);

            String layerID = mapboxLayer.getId();
            if (layerToSourceMap.containsKey(layerID)) {
                return layerToSourceMap.get(layerID);
            }
        }

        return null;
    }

    private boolean hasSetCenterCoordinate() {
        CameraPosition cameraPosition = mMap.getCameraPosition();
        LatLng center = cameraPosition.target;
        return center.getLatitude() != 0.0 && center.getLongitude() != 0.0;
    }

    private double getMapRotation() {
        CameraPosition cameraPosition = mMap.getCameraPosition();
        return cameraPosition.bearing;
    }

    public void sendRegionDidChangeEvent() {
        handleMapChangedEvent(EventTypes.REGION_DID_CHANGE);
        mCameraChangeTracker.setReason(-1);
    }

    private void handleMapChangedEvent(String eventType) {
        if (!canHandleEvent(eventType)) return;

        IEvent event;

        switch (eventType) {
            // payload events
            case EventTypes.REGION_WILL_CHANGE:
            case EventTypes.REGION_DID_CHANGE:
            case EventTypes.REGION_IS_CHANGING:
                event = new MapChangeEvent(this, makeRegionPayload(null), eventType);
                break;
            default:
                event = new MapChangeEvent(this, eventType);
        }

        mManager.handleEvent(event);
    }

    private boolean canHandleEvent(String event) {
        return mHandledMapChangedEvents == null || mHandledMapChangedEvents.contains(event);
    }

    public void setHandledMapChangedEvents(ArrayList<String> eventsWhiteList) {
        this.mHandledMapChangedEvents = new HashSet<>(eventsWhiteList);
    }

    private void sendUserLocationUpdateEvent(Location location) {
        if(location == null){
            return;
        }
        IEvent event = new MapChangeEvent(this, makeLocationChangePayload(location), EventTypes.USER_LOCATION_UPDATED);
        mManager.handleEvent(event);
    }

    /**
     * Create a payload of the location data per the web api geolocation spec
     * https://dev.w3.org/geo/api/spec-source.html#position
     * @return
     */
    private WritableMap makeLocationChangePayload(Location location) {

        WritableMap positionProperties = new WritableNativeMap();
        WritableMap coords = new WritableNativeMap();

        coords.putDouble("longitude", location.getLongitude());
        coords.putDouble("latitude", location.getLatitude());
        coords.putDouble("altitude", location.getAltitude());
        coords.putDouble("accuracy", location.getAccuracy());
        coords.putDouble("heading", location.getBearing());
        coords.putDouble("speed", location.getSpeed());

        positionProperties.putMap("coords", coords);
        positionProperties.putDouble("timestamp", location.getTime());
        return positionProperties;
    }

}
