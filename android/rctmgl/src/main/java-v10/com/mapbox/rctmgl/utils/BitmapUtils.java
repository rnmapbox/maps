package com.mapbox.rctmgl.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.net.Uri;
import android.util.Base64;
import android.util.Log;
import android.util.LruCache;
import android.view.View;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

/**
 * Created by nickitaliano on 10/9/17.
 */

public class BitmapUtils {
    public static final String LOG_TAG = "BitmapUtils";

    private  static int CACHE_SIZE = 1024 * 1024;
    private static LruCache<String, Bitmap> mCache = new LruCache<String, Bitmap>(CACHE_SIZE) {
        protected int sizeOf(String key, Bitmap bitmap) {
            return bitmap.getByteCount();
        }
    };

    public static Bitmap getBitmapFromURL(String url) {
        return BitmapUtils.getBitmapFromURL(url, null);
    }

    public static Bitmap getBitmapFromURL(String url, BitmapFactory.Options options) {
        Bitmap bitmap = getImage(url);

        if (bitmap != null) {
            return  bitmap;
        }

        try {
            InputStream bitmapStream = new URL(url).openStream();
            bitmap = BitmapFactory.decodeStream(bitmapStream, null, options);
            bitmapStream.close();
            addImage(url, bitmap);
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
            bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ALPHA_8); // Returns a transparent bitmap
        }

        return bitmap;
    }

    public static Bitmap getBitmapFromResource(Context context, String resourceName, BitmapFactory.Options options) {
        Resources resources = context.getResources();
        int resID = resources.getIdentifier(resourceName, "drawable", context.getPackageName());
        return BitmapFactory.decodeResource(resources, resID, options);
    }

    public static String createTempFile(Context context, Bitmap bitmap) {
        File tempFile = null;
        FileOutputStream outputStream = null;

        try {
            tempFile = File.createTempFile(LOG_TAG, ".png", context.getCacheDir());
            outputStream = new FileOutputStream(tempFile);
        } catch (IOException e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }

        if (tempFile == null) {
            return null;
        }

        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
        closeSnapshotOutputStream(outputStream);
        return Uri.fromFile(tempFile).toString();
    }

    public static String createBase64(Bitmap bitmap) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream);
        byte[] bitmapBytes = outputStream.toByteArray();
        closeSnapshotOutputStream(outputStream);
        String base64Prefix = "data:image/png;base64,";
        return base64Prefix + Base64.encodeToString(bitmapBytes, Base64.NO_WRAP);
    }

    public static Bitmap viewToBitmap(View v, int left, int top, int right, int bottom) {
        Bitmap bitmap = null;
        if (v != null) {
            int w = right - left;
            int h = bottom - top;
            if (w > 0 && h > 0) {
                bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
                bitmap.eraseColor(Color.TRANSPARENT);
                Canvas canvas = new Canvas(bitmap);
                v.draw(canvas);
            }
        }
        return bitmap;
    }

    private static void addImage(String imageURL, Bitmap bitmap) {
        mCache.put(imageURL, bitmap);
    }

    private static Bitmap getImage(String imageURL) {
        return mCache.get(imageURL);
    }

    private static void closeSnapshotOutputStream(OutputStream outputStream) {
        if (outputStream == null) {
            return;
        }
        try {
            outputStream.close();
        } catch (IOException e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }
}
