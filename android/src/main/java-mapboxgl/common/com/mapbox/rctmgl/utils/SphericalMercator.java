package com.mapbox.rctmgl.utils;

import android.graphics.Point;
import android.graphics.PointF;

import com.mapbox.mapboxsdk.geometry.LatLng;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 1/4/18.
 * Ported from https://github.com/mapbox/sphericalmercator/blob/master/sphericalmercator.js
 * This port only assumes we will have 512 vector tile sizes
 */

public class SphericalMercator {
    public static final double D2R = Math.PI / 180;
    public static final double R2D = 180 / Math.PI;

    private static Map<String, List<Double>> cache;

    public SphericalMercator() {
        int tileSize = 512;

        if (cache == null) {
            cache = new HashMap<>();
            cache.put("Bc", new ArrayList<Double>());
            cache.put("Cc", new ArrayList<Double>());
            cache.put("zc", new ArrayList<Double>());
            cache.put("Ac", new ArrayList<Double>());

            double size = (double) tileSize;
            for (int d = 0; d < 30; d++) {
                cache.get("Bc").add(size / 360);
                cache.get("Cc").add(size / (2 * Math.PI));
                cache.get("zc").add(size / 2);
                cache.get("Ac").add(size);
                size *= 2;
            }
        }
    }

    public PointF getPX(LatLng latLng, int zoomLevel) {
        double d = cache.get("zc").get(zoomLevel);
        double f = Math.min(Math.max(Math.sin(D2R * latLng.getLatitude()), -0.9999), 0.9999);
        double x = Math.round(d + latLng.getLongitude() * cache.get("Bc").get(zoomLevel));
        double y = Math.round(d + 0.5 * Math.log((1 + f) / (1 - f)) * (-cache.get("Cc").get(zoomLevel)));

        if (x > cache.get("Ac").get(zoomLevel)) {
            x = cache.get("Ac").get(zoomLevel);
        }

        if (y > cache.get("Ac").get(zoomLevel)) {
            y = cache.get("Ac").get(zoomLevel);
        }

        return new PointF((float) x, (float) y);
    }

    public LatLng getLatLng(PointF px, int zoomLevel) {
        double g = ((double)px.y - cache.get("zc").get(zoomLevel)) / (-cache.get("Cc").get(zoomLevel));
        double lon = ((double) px.x - cache.get("zc").get(zoomLevel)) / cache.get("Bc").get(zoomLevel);
        double lat = R2D * (2 * Math.atan(Math.exp(g)) - 0.5 * Math.PI);
        return new LatLng(lat, lon);
    }
}
