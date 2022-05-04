package com.mapbox.rctmgl.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.DisplayMetrics;
import android.util.Log;

import com.facebook.common.logging.FLog;
import com.facebook.common.references.CloseableReference;
import com.facebook.datasource.DataSource;
import com.facebook.datasource.DataSources;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.common.RotationOptions;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.image.CloseableStaticBitmap;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.facebook.react.views.imagehelper.ImageSource;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.Style;

import java.io.File;
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
    public static final String LOG_TAG = "DownloadMapImageTask";

    private WeakReference<Context> mContext;
    private WeakReference<MapboxMap> mMap;
    @Nullable
    private OnAllImagesLoaded mCallback;
    private final Object mCallerContext;

    public DownloadMapImageTask(Context context, MapboxMap map, @Nullable OnAllImagesLoaded callback) {
        mContext = new WeakReference<>(context.getApplicationContext());
        mMap = new WeakReference<>(map);
        mCallback = callback;
        mCallerContext = this;
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

            if (uri.startsWith("/")) {
                uri = Uri.fromFile(new File(uri)).toString();
            }

            if (uri.startsWith("http://") || uri.startsWith("https://") ||
                uri.startsWith("file://") || uri.startsWith("asset://") || uri.startsWith("data:")) {
                ImageSource source = new ImageSource(context, uri);
                ImageRequest request = ImageRequestBuilder.newBuilderWithSource(source.getUri())
                    .setRotationOptions(RotationOptions.autoRotate())
                    .build();

                DataSource<CloseableReference<CloseableImage>> dataSource =
                    Fresco.getImagePipeline().fetchDecodedImage(request, mCallerContext);

                CloseableReference<CloseableImage> result = null;
                try {
                    result = DataSources.waitForFinalResult(dataSource);
                    if (result != null) {
                        CloseableImage image = result.get();
                        if (image instanceof CloseableStaticBitmap) {
                            CloseableStaticBitmap closeableStaticBitmap = (CloseableStaticBitmap) image;
                            Bitmap bitmap = closeableStaticBitmap.getUnderlyingBitmap()
                                // Copy the bitmap to make sure it doesn't get recycled when we release
                                // the fresco reference.
                                .copy(Bitmap.Config.ARGB_8888, true);
                            bitmap.setDensity((int) ((double) DisplayMetrics.DENSITY_DEFAULT * imageEntry.getScaleOr(1.0)));
                            images.add(new AbstractMap.SimpleEntry<>(object.getKey(), bitmap));
                        } else {
                            FLog.e(LOG_TAG, "Failed to load bitmap from: " + uri);
                        }
                    } else {
                        FLog.e(LOG_TAG, "Failed to load bitmap from: " + uri);
                    }
                } catch (Throwable e) {
                    Log.w(LOG_TAG, e.getLocalizedMessage());
                } finally {
                    dataSource.close();
                    if (result != null) {
                        CloseableReference.closeSafely(result);
                    }
                }
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
        if (scale != ImageEntry.defaultScale) {
            options.inDensity = (int) ((double) DisplayMetrics.DENSITY_DEFAULT * scale);
        }
        return options;
    }
}
