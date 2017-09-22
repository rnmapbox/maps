package com.mapbox.rctmgl.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;

import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.io.InputStream;
import java.net.URL;

/**
 * Created by nickitaliano on 9/13/17.
 */

public class DownloadMapImageTask extends AsyncTask<Void, Void, Bitmap> {
    public static final String LOG_TAG = DownloadMapImageTask.class.getSimpleName();

    private String mURL;
    private MapboxMap mMap;

    public DownloadMapImageTask(String uri, MapboxMap map) {
        mURL = uri;
        mMap = map;
    }

    @Override
    protected Bitmap doInBackground(Void... _) {
        Bitmap bitmap = null;

        try {
            InputStream bitmapStream = new URL(mURL).openStream();
            bitmap = BitmapFactory.decodeStream(bitmapStream);
            bitmapStream.close();
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }

        return bitmap;
    }

    @Override
    protected void onPostExecute(Bitmap bitmap) {
        if (bitmap == null || mMap == null) {
            return;
        }
        mMap.addImage(mURL, bitmap);
    }
}
