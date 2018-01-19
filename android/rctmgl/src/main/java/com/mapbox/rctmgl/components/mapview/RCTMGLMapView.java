package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.PointF;
import android.graphics.RectF;
import android.location.Location;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.text.LoginFilter;
import android.util.DisplayMetrics;
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
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.annotations.MarkerView;
import com.mapbox.mapboxsdk.annotations.MarkerViewManager;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerMode;
import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
import com.mapbox.rctmgl.components.annotation.RCTMGLCalloutAdapter;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotationAdapter;
import com.mapbox.rctmgl.components.camera.CameraStop;
import com.mapbox.rctmgl.components.camera.CameraUpdateQueue;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
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
import com.mapbox.rctmgl.location.UserLocationVerticalAlignment;
import com.mapbox.rctmgl.location.UserTrackingMode;
import com.mapbox.rctmgl.location.UserTrackingState;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.FilterParser;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.GeoViewport;
import com.mapbox.rctmgl.utils.SimpleEventCallback;
import com.mapbox.services.android.telemetry.permissions.PermissionsManager;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 8/18/17.
 */

@SuppressWarnings({"MissingPermission"})
public class RCTMGLMapView extends MapView implements
        OnMapReadyCallback, MapboxMap.OnMapClickListener, MapboxMap.OnMapLongClickListener,
        MapView.OnMapChangedListener, MapboxMap.OnMarkerViewClickListener {
    public static final String LOG_TAG = RCTMGLMapView.class.getSimpleName();

    public static final int USER_LOCATION_CAMERA_MOVE_DURATION = 1000;

    private RCTMGLMapViewManager mManager;
    private Context mContext;
    private Handler mHandler;

    private List<AbstractMapFeature> mFeatures;
    private List<AbstractMapFeature> mQueuedFeatures;
    private Map<String, RCTMGLPointAnnotation> mPointAnnotations;
    private Map<String, RCTSource> mSources;

    private CameraUpdateQueue mCameraUpdateQueue;
    private CameraChangeTracker mCameraChangeTracker = new CameraChangeTracker();

    private MapboxMap mMap;
    private LocationManager mLocationManger;
    private LocationLayerPlugin mLocationLayer;
    private UserLocation mUserLocation;

    private String mStyleURL;

    private boolean mAnimated;
    private Boolean mScrollEnabled;
    private Boolean mPitchEnabled;
    private Boolean mRotateEnabled;
    private Boolean mAttributionEnabled;
    private Boolean mLogoEnabled;
    private Boolean mCompassEnabled;
    private Boolean mZoomEnabled;
    private boolean mShowUserLocation;

    private long mActiveMarkerID = -1;
    private int mUserTrackingMode;
    private int mUserTrackingState = UserTrackingState.POSSIBLE;
    private int mUserLocationVerticalAlignment = UserLocationVerticalAlignment.CENTER;

    private double mHeading;
    private double mPitch;
    private double mZoomLevel;

    private Double mMinZoomLevel;
    private Double mMaxZoomLevel;

    private ReadableArray mInsets;
    private Point mCenterCoordinate;

    private LocationManager.OnUserLocationChange mLocationChangeListener = new LocationManager.OnUserLocationChange() {
        @Override
        public void onLocationChange(Location nextLocation) {
            if (mMap == null || mLocationLayer == null || !mShowUserLocation) {
                return;
            }

            float distToNextLocation = mUserLocation.getDistance(nextLocation);
            mLocationLayer.onLocationChanged(nextLocation);
            mUserLocation.setCurrentLocation(nextLocation);

            if (mUserTrackingState == UserTrackingState.POSSIBLE || distToNextLocation > 0.0f) {
                updateUserLocation(true);
            }
        }
    };

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager, MapboxMapOptions options) {
        super(context, options);

        super.onCreate(null);
        super.getMapAsync(this);

        mContext = context;
        mManager = manager;
        mCameraUpdateQueue = new CameraUpdateQueue();

        mUserLocation = new UserLocation();
        mLocationManger = new LocationManager(context);
        mLocationManger.setOnLocationChangeListener(mLocationChangeListener);

        mSources = new HashMap<>();
        mPointAnnotations = new HashMap<>();
        mQueuedFeatures = new ArrayList<>();
        mFeatures = new ArrayList<>();

        mHandler = new Handler();

        setLifecycleListeners();
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

    public void dispose() {
        mLocationManger.dispose();
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

    //region Map Callbacks

    @Override
    public void onMapReady(final MapboxMap mapboxMap) {
        mMap = mapboxMap;

        reflow(); // the internal widgets(compass, attribution, etc) need this to position themselves correctly

        final MarkerViewManager markerViewManager = mMap.getMarkerViewManager();
        markerViewManager.addMarkerViewAdapter(new RCTMGLPointAnnotationAdapter(this, mContext));
        markerViewManager.setOnMarkerViewClickListener(this);
        mMap.setInfoWindowAdapter(new RCTMGLCalloutAdapter(this));

        mMap.setOnMapClickListener(this);
        mMap.setOnMapLongClickListener(this);

        addOnMapChangedListener(this);

        // in case props were set before the map was ready lets set them
        updateInsets();
        updateUISettings();
        setMinMaxZoomLevels();

        if (mShowUserLocation) {
            enableLocation();
        }

        if (mCenterCoordinate != null && mUserTrackingMode == UserTrackingMode.NONE) {
            mMap.moveCamera(CameraUpdateFactory.newCameraPosition(buildCamera()), new MapboxMap.CancelableCallback() {
                @Override
                public void onCancel() {
                    sendRegionChangeEvent(false);
                }

                @Override
                public void onFinish() {
                    sendRegionChangeEvent(false);
                }
            });
        }

        if (!mCameraUpdateQueue.isEmpty()) {
            mCameraUpdateQueue.execute(mMap);
        }

        if (mQueuedFeatures.size() > 0) {
            for (int i = 0; i < mQueuedFeatures.size(); i++) {
                AbstractMapFeature feature = mQueuedFeatures.get(i);
                feature.addToMap(this);
                mFeatures.add(feature);
            }
            mQueuedFeatures = null;
        }

        if (mPointAnnotations.size() > 0) {
            markerViewManager.invalidateViewMarkersInVisibleRegion();
        }

        final RCTMGLMapView self = this;
        mMap.addOnCameraIdleListener(new MapboxMap.OnCameraIdleListener() {
            long lastTimestamp = System.currentTimeMillis();

            @Override
            public void onCameraIdle() {
                if (mPointAnnotations.size() > 0) {
                    markerViewManager.invalidateViewMarkersInVisibleRegion();
                }

                long curTimestamp = System.currentTimeMillis();
                if (curTimestamp - lastTimestamp < 500) {
                    return;
                }

                sendRegionChangeEvent(mCameraChangeTracker.isAnimated());
                lastTimestamp = curTimestamp;
            }
        });

        mMap.addOnCameraMoveStartedListener(new MapboxMap.OnCameraMoveStartedListener() {
            @Override
            public void onCameraMoveStarted(int reason) {
                if (mCameraChangeTracker.isEmpty()) {
                    mCameraChangeTracker.setReason(reason);
                }
            }
        });

        mMap.setOnScrollListener(new MapboxMap.OnScrollListener() {
            @Override
            public void onScroll() {
                if (mUserLocation.getTrackingMode() != UserTrackingMode.NONE) {
                    updateUserTrackingMode(UserTrackingMode.NONE);
                }
            }
        });

        mMap.setOnFlingListener(new MapboxMap.OnFlingListener() {
            @Override
            public void onFling() {
                if (mUserLocation.getTrackingMode() != UserTrackingMode.NONE) {
                    updateUserTrackingMode(UserTrackingMode.NONE);
                }
            }
        });

        mMap.addOnCameraMoveListener(new MapboxMap.OnCameraMoveListener() {
            double lastMapRotation = getMapRotation();

            @Override
            public void onCameraMove() {
                int userTrackingMode = mUserLocation.getTrackingMode();
                boolean isFollowWithCourseOrHeading = userTrackingMode == UserTrackingMode.FollowWithCourse || userTrackingMode == UserTrackingMode.FollowWithHeading;

                if (!isFollowWithCourseOrHeading) {
                    lastMapRotation = getRotation();
                    return;
                }

                double currentMapRotation = getMapRotation();
                if (lastMapRotation != currentMapRotation && mCameraChangeTracker.isUserInteraction()) {
                    updateUserTrackingMode(UserTrackingMode.FOLLOW);
                }

                lastMapRotation = currentMapRotation;
            }
        });
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
    public void onMapClick(@NonNull LatLng point) {
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
            return;
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
                return;
            }
        }

        MapClickEvent event = new MapClickEvent(this, point, screenPoint);
        mManager.handleEvent(event);
    }

    @Override
    public void onMapLongClick(@NonNull LatLng point) {
        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
        MapClickEvent event = new MapClickEvent(this, point, screenPoint, EventTypes.MAP_LONG_CLICK);
        mManager.handleEvent(event);
    }

    @Override
    public boolean onMarkerClick(@NonNull Marker marker, @NonNull View view, @NonNull MapboxMap.MarkerViewAdapter adapter) {
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
            final MarkerView markerView = annotation.getMarker();
            mMap.selectMarker(markerView);
            annotation.onSelect(true);
            mActiveMarkerID = id;

            RCTMGLCallout calloutView = annotation.getCalloutView();
            if (!markerView.isInfoWindowShown() && calloutView != null) {
                markerView.showInfoWindow(mMap, this);
            }
        }
    }

    public boolean deselectAnnotation(RCTMGLPointAnnotation annotation) {
        MarkerView markerView = annotation.getMarker();

        RCTMGLCallout calloutView = annotation.getCalloutView();
        if (calloutView != null) {
            markerView.hideInfoWindow();
        }

        mMap.deselectMarker(markerView);
        mActiveMarkerID = -1;
        annotation.onDeselect();

        return calloutView != null;
    }

    @Override
    public void onMapChanged(int changed) {
        IEvent event = null;

        switch (changed) {
            case REGION_WILL_CHANGE:
                event = new MapChangeEvent(this, makeRegionPayload(false), EventTypes.REGION_WILL_CHANGE);
                break;
            case REGION_WILL_CHANGE_ANIMATED:
                event = new MapChangeEvent(this, makeRegionPayload(true), EventTypes.REGION_WILL_CHANGE);
                break;
            case REGION_IS_CHANGING:
                event = new MapChangeEvent(this, EventTypes.REGION_IS_CHANGING);
                break;
            case REGION_DID_CHANGE:
                mCameraChangeTracker.setRegionChangeAnimated(false);
                break;
            case REGION_DID_CHANGE_ANIMATED:
                mCameraChangeTracker.setRegionChangeAnimated(true);
                break;
            case WILL_START_LOADING_MAP:
                event = new MapChangeEvent(this, EventTypes.WILL_START_LOADING_MAP);
                break;
            case DID_FAIL_LOADING_MAP:
                event = new MapChangeEvent(this, EventTypes.DID_FAIL_LOADING_MAP);
                break;
            case DID_FINISH_LOADING_MAP:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_LOADING_MAP);
                break;
            case WILL_START_RENDERING_FRAME:
                event = new MapChangeEvent(this, EventTypes.WILL_START_RENDERING_FRAME);
                break;
            case DID_FINISH_RENDERING_FRAME:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_RENDERING_FRAME);
                break;
            case DID_FINISH_RENDERING_FRAME_FULLY_RENDERED:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
                break;
            case WILL_START_RENDERING_MAP:
                event = new MapChangeEvent(this, EventTypes.WILL_START_RENDERING_MAP);
                break;
            case DID_FINISH_RENDERING_MAP:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_RENDERING_MAP);
                break;
            case DID_FINISH_RENDERING_MAP_FULLY_RENDERED:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_RENDERING_MAP_FULLY);
                break;
            case DID_FINISH_LOADING_STYLE:
                event = new MapChangeEvent(this, EventTypes.DID_FINISH_LOADING_STYLE);
                break;
        }

        if (event != null) {
            mManager.handleEvent(event);
        }
    }

    //endregion

    //region Property getter/setters

    public void setReactStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            removeAllSourcesFromMap();

            mMap.setStyle(styleURL, new MapboxMap.OnStyleLoadedListener() {
                @Override
                public void onStyleLoaded(String style) {
                    addAllSourcesToMap();
                }
            });
        }
    }

    public void setReactAnimated(boolean animated) {
        mAnimated = animated;
        updateCameraPositionIfNeeded(false);
    }

    public void setReactContentInset(ReadableArray array) {
        mInsets = array;
        updateInsets();
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

    public void setReactHeading(double heading) {
        mHeading = heading;
        updateCameraPositionIfNeeded(false);
    }

    public void setReactPitch(double pitch) {
        mPitch = pitch;
        updateCameraPositionIfNeeded(false);
    }

    public void setReactZoomLevel(double zoomLevel) {
        mZoomLevel = zoomLevel;
        updateCameraPositionIfNeeded(false);
    }

    public void setReactMinZoomLevel(double minZoomLevel) {
        mMinZoomLevel = minZoomLevel;
        setMinMaxZoomLevels();
    }

    public void setReactMaxZoomLevel(double maxZoomLevel) {
        mMaxZoomLevel = maxZoomLevel;
        setMinMaxZoomLevels();
    }

    public void setReactCenterCoordinate(Point centerCoordinate) {
        mCenterCoordinate = centerCoordinate;
        updateCameraPositionIfNeeded(true);
    }

    public void setReactShowUserLocation(boolean showUserLocation) {
        mShowUserLocation = showUserLocation;

        if (mMap != null) {
            if (mLocationManger.isActive() && !mShowUserLocation) {
                mLocationManger.disable();

                if (mLocationLayer != null) {
                   int trackingMode = mUserLocation.getTrackingMode();

                   if (trackingMode != UserTrackingMode.NONE) {
                       mUserLocation.setTrackingMode(UserTrackingMode.NONE);
                       updateUserTrackingMode(UserTrackingMode.NONE);
                   }

                   updateLocationLayer();
                }
            } else {
                enableLocation();
            }
        }
    }

    public void setReactUserTrackingMode(int userTrackingMode) {
        int oldTrackingMode = mUserTrackingMode;
        mUserTrackingMode = userTrackingMode;
        updateUserTrackingMode(userTrackingMode);

        switch (mUserTrackingMode) {
            case UserTrackingMode.NONE:
                mUserTrackingState = UserTrackingState.POSSIBLE;
                break;
            case UserTrackingMode.FOLLOW:
            case UserTrackingMode.FollowWithCourse:
            case UserTrackingMode.FollowWithHeading:
                if (oldTrackingMode == UserTrackingMode.NONE) {
                    mUserTrackingState = UserTrackingState.POSSIBLE;
                }
                mShowUserLocation = true;
                break;

        }

        if (mMap != null) {
            updateUserLocation(false);
            updateLocationLayer();
        }
    }

    public void setReactUserLocationVerticalAlignment(int userLocationVerticalAlignment) {
        mUserLocationVerticalAlignment = userLocationVerticalAlignment;

        if (mMap != null && mUserLocation.getTrackingMode() != UserTrackingMode.NONE) {
            updateUserLocation(false);
        }
    }

    //endregion

    //region Methods

    public void setCamera(String callbackID, ReadableMap args) {
        IEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        final SimpleEventCallback callback = new SimpleEventCallback(mManager, event);

        // remove any current camera updates
        mCameraUpdateQueue.flush();

        if (args.hasKey("stops")) {
            ReadableArray stops = args.getArray("stops");

            for (int i = 0; i < stops.size(); i++) {
                CameraStop stop = CameraStop.fromReadableMap(mContext, stops.getMap(i), null);
                mCameraUpdateQueue.offer(stop);
            }

            mCameraUpdateQueue.setOnCompleteAllListener(new CameraUpdateQueue.OnCompleteAllListener() {
                @Override
                public void onCompleteAll() {
                    callback.onFinish();
                    mCameraChangeTracker.setReason(3);
                }
            });
        } else {
            CameraStop stop = CameraStop.fromReadableMap(mContext, args, new MapboxMap.CancelableCallback() {
                @Override
                public void onCancel() {
                    callback.onCancel();
                    mCameraChangeTracker.setReason(1);
                }

                @Override
                public void onFinish() {
                    callback.onFinish();
                    mCameraChangeTracker.setReason(3);
                }
            });
            mCameraUpdateQueue.offer(stop);
        }

        // if map is already ready start executing on the queue
        if (mMap != null) {
            mCameraUpdateQueue.execute(mMap);
        }
    }

    public void queryRenderedFeaturesAtPoint(String callbackID, PointF point, FilterParser.FilterList filter, List<String> layerIDs) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        List<Feature> features = mMap.queryRenderedFeatures(point, FilterParser.parse(filter), layerIDs.toArray(new String[layerIDs.size()]));

        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());
        event.setPayload(payload);

        mManager.handleEvent(event);
    }

    public void queryRenderedFeaturesInRect(String callbackID, RectF rect, FilterParser.FilterList filter, List<String> layerIDs) {
        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, EventKeys.MAP_ANDROID_CALLBACK);
        List<Feature> features = mMap.queryRenderedFeatures(rect, FilterParser.parse(filter), layerIDs.toArray(new String[layerIDs.size()]));

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

    public void init() {
        setStyleUrl(mStyleURL);

        // very important, this will make sure that mapbox-gl-native initializes the gl surface
        // https://github.com/mapbox/react-native-mapbox-gl/issues/955
        getViewTreeObserver().dispatchOnGlobalLayout();
    }

    private void updateCameraPositionIfNeeded(boolean shouldUpdateTarget) {
        if (mMap != null) {
            CameraPosition prevPosition = mMap.getCameraPosition();
            CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(buildCamera(prevPosition, shouldUpdateTarget));

            if (mAnimated) {
                mMap.easeCamera(cameraUpdate);
            } else {
                mMap.moveCamera(cameraUpdate);
            }
        }
    }

    private CameraPosition buildCamera() {
        return buildCamera(null, true);
    }

    private CameraPosition buildCamera(CameraPosition previousPosition, boolean shouldUpdateTarget) {
        CameraPosition.Builder builder = new CameraPosition.Builder(previousPosition)
                .bearing(mHeading)
                .tilt(mPitch)
                .zoom(mZoomLevel);

        if (shouldUpdateTarget) {
            builder.target(GeoJSONUtils.toLatLng(mCenterCoordinate));
        }

        return builder.build();
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

    private void setMinMaxZoomLevels() {
        if (mMap == null) {
            return;
        }

        if (mMinZoomLevel != null) {
            mMap.setMinZoomPreference(mMinZoomLevel);
        }

        if (mMaxZoomLevel != null) {
            mMap.setMaxZoomPreference(mMaxZoomLevel);
        }
    }

    private void setLifecycleListeners() {
        ReactContext context = (ReactContext) mContext;
        context.addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                if (mShowUserLocation && !mLocationManger.isActive()) {
                    mLocationManger.enable();
                }
                onResume();
            }

            @Override
            public void onHostPause() {
                if (mLocationManger.isActive()) {
                    mLocationManger.disable();
                }
                onPause();
            }

            @Override
            public void onHostDestroy() {
                dispose();
                onDestroy();
            }
        });
    }

    private void enableLocation() {
        if (!PermissionsManager.areLocationPermissionsGranted(mContext)) {
            return;
        }

        if (!mLocationManger.isActive()) {
            mLocationManger.enable();
        }

        updateLocationLayer();

        Location lastKnownLocation = mLocationManger.getLastKnownLocation();
        if (lastKnownLocation != null) {
            mLocationChangeListener.onLocationChange(lastKnownLocation);

            postDelayed(new Runnable() {
                @Override
                public void run() {
                    sendRegionChangeEvent(false);
                }
            }, 200);
        }
    }

    private void updateLocationLayer() {
        if (mLocationLayer == null) {
            mLocationLayer = new LocationLayerPlugin(this, mMap, mLocationManger.getEngine());
        }

        int userLayerMode = UserTrackingMode.getMapLayerMode(mUserLocation.getTrackingMode(), mShowUserLocation);
        if (userLayerMode != mLocationLayer.getLocationLayerMode()) {
            mLocationLayer.setLocationLayerEnabled(userLayerMode);
        }
    }

    private WritableMap makeRegionPayload(boolean isAnimated) {
        CameraPosition position = mMap.getCameraPosition();
        LatLng latLng = new LatLng(position.target.getLatitude(), position.target.getLongitude());

        WritableMap properties = new WritableNativeMap();
        properties.putDouble("zoomLevel", position.zoom);
        properties.putDouble("heading", position.bearing);
        properties.putDouble("pitch", position.tilt);
        properties.putBoolean("animated", isAnimated);
        properties.putBoolean("isUserInteraction", mCameraChangeTracker.isUserInteraction());

        VisibleRegion visibleRegion = mMap.getProjection().getVisibleRegion();
        properties.putArray("visibleBounds", GeoJSONUtils.fromLatLngBounds(visibleRegion.latLngBounds));

        return GeoJSONUtils.toPointFeature(latLng, properties);
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

            if (source.hasPressListener()) {
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
            String[] layerIDs = source.getLayerIDs();

            for (String layerID : layerIDs) {
                layerToSourceMap.put(layerID, source);
            }
        }

        // getLayers returns from back(N - 1) to front(0)
        List<Layer> mapboxLayers = mMap.getLayers();
        for (int i = mapboxLayers.size() - 1; i >= 0; i--) {
            Layer mapboxLayer = mapboxLayers.get(i);

            String layerID = mapboxLayer.getId();
            if (layerToSourceMap.containsKey(layerID)) {
                return layerToSourceMap.get(layerID);
            }
        }

        return null;
    }

    private void updateUserTrackingMode(int userTrackingMode) {
        mUserLocation.setTrackingMode(userTrackingMode);
        IEvent event = new MapUserTrackingModeEvent(this, userTrackingMode);
        mManager.handleEvent(event);
    }

    private void updateUserLocation(boolean isAnimated) {
        if (!mShowUserLocation || mUserLocation.getTrackingMode() == UserTrackingMode.NONE) {
            return;
        }

        if (mUserTrackingState == UserTrackingState.POSSIBLE) {
            updateUserLocationSignificantly(isAnimated);
        } else if (mUserTrackingState == UserTrackingState.CHANGED) {
            updateUserLocationIncrementally(isAnimated);
        }
    }

    private void updateUserLocationSignificantly(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(getUserLocationUpdateCameraPosition(mZoomLevel));
        MapboxMap.CancelableCallback cameraCallback = new MapboxMap.CancelableCallback() {
            @Override
            public void onCancel() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onFinish() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }
        };

        if (isAnimated && hasSetCenterCoordinate()) {
            mMap.animateCamera(cameraUpdate, cameraCallback);
        } else {
            mMap.moveCamera(cameraUpdate, cameraCallback);
        }
    }

    private void updateUserLocationIncrementally(boolean isAnimated) {
        mUserTrackingState = UserTrackingState.BEGAN;

        CameraPosition cameraPosition = mMap.getCameraPosition();
        CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(getUserLocationUpdateCameraPosition(cameraPosition.zoom));

        MapboxMap.CancelableCallback callback = new MapboxMap.CancelableCallback() {
            @Override
            public void onCancel() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }

            @Override
            public void onFinish() {
                mUserTrackingState = UserTrackingState.CHANGED;
            }
        };

        if (isAnimated) {
            mMap.easeCamera(cameraUpdate, USER_LOCATION_CAMERA_MOVE_DURATION, callback);
        } else {
            mMap.moveCamera(cameraUpdate, callback);
        }
    }

    private CameraPosition getUserLocationUpdateCameraPosition(double zoomLevel) {
        LatLng center = mUserLocation.getCoordinate();

        if (mUserLocationVerticalAlignment != UserLocationVerticalAlignment.CENTER) {
            DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();
            int[] contentPadding = mMap.getPadding();

            // we want to get the width, and height scaled based on pixel density, that also includes content padding
            // (width * percentOfWidthWeWant - (leftPadding + rightPadding)) / dpi
            int mapWidth = (int)((mMap.getWidth() * 0.75 - (contentPadding[0] + contentPadding[2])) / metrics.scaledDensity);
            int mapHeight = (int)((mMap.getHeight() * 0.75 - (contentPadding[1] + contentPadding[3])) / metrics.scaledDensity);
            VisibleRegion region = GeoViewport.getRegion(center, (int) zoomLevel, mapWidth, mapHeight);

            switch (mUserLocationVerticalAlignment) {
                case UserLocationVerticalAlignment.TOP:
                    center = new LatLng(region.nearRight.getLatitude(), center.getLongitude());
                    break;
                case UserLocationVerticalAlignment.BOTTOM:
                    center = new LatLng(region.farLeft.getLatitude(), center.getLongitude());
                    break;
            }
        }

        return new CameraPosition.Builder()
                .target(center)
                .bearing(getDirectionForUserLocationUpdate())
                .tilt(mPitch)
                .zoom(zoomLevel)
                .build();
    }

    private double getDirectionForUserLocationUpdate() {
        // NOTE: The direction of this is used for map rotation only, not location layer rotation
        CameraPosition currentCamera = mMap.getCameraPosition();
        double direction = currentCamera.bearing;

        int userTrackingMode = mUserLocation.getTrackingMode();
        if (userTrackingMode == UserTrackingMode.FollowWithHeading || userTrackingMode == UserTrackingMode.FollowWithCourse) {
            direction = mUserLocation.getBearing();
        } else if (mHeading != 0.0) {
            direction = mHeading;
        }

        return direction;
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

    private void sendRegionChangeEvent(boolean isAnimated) {
        IEvent event = new MapChangeEvent(this, makeRegionPayload(isAnimated), EventTypes.REGION_DID_CHANGE);
        mManager.handleEvent(event);
        mCameraChangeTracker.setReason(-1);
    }
}
