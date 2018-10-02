package com.mapbox.rctmgl.components.camera;

import android.content.Context;

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.AbstractMapFeature;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
import com.mapbox.rctmgl.events.MapChangeEvent;

public class RCTMGLCamera extends AbstractMapFeature {
    private RCTMGLCameraManager mManager;
    private RCTMGLMapView mMapView;

    private boolean hasSentFirstRegion = false;

    private CameraStop mCameraStop;
    private CameraUpdateQueue mCameraUpdateQueue;

    private MapboxMap.CancelableCallback mCameraCallback = new MapboxMap.CancelableCallback() {
        @Override
        public void onCancel() {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }

        @Override
        public void onFinish() {
            if (!hasSentFirstRegion) {
                mMapView.sendRegionChangeEvent(false);
                hasSentFirstRegion = true;
            }
        }
    };

    public RCTMGLCamera(Context context, RCTMGLCameraManager manager) {
        super(context);
        mManager = manager;
        mCameraUpdateQueue = new CameraUpdateQueue();
    }

    @Override
    public void addToMap(RCTMGLMapView mapView) {
        mMapView = mapView;

        if (mCameraStop != null) {
            updateCamera();
        }
    }

    @Override
    public void removeFromMap(RCTMGLMapView mapView) {

    }

    public void setStop(CameraStop stop) {
        mCameraStop = stop;
        mCameraStop.setCallback(mCameraCallback);

        if (mMapView != null) {
            updateCamera();
        }
    }

    private void updateCamera() {
        mCameraUpdateQueue.offer(mCameraStop);
        mCameraUpdateQueue.execute(mMapView.getMapboxMap());
    }
}
