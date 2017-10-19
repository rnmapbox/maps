package com.mapbox.rctmgl.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Handler;
import android.util.Log;

import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.io.InputStream;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 9/13/17.
 */

public class DownloadMapImageTask extends AsyncTask<Map.Entry<String, String>, Void, List<Map.Entry<String, Bitmap>>> {
    public static final String LOG_TAG = DownloadMapImageTask.class.getSimpleName();

    private MapboxMap mMap;
    private OnAllImagesLoaded mCallback;

    public DownloadMapImageTask(MapboxMap map, OnAllImagesLoaded callback) {
        mMap = map;
        mCallback = callback;
    }

    public interface OnAllImagesLoaded {
        void onAllImagesLoaded();
    }

    @SafeVarargs
    @Override
    protected final List<Map.Entry<String, Bitmap>> doInBackground(Map.Entry<String, String>... objects) {
        List<Map.Entry<String, Bitmap>> images = new ArrayList<>();

        for (Map.Entry<String, String> object : objects) {
            try {
                Bitmap bitmap = BitmapUtils.getBitmapFromURL(object.getValue());
                images.add(new AbstractMap.SimpleEntry<String, Bitmap>(object.getKey(), bitmap));
            } catch (Exception e) {
                Log.w(LOG_TAG, e.getLocalizedMessage());
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
            mMap.addImage(image.getKey(), image.getValue());
        }

        if (mCallback != null) {
            mCallback.onAllImagesLoaded();
        }
    }
}
