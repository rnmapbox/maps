package com.mapbox.rctmgl.components.camera;

import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;

/**
 * Created by nickitaliano on 9/5/17.
 */

public class CameraUpdateItem {
    private int mDuration;
    private MapboxMap.CancelableCallback mCallback;
    private CameraUpdate mCameraUpdate;
    private int mCameraMode;

    public interface  OnCameraCompleteListener {
        void onComplete();
    }

    public CameraUpdateItem(CameraUpdate update, int duration, MapboxMap.CancelableCallback callback, @CameraMode.Mode int cameraMode) {
        mCameraUpdate = update;
        mDuration = duration;
        mCallback = callback;
        mCameraMode = cameraMode;
    }

    public int getDuration() {
        return mDuration;
    }

    public void execute(MapboxMap map, final OnCameraCompleteListener listener) {
        final MapboxMap.CancelableCallback callback = new MapboxMap.CancelableCallback() {
            @Override
            public void onCancel() {
                handleCallbackResponse(listener, true);
            }

            @Override
            public void onFinish() {
                handleCallbackResponse(listener, false);
            }
        };

        if (mCameraMode == CameraMode.FLIGHT) {
            map.animateCamera(mCameraUpdate, mDuration, callback);
        } else if (mCameraMode == CameraMode.EASE) {
            map.easeCamera(mCameraUpdate, mDuration, callback);
        } else {
            map.moveCamera(mCameraUpdate, callback);
        }
    }

    private void handleCallbackResponse(OnCameraCompleteListener listener, boolean isCancel) {
        listener.onComplete();

        if (mCallback == null) {
            return;
        }

        if (isCancel) {
            mCallback.onCancel();
        } else {
            mCallback.onFinish();
        }
    }
}
