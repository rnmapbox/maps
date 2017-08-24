package mapbox.rctmgl.components;

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
import com.mapbox.services.commons.geojson.Point;

import mapbox.rctmgl.utils.MGLGeoUtils;
import mapbox.rctmgl.events.RCTMGLMapClickEvent;
import mapbox.rctmgl.events.RCTMGLMapLongClickEvent;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapView extends RelativeLayout implements OnMapReadyCallback {
    public static final String LOG_TAG = RCTMGLMapView.class.getSimpleName();

    private RCTMGLMapViewManager mManager;

    private MapboxMap mMap;
    private MapView mMapView;

    private String mStyleURL;
    private boolean mAnimated;
    private double mHeading;
    private double mPitch;
    private double mZoomLevel;
    private Point mCenterCoordinate;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager) {
        super(context);
        mManager = manager;
    }

    @Override
    public void onMapReady(MapboxMap mapboxMap) {
        if (mMapView == null) {
            Log.d(LOG_TAG, "Mapbox map is ready before our mapview is initialized!!!");
            return;
        }
        mMap = mapboxMap;
        setOnClickListener();
        setOnLongClickListener();
    }

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

    public void setCenterCoordinate(Point centerCoordinate) {
        mCenterCoordinate = centerCoordinate;
        updateCameraPositionIfNeeded(true);
    }

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

    private void setOnClickListener() {
        final RCTMGLMapView view = this;

        mMap.setOnMapClickListener(new MapboxMap.OnMapClickListener() {
            @Override
            public void onMapClick(@NonNull LatLng point) {
                RCTMGLMapClickEvent event = new RCTMGLMapClickEvent(view);
                event.setLatLng(point);
                mManager.handleEvent(event);
            }
        });
    }

    private void setOnLongClickListener() {
        final RCTMGLMapView view = this;

        mMap.setOnMapLongClickListener(new MapboxMap.OnMapLongClickListener() {
            @Override
            public void onMapLongClick(@NonNull LatLng point) {
                RCTMGLMapLongClickEvent event = new RCTMGLMapLongClickEvent(view);
                event.setLatLng(point);
                mManager.handleEvent(event);
            }
        });
    }
}
