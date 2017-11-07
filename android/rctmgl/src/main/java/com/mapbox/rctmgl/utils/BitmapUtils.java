package com.mapbox.rctmgl.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.util.LruCache;

import java.io.InputStream;
import java.net.URL;

/**
 * Created by nickitaliano on 10/9/17.
 */

public class BitmapUtils {
    public static final String LOG_TAG = BitmapUtils.class.getSimpleName();

    private  static int CACHE_SIZE = 1024 * 1024;
    private static LruCache<String, Bitmap> mCache = new LruCache<String, Bitmap>(CACHE_SIZE) {
        protected int sizeOf(String key, Bitmap bitmap) {
            return bitmap.getByteCount();
        }
    };

    public static Bitmap getBitmapFromURL(String url) {
        Bitmap bitmap = getImage(url);

        if (bitmap != null) {
            return  bitmap;
        }

        try {
            InputStream bitmapStream = new URL(url).openStream();
            bitmap = BitmapFactory.decodeStream(bitmapStream);
            bitmapStream.close();
            addImage(url, bitmap);
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }

        return bitmap;
    }

    private static void addImage(String imageURL, Bitmap bitmap) {
        mCache.put(imageURL, bitmap);
    }

    private static Bitmap getImage(String imageURL) {
        return mCache.get(imageURL);
    }
}
