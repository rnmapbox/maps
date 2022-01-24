package com.mapbox.rctmgl.modules;

import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
import com.mapbox.maps.CameraOptions;
import com.mapbox.maps.Image;
import com.mapbox.maps.MapSnapshotInterface;
import com.mapbox.maps.MapSnapshotOptions;
import com.mapbox.maps.ResourceOptions;
import com.mapbox.maps.SnapshotCreatedListener;
import com.mapbox.maps.Snapshotter;
import com.mapbox.maps.Size;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static android.content.Context.CONTEXT_IGNORE_SECURITY;

@ReactModule(name = RCTMGLSnapshotModule.REACT_CLASS)
public class RCTMGLSnapshotModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RCTMGLSnapshotModule";

    private ReactApplicationContext mContext;

    // prevents snapshotter from being GC'ed
    private Map<String, Snapshotter> mSnapshotterMap;

    public RCTMGLSnapshotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        mSnapshotterMap = new HashMap<>();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void takeSnap(final ReadableMap jsOptions, final Promise promise) {
        // FileSource.getInstance(mContext).activate();

        mContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                final String snapshotterID = UUID.randomUUID().toString();

                final Snapshotter snapshotter = new Snapshotter(mContext, getOptions(jsOptions));
                snapshotter.setStyleUri(jsOptions.getString("styleURL"));
                snapshotter.setCamera(getCameraOptions(jsOptions));

                mSnapshotterMap.put(snapshotterID, snapshotter);

                snapshotter.start(new SnapshotCreatedListener() {
                    @Override
                    public void onSnapshotResult(MapSnapshotInterface snapshot) {
                        try {
                            if (snapshot == null) {
                                Log.w(REACT_CLASS, "Snapshot failed");
                                promise.reject(REACT_CLASS, "Snapshot failed");
                                mSnapshotterMap.remove(snapshotterID);
                            } else {
                                Image image = snapshot.image();

                                String result = null;
                                if (jsOptions.getBoolean("writeToDisk")) {
                                    result = BitmapUtils.createImgTempFile(mContext, image);
                                } else {
                                    result = BitmapUtils.createImgBase64(image);
                                }

                                if (result == null) {
                                    promise.reject(REACT_CLASS, "Could not generate snapshot, please check Android logs for more info.");
                                    return;
                                }

                                promise.resolve(result);
                                mSnapshotterMap.remove(snapshotterID);
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                            promise.reject(REACT_CLASS, e.getLocalizedMessage());
                        }
                    }
                });
            }
        });
    }

    private CameraOptions getCameraOptions(ReadableMap jsOptions) {
        Feature centerPoint = Feature.fromJson(jsOptions.getString("centerCoordinate"));
        Point point = (Point) centerPoint.geometry();

        CameraOptions.Builder cameraOptionsBuilder = new CameraOptions.Builder();
        CameraOptions cameraOptions = cameraOptionsBuilder
                .center(point)
                .pitch(jsOptions.getDouble("pitch"))
                .bearing(jsOptions.getDouble("heading"))
                .zoom(jsOptions.getDouble("zoomLevel"))
                .build();
        return cameraOptions;
    }

    private MapSnapshotOptions getOptions(ReadableMap jsOptions) {
        MapSnapshotOptions.Builder builder = new MapSnapshotOptions.Builder();

        builder.size(
                new Size(
                        (int) jsOptions.getDouble("width"),
                        (int) jsOptions.getDouble("height")
                )
        );
        builder.pixelRatio(Float.valueOf(mContext.getResources().getDisplayMetrics().scaledDensity).intValue());

        builder.resourceOptions(new ResourceOptions.Builder().accessToken(RCTMGLModule.getAccessToken(mContext)).build());
        return builder.build();
    }

    private void closeSnapshotOutputStream(OutputStream outputStream) {
        if (outputStream == null) {
            return;
        }
        try {
            outputStream.close();
        } catch (IOException e) {
            Log.w(REACT_CLASS, e.getLocalizedMessage());
        }
    }
}
