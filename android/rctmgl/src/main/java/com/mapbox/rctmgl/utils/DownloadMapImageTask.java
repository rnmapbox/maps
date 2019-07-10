package com.mapbox.rctmgl.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.DisplayMetrics;
import android.util.Log;

import com.facebook.common.logging.FLog;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;

import java.lang.ref.WeakReference;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by nickitaliano on 9/13/17.
 */

public class DownloadMapImageTask extends AsyncTask<Map.Entry<String, ImageEntry>, Void, List<Map.Entry<String, Bitmap>>> {
    public static final String LOG_TAG = DownloadMapImageTask.class.getSimpleName();

    private WeakReference<Context> mContext;
    private WeakReference<MapboxMap> mMap;
    @Nullable
    private OnAllImagesLoaded mCallback;

    public DownloadMapImageTask(Context context, MapboxMap map, @Nullable OnAllImagesLoaded callback) {
        mContext = new WeakReference<>(context.getApplicationContext());
        mMap = new WeakReference<>(map);
        mCallback = callback;
    }

    public interface OnAllImagesLoaded {
        void onAllImagesLoaded();
    }

    @SafeVarargs
    @Override
    protected final List<Map.Entry<String, Bitmap>> doInBackground(Map.Entry<String, ImageEntry>... objects) {
        List<Map.Entry<String, Bitmap>> images = new ArrayList<>();

        Context context = mContext.get();
        if (context == null) return images;

        Resources resources = context.getResources();
        DisplayMetrics metrics = resources.getDisplayMetrics();

        for (Map.Entry<String, ImageEntry> object : objects) {
            ImageEntry imageEntry = object.getValue();

            String uri = imageEntry.uri;
            if (uri.contains("://")) { // has scheme attempt to get bitmap from url
                try {
                    Bitmap bitmap = BitmapUtils.getBitmapFromURL(uri, getBitmapOptions(metrics, imageEntry.scale));
                    images.add(new AbstractMap.SimpleEntry<>(object.getKey(), bitmap));
                } catch (Exception e) {
                    Log.w(LOG_TAG, e.getLocalizedMessage());
                }
            } else if (uri.startsWith("/")) {
                Bitmap bitmap = BitmapUtils.getBitmapFromPath(uri, getBitmapOptions(metrics, imageEntry.scale));
                images.add(new AbstractMap.SimpleEntry<>(object.getKey(), bitmap));
            } else {
                // local asset required from JS require('image.png') or import icon from 'image.png' while in release mode
                Bitmap bitmap = BitmapUtils.getBitmapFromResource(context, uri, getBitmapOptions(metrics, imageEntry.scale));
                if (bitmap != null) {
                    images.add(new AbstractMap.SimpleEntry<>(object.getKey(), bitmap));
                } else {
                    FLog.e(LOG_TAG, "Failed to load bitmap from: " + uri);
                }
            }
        }

        return images;
    }

    @Override
    protected void onPostExecute(List<Map.Entry<String, Bitmap>> images) {
        MapboxMap map = mMap.get();
        if (map != null && images != null && images.size() > 0) {
            Style style = map.getStyle();
            if (style != null) {
                HashMap<String, Bitmap> bitmapImages = new HashMap<>();
                for (Map.Entry<String, Bitmap> image : images) {
                    bitmapImages.put(image.getKey(), image.getValue());
                }
                style.addImages(bitmapImages);
            }
        }

        if (mCallback != null) {
            mCallback.onAllImagesLoaded();
        }
    }

    private BitmapFactory.Options getBitmapOptions(DisplayMetrics metrics, Double scale) {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inScreenDensity = metrics.densityDpi;
        options.inTargetDensity = metrics.densityDpi;
        options.inDensity = (int)((double)DisplayMetrics.DENSITY_DEFAULT * scale);
        return options;
    }
}
