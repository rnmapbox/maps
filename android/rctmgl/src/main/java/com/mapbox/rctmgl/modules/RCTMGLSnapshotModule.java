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
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import com.mapbox.mapboxsdk.snapshotter.MapSnapshot;
import com.mapbox.mapboxsdk.snapshotter.MapSnapshotter;
import com.mapbox.mapboxsdk.storage.FileSource;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static android.content.Context.CONTEXT_IGNORE_SECURITY;

/**
 * Created by nickitaliano on 11/30/17.
 */

public class RCTMGLSnapshotModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = RCTMGLSnapshotModule.class.getSimpleName();

    private ReactApplicationContext mContext;

    // prevents snapshotter from being GC'ed
    private Map<String, MapSnapshotter> mSnapshotterMap;

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
        FileSource.getInstance(mContext).activate();

        mContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                final String snapshotterID = UUID.randomUUID().toString();
                final MapSnapshotter snapshotter = new MapSnapshotter(mContext, getOptions(jsOptions));
                mSnapshotterMap.put(snapshotterID, snapshotter);

                snapshotter.start(new MapSnapshotter.SnapshotReadyCallback() {
                    @Override
                    public void onSnapshotReady(MapSnapshot snapshot) {
                        Bitmap bitmap = snapshot.getBitmap();

                        String result = null;
                        if (jsOptions.getBoolean("writeToDisk")) {
                            result = BitmapUtils.createTempFile(mContext, bitmap);
                        } else {
                            result = BitmapUtils.createBase64(bitmap);
                        }

                        if (result == null) {
                            promise.reject(REACT_CLASS, "Could not generate snapshot, please check Android logs for more info.");
                            return;
                        }

                        promise.resolve(result);
                        mSnapshotterMap.remove(snapshotterID);
                    }
                }, new MapSnapshotter.ErrorHandler() {
                    @Override
                    public void onError(String error) {
                        Log.w(REACT_CLASS, error);
                        mSnapshotterMap.remove(snapshotterID);
                    }
                });
            }
        });
    }

    private MapSnapshotter.Options getOptions(ReadableMap jsOptions) {
        MapSnapshotter.Options options = new MapSnapshotter.Options(
                (int) jsOptions.getDouble("width"),
                (int) jsOptions.getDouble("height"));

        options.withStyle(jsOptions.getString("styleURL"));
        options.withPixelRatio(Float.valueOf(mContext.getResources().getDisplayMetrics().scaledDensity).intValue());

        if (jsOptions.hasKey("bounds")) {
            FeatureCollection bounds = FeatureCollection.fromJson(jsOptions.getString("bounds"));
            options.withRegion(GeoJSONUtils.toLatLngBounds(bounds));
        } else {
            Feature centerPoint = Feature.fromJson(jsOptions.getString("centerCoordinate"));
            CameraPosition cameraPosition = new CameraPosition.Builder()
                    .target(GeoJSONUtils.toLatLng((Point) centerPoint.getGeometry()))
                    .tilt(jsOptions.getDouble("pitch"))
                    .bearing(jsOptions.getDouble("heading"))
                    .zoom(jsOptions.getDouble("zoomLevel"))
                    .build();
            options.withCameraPosition(cameraPosition);
        }

        return options;
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
