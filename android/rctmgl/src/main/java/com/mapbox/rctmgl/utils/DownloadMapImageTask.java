package com.mapbox.rctmgl.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;

import com.facebook.common.logging.FLog;
import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.facebook.react.views.textinput.ReactTextInputManager.TAG;

/**
 * Created by nickitaliano on 9/13/17.
 */

public class DownloadMapImageTask extends AsyncTask<Map.Entry<String, ImageEntry>, Void, List<Map.Entry<String, Bitmap>>> {
    public static final String LOG_TAG = DownloadMapImageTask.class.getSimpleName();

    private Context mContext;
    private MapboxMap mMap;
    private OnAllImagesLoaded mCallback;

    public DownloadMapImageTask(Context context, MapboxMap map, OnAllImagesLoaded callback) {
        mContext = context;
        mMap = map;
        mCallback = callback;
    }

    public interface OnAllImagesLoaded {
        void onAllImagesLoaded();
    }

    @SafeVarargs
    @Override
    protected final List<Map.Entry<String, Bitmap>> doInBackground(Map.Entry<String, ImageEntry>... objects) {
        Resources resources = mContext.getResources();
        DisplayMetrics metrics = resources.getDisplayMetrics();
        List<Map.Entry<String, Bitmap>> images = new ArrayList<>();

        for (Map.Entry<String, ImageEntry> object : objects) {
            ImageEntry imageEntry = object.getValue();

            String uri = imageEntry.uri;
            if (uri.contains("://")) { // has scheme attempt to get bitmap from url
                try {
                    Bitmap bitmap = BitmapUtils.getBitmapFromURL(uri, getBitmapOptions(metrics, imageEntry.scale));
                    images.add(new AbstractMap.SimpleEntry<String, Bitmap>(object.getKey(), bitmap));
                } catch (Exception e) {
                    Log.w(LOG_TAG, e.getLocalizedMessage());
                }
            } else if (uri.startsWith("/")) {
                Bitmap bitmap = BitmapUtils.getBitmapFromPath(uri, getBitmapOptions(metrics, imageEntry.scale));
                images.add(new AbstractMap.SimpleEntry<String, Bitmap>(object.getKey(), bitmap));
            } else if (uri.startsWith("data:image")) {
                try {
                    byte[] decodedString = Base64.decode(uri.substring(uri.indexOf(",") + 1), Base64.DEFAULT);
                    Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    images.add(new AbstractMap.SimpleEntry<String, Bitmap>(object.getKey(), bitmap));
                } catch (Exception e) {
                    FLog.e(LOG_TAG, "Failed to load bitmap from base64: " + uri);
                }
            } else {
                // local asset required from JS require('image.png') or import icon from 'image.png' while in release mode
                Bitmap bitmap = BitmapUtils.getBitmapFromResource(mContext, uri, getBitmapOptions(metrics, imageEntry.scale));
                if (bitmap != null) {
                    images.add(new AbstractMap.SimpleEntry<String, Bitmap>(object.getKey(), bitmap));
                } else {
                    FLog.e(LOG_TAG, "Failed to load bitmap from: " + uri);
                }
            }
        }

        return images;
    }

    @Override
    protected void onPostExecute(List<Map.Entry<String, Bitmap>> images) {
        if (images == null) {
            return;
        }

        for (Map.Entry<String, Bitmap> image : images) {
            if (mMap.getStyle() != null) {
                mMap.getStyle().addImage(image.getKey(), image.getValue());
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
