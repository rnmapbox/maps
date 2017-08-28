package mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.support.annotation.NonNull;
import android.util.Log;
import android.widget.RelativeLayout;

import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.services.commons.geojson.Point;

import mapbox.rctmgl.events.IRCTMGLEvent;
import mapbox.rctmgl.events.RCTMGLEventTypes;
import mapbox.rctmgl.events.RCTMGLMapChangeEvent;
import mapbox.rctmgl.utils.MGLGeoUtils;
import mapbox.rctmgl.events.RCTMGLMapClickEvent;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapView extends RelativeLayout implements
        OnMapReadyCallback, MapboxMap.OnMapClickListener, MapboxMap.OnMapLongClickListener,
        MapView.OnMapChangedListener
{
    public static final String LOG_TAG = RCTMGLMapView.class.getSimpleName();

    private RCTMGLMapViewManager mManager;

    private MapboxMap mMap;
    private MapView mMapView;

    private String mStyleURL;

    private boolean mAnimated;
    private boolean mScrollEnabled;
    private boolean mPitchEnabled;

    private double mHeading;
    private double mPitch;
    private double mZoomLevel;

    private Double mMinZoomLevel;
    private Double mMaxZoomLevel;

    private Point mCenterCoordinate;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager) {
        super(context);
        mManager = manager;
    }

    //region Map Callbacks

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        if (mMapView == null) {
            Log.d(LOG_TAG, "Mapbox map is ready before our mapview is initialized!!!");
            return;
        }
        mMap = mapboxMap;
        mMap.setOnMapClickListener(this);
        mMap.setOnMapLongClickListener(this);
        mMapView.addOnMapChangedListener(this);

        // in case props were set before the map was ready lets set them
        updateUISettings();
        setMinMaxZoomLevels();
    }

    @Override
    public void onMapClick(@NonNull LatLng point) {
        RCTMGLMapClickEvent event = new RCTMGLMapClickEvent(this);
        event.setLatLng(point);
        mManager.handleEvent(event);
    }

    @Override
    public void onMapLongClick(@NonNull LatLng point) {
        RCTMGLMapClickEvent event = new RCTMGLMapClickEvent(this, RCTMGLEventTypes.MAP_LONG_CLICK);
        event.setLatLng(point);
        mManager.handleEvent(event);
    }

    @Override
    public void onMapChanged(int changed) {
        IRCTMGLEvent event = null;

        switch (changed) {
            case MapView.REGION_WILL_CHANGE:
            case MapView.REGION_WILL_CHANGE_ANIMATED:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.REGION_WILL_CHANGE);
                break;
            case MapView.REGION_IS_CHANGING:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.REGION_IS_CHANGING);
                break;
            case MapView.REGION_DID_CHANGE:
            case MapView.REGION_DID_CHANGE_ANIMATED:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.REGION_DID_CHANGE);
                break;
            case MapView.WILL_START_LOADING_MAP:
                 event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.WILL_START_LOADING_MAP);
                break;
            case MapView.DID_FAIL_LOADING_MAP:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FAIL_LOADING_MAP);
                break;
            case MapView.DID_FINISH_LOADING_MAP:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_LOADING_MAP);
                break;
            case MapView.WILL_START_RENDERING_FRAME:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.WILL_START_RENDERING_FRAME);
                break;
            case MapView.DID_FINISH_RENDERING_FRAME:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_RENDERING_FRAME);
                break;
            case MapView.DID_FINISH_RENDERING_FRAME_FULLY_RENDERED:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
                break;
            case MapView.WILL_START_RENDERING_MAP:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.WILL_START_RENDERING_MAP);
                break;
            case MapView.DID_FINISH_RENDERING_MAP:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_RENDERING_MAP);
                break;
            case MapView.DID_FINISH_RENDERING_MAP_FULLY_RENDERED:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_RENDERING_MAP_FULLY);
                break;
            case MapView.DID_FINISH_LOADING_STYLE:
                event = new RCTMGLMapChangeEvent(this, RCTMGLEventTypes.DID_FINISH_LOADING_STYLE);
                break;
        }

        if (event != null) {
            mManager.handleEvent(event);
        }
    }

    //endregion

    //region Property getter/setters

    public void setStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            mMap.setStyleUrl(styleURL);
        }
    }

    public void setAnimated(boolean animated) {
        mAnimated = animated;
        updateCameraPositionIfNeeded(false);
    }

    public void setScrollEnabled(boolean scrollEnabled) {
        mScrollEnabled = scrollEnabled;
        updateUISettings();
    }

    public void setPitchEnabled(boolean pitchEnabled) {
        mPitchEnabled = pitchEnabled;
        updateUISettings();
    }

    public void setHeading(double heading) {
        mHeading = heading;
        updateCameraPositionIfNeeded(false);
    }

    public void setPitch(double pitch) {
        mPitch = pitch;
        updateCameraPositionIfNeeded(false);
    }

    public void setZoomLevel(double zoomLevel) {
        mZoomLevel = zoomLevel;
        updateCameraPositionIfNeeded(false);
    }

    public void setMinZoomLevel(double minZoomLevel) {
        mMinZoomLevel = minZoomLevel;
        setMinMaxZoomLevels();
    }

    public void setMaxZoomLevel(double maxZoomLevel) {
        mMaxZoomLevel = maxZoomLevel;
        setMinMaxZoomLevels();
    }

    public void setCenterCoordinate(Point centerCoordinate) {
        mCenterCoordinate = centerCoordinate;
        updateCameraPositionIfNeeded(true);
    }

    //endregion

    //region Methods

    public void flyTo(Point flyToPoint, int durationMS) {
        CameraPosition nextPosition = new CameraPosition.Builder(mMap.getCameraPosition())
                .target(MGLGeoUtils.pointToLatLng(flyToPoint))
                .build();
        CameraUpdate flyToUpdate = CameraUpdateFactory.newCameraPosition(nextPosition);
        mMap.animateCamera(flyToUpdate, durationMS);
    }

    //endregion

    public void makeView() {
        if (mMapView != null) {
            return;
        }
        buildMapView();
    }

    private void buildMapView() {
        MapboxMapOptions options = new MapboxMapOptions();
        options.camera(buildCamera());

        mMapView = new MapView(getContext(), options);
        mManager.addView(this, mMapView, 0);
        mMapView.setStyleUrl(mStyleURL);
        mMapView.onCreate(null);
        mMapView.getMapAsync(this);
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
            builder.target(MGLGeoUtils.pointToLatLng(mCenterCoordinate));
        }

        return builder.build();
    }

    private void updateUISettings() {
        if (mMap == null) {
            return;
        }
        UiSettings uiSettings = mMap.getUiSettings();
        uiSettings.setScrollGesturesEnabled(mScrollEnabled);
        uiSettings.setTiltGesturesEnabled(mPitchEnabled);
    }

    private void setMinMaxZoomLevels() {
        if (mMap == null) {
            return;
        }

        if (mMinZoomLevel != null) {
            mMap.setMinZoomPreference(mMinZoomLevel.doubleValue());
        }

        if (mMaxZoomLevel != null) {
            mMap.setMaxZoomPreference(mMaxZoomLevel.doubleValue());
        }
    }
}
