package com.mapbox.rctmgl.utils;

import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;

import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.lang.ref.WeakReference;
import java.util.AbstractMap;
import java.util.Map;

public class Sprite {
    public static final String LOG_TAG = Sprite.class.getSimpleName();
    private String name;
    private String url;

    public Sprite(String name, String url) {
        this.name = name;
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
    }

    public void load(Context context, MapboxMap map) {
        double scale =  context.getResources().getDisplayMetrics().density;
        ImageEntry imageEntry = new ImageEntry(url, scale);
        Map.Entry[] images = new Map.Entry[]{ new AbstractMap.SimpleEntry<String, ImageEntry>(name, imageEntry) };
        final WeakReference<MapboxMap> weakMap = new WeakReference<>(map);
        DownloadMapImageTask task = new DownloadMapImageTask(context, map, new DownloadMapImageTask.OnAllImagesLoaded() {
            @Override
            public void onAllImagesLoaded() {
                if (weakMap.get() != null && weakMap.get().getStyle() == null) {
                    Log.w(LOG_TAG,"Tried to load extra sprite " + getName() +" before style loaded");
                }
            }
        });
        task.execute(images);
    }
}