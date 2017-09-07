package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.PointF;
import android.location.Location;
import android.support.annotation.NonNull;
import android.util.Log;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.locationlayer.LocationLayerPlugin;
import com.mapbox.rctmgl.components.camera.CameraStop;
import com.mapbox.rctmgl.components.camera.CameraUpdateQueue;
import com.mapbox.services.android.location.LostLocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngine;
import com.mapbox.services.android.telemetry.location.LocationEngineListener;
import com.mapbox.services.android.telemetry.location.LocationEnginePriority;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.MapClickEvent;
import com.mapbox.rctmgl.events.UserLocationChangeEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.SimpleEventCallback;

/**
 * Created by nickitaliano on 8/18/17.
 */

@SuppressWarnings({"MissingPermission"})
public class RCTMGLMapView extends MapView implements
        OnMapReadyCallback, MapboxMap.OnMapClickListener, MapboxMap.OnMapLongClickListener,
        MapView.OnMapChangedListener, LocationEngineListener
{
    public static final String LOG_TAG = RCTMGLMapView.class.getSimpleName();

    private RCTMGLMapViewManager mManager;
    private Context mContext;

    private CameraUpdateQueue mCameraUpdateQueue;

    private MapboxMap mMap;
    private LocationEngine mLocationEngine;
    private LocationLayerPlugin mLocationLayer;

    private String mStyleURL;

    private boolean mAnimated;
    private boolean mScrollEnabled;
    private boolean mPitchEnabled;
    private boolean mShowUserLocation;

    private int mUserTrackingMode;

    private double mHeading;
    private double mPitch;
    private double mZoomLevel;

    private Double mMinZoomLevel;
    private Double mMaxZoomLevel;

    private Point mCenterCoordinate;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager) {
        super(context);

        super.onCreate(null);
        super.getMapAsync(this);

        mContext = context;
        mManager = manager;
        mCameraUpdateQueue = new CameraUpdateQueue();
    }

    public void dispose() {
        if (mLocationEngine != null) {
            mLocationEngine.removeLocationEngineListener(this);
            mLocationEngine.deactivate();
        }
    }

    public MapboxMap getMapboxMap() {
        return mMap;
    }

    //region Map Callbacks

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        mMap = mapboxMap;

        mMap.setOnMapClickListener(this);
        mMap.setOnMapLongClickListener(this);
        addOnMapChangedListener(this);

        // in case props were set before the map was ready lets set them
        updateUISettings();
        setMinMaxZoomLevels();

        if (mShowUserLocation) {
            mMap.moveCamera(CameraUpdateFactory.zoomTo(mZoomLevel));
            enableLocationLayer();
        } else {
            mMap.moveCamera(CameraUpdateFactory.newCameraPosition(buildCamera()));
        }

        if (!mCameraUpdateQueue.isEmpty()) {
            mCameraUpdateQueue.execute(mMap);
        }
    }

    @Override
    public void onMapClick(@NonNull LatLng point) {
        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
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
                event = new MapChangeEvent(this, makeRegionPayload(false), EventTypes.REGION_WILL_CHANGE);
                break;
            case REGION_DID_CHANGE_ANIMATED:
                event = new MapChangeEvent(this, makeRegionPayload(true), EventTypes.REGION_DID_CHANGE);
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
            mMap.setStyleUrl(styleURL);
        }
    }

    public void setReactAnimated(boolean animated) {
        mAnimated = animated;
        updateCameraPositionIfNeeded(false);
    }

    public void setReactScrollEnabled(boolean scrollEnabled) {
        mScrollEnabled = scrollEnabled;
        updateUISettings();
    }

    public void setReactPitchEnabled(boolean pitchEnabled) {
        mPitchEnabled = pitchEnabled;
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

        if (mLocationEngine != null) {
            // deactive location engine if we are hiding the location layer
            if (!mShowUserLocation) {
                mLocationEngine.deactivate();
                return;
            }

            if (mMap != null) {
                enableLocationLayer();
            }
        }
    }

    public void setReactUserTrackingMode(int userTrackingMode) {
        mUserTrackingMode = userTrackingMode;

        if (mLocationLayer != null) {
            mLocationLayer.setLocationLayerEnabled(mUserTrackingMode);
        }
    }

    //endregion

    //region Methods

    public void setCamera(ReadableMap args) {
        final IEvent event = new MapChangeEvent(this, EventTypes.SET_CAMERA_COMPLETE);
        final SimpleEventCallback callback = new SimpleEventCallback(mManager, event);

        // remove any current camera updates
        mCameraUpdateQueue.flush();

        if (args.hasKey("stops")) {
            ReadableArray stops = args.getArray("stops");

            for (int i = 0; i < stops.size(); i++) {
                CameraStop stop = CameraStop.fromReadableMap(stops.getMap(i), null);
                mCameraUpdateQueue.offer(stop);
            }

            mCameraUpdateQueue.setOnCompleteAllListener(new CameraUpdateQueue.OnCompleteAllListener() {
                @Override
                public void onCompleteAll() {
                    callback.onFinish();
                }
            });
        } else {
            CameraStop stop = CameraStop.fromReadableMap(args, callback);
            mCameraUpdateQueue.offer(stop);
        }

        // if map is already ready start executing on the queue
        if (mMap != null) {
            mCameraUpdateQueue.execute(mMap);
        }
    }

    //endregion

    @Override
    public void onConnected() {
        mLocationEngine.requestLocationUpdates();

        Location location = mLocationEngine.getLastLocation();
        if (location != null) {
            LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
            mMap.moveCamera(CameraUpdateFactory.newLatLng(latLng));
        }
    }

    @Override
    public void onLocationChanged(Location location) {
        IEvent event = new UserLocationChangeEvent(this, location);
        mManager.handleEvent(event);

        LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
        mMap.animateCamera(CameraUpdateFactory.newLatLng(latLng));
    }

    public void init() {
        setStyleUrl(mStyleURL);
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
            builder.target(ConvertUtils.toLatLng(mCenterCoordinate));
        }

        return builder.build();
    }

    private void updateUISettings() {
        if (mMap == null) {
            return;
        }
        // Gesture settings
        UiSettings uiSettings = mMap.getUiSettings();
        uiSettings.setScrollGesturesEnabled(mScrollEnabled);
        uiSettings.setTiltGesturesEnabled(mPitchEnabled);
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

    private void enableLocationLayer() {
        if (mLocationEngine == null) {
            mLocationEngine = LostLocationEngine.getLocationEngine(mContext);
            mLocationEngine.setPriority(LocationEnginePriority.HIGH_ACCURACY);
            mLocationEngine.addLocationEngineListener(this);
            mLocationEngine.activate();
        }

        if (mLocationLayer == null) {
            mLocationLayer = new LocationLayerPlugin(this, mMap, mLocationEngine);

        }

        if (mUserTrackingMode != mLocationLayer.getLocationLayerMode()) {
            mLocationLayer.setLocationLayerEnabled(mUserTrackingMode);
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

        return ConvertUtils.toPointFeature(latLng, properties);
    }
}
