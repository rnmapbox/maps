package com.mapbox.rctmgl.components.camera;

import android.animation.Animator;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.view.animation.LinearInterpolator;

import androidx.annotation.NonNull;

import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.plugin.animation.CameraAnimationsPlugin;
import com.mapbox.maps.plugin.animation.MapAnimationOptions;
import com.mapbox.rctmgl.components.camera.constants.CameraMode;

import java.lang.ref.WeakReference;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;
import java.util.concurrent.RunnableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import kotlin.jvm.functions.Function1;

public class CameraUpdateItem implements RunnableFuture<Void> {
    private int mDuration;
    private Animator.AnimatorListener mCallback;
    private CameraOptions mCameraUpdate;
    private int mCameraMode;

    private boolean isCameraActionFinished;
    private boolean isCameraActionCancelled;

    private WeakReference<MapboxMap> mMap;

    enum CallbackMode {
        START,
        END,
        CANCEL,
        REPEAT
    }


    public CameraUpdateItem(MapboxMap map, CameraOptions update, int duration, Animator.AnimatorListener callback, @CameraMode.Mode int cameraMode) {
        mCameraUpdate = update;
        mDuration = duration;
        mCallback = callback;
        mCameraMode = cameraMode;
        mMap = new WeakReference<>(map);
    }

    public int getDuration() {
        return mDuration;
    }

    @Override
    public void run() {
        final Animator.AnimatorListener callback = new Animator.AnimatorListener() {

            @Override
            public void onAnimationStart(Animator animator) {
                isCameraActionCancelled = false;
                isCameraActionFinished = false;

                if (mCallback != null) {
                    mCallback.onAnimationStart(animator);
                }
            }

            @Override
            public void onAnimationEnd(Animator animator) {
                isCameraActionCancelled = false;
                isCameraActionFinished = true;

                if (mCallback != null) {
                    mCallback.onAnimationEnd(animator);
                }
            }

            @Override
            public void onAnimationCancel(Animator animator) {
                isCameraActionCancelled = true;
                isCameraActionFinished = false;

                if (mCallback != null) {
                    mCallback.onAnimationCancel(animator);
                }
            }

            @Override
            public void onAnimationRepeat(Animator animator) {
                isCameraActionCancelled = false;
                isCameraActionFinished = false;

                if (mCallback != null) {
                    mCallback.onAnimationRepeat(animator);
                }
            }
        };

        MapboxMap map = mMap.get();
        if (map == null) {
            isCameraActionCancelled = true;
            return;
        }

        MapAnimationOptions.Builder optionsBuilder = new MapAnimationOptions.Builder();
        optionsBuilder.animatorListener(callback);

        map.cameraAnimationsPlugin(new Function1<CameraAnimationsPlugin, Object>() {

            @Override
            public Object invoke(CameraAnimationsPlugin cameraAnimationsPlugin) {

                // animateCamera / easeCamera only allows positive duration
                if (mDuration == 0 || mCameraMode == CameraMode.NONE) {
                    cameraAnimationsPlugin.flyTo(
                            mCameraUpdate,
                            optionsBuilder.duration(0).build()
                    );
                }

                // On iOS a duration of -1 means default or dynamic duration (based on flight-path length)
                // On Android we can fallback to Mapbox's default duration as there is no such API
                if (mDuration > 0) {
                    optionsBuilder.duration(mDuration);
                }

                if (mCameraMode == CameraMode.FLIGHT) {
                    cameraAnimationsPlugin.flyTo(mCameraUpdate, optionsBuilder.build());
                } else if (mCameraMode == CameraMode.LINEAR) {
                    cameraAnimationsPlugin.easeTo(mCameraUpdate, optionsBuilder.interpolator(new LinearInterpolator()).build());
                } else if (mCameraMode == CameraMode.EASE) {
                    cameraAnimationsPlugin.easeTo(mCameraUpdate, optionsBuilder.interpolator(new AccelerateDecelerateInterpolator()).build());
                }
                return null;
            }
        });
    }

    @Override
    public boolean cancel(boolean mayInterruptIfRunning) {
        return false;
    }

    @Override
    public boolean isCancelled() {
        return isCameraActionCancelled;
    }

    @Override
    public boolean isDone() {
        return isCameraActionFinished;
    }

    @Override
    public Void get() throws InterruptedException, ExecutionException {
        return null;
    }

    @Override
    public Void get(long timeout, @NonNull TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException {
        return null;
    }
}
