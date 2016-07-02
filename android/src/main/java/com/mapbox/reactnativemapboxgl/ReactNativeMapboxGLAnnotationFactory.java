package com.mapbox.reactnativemapboxgl;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.support.annotation.RequiresPermission;
import android.view.View;

import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.Polygon;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapView;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ReactNativeMapboxGLAnnotationFactory {

    static Drawable drawableFromDrawableName(View view, String drawableName) {
        Bitmap x;
        int resID = view.getResources().getIdentifier(drawableName, "drawable", view.getContext().getApplicationContext().getPackageName());
        x = BitmapFactory.decodeResource(view.getResources(), resID);
        return new BitmapDrawable(view.getResources(), x);
    }

    public static Drawable drawableFromUrl(View view, String url) throws IOException {
        Bitmap x;

        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.connect();
        InputStream input = connection.getInputStream();

        x = BitmapFactory.decodeStream(input);
        return new BitmapDrawable(view.getResources(), x);
    }

    public static MarkerOptions markerFromJS(ReadableMap annotation, View view) {
        MarkerOptions marker = new MarkerOptions();

        double latitude = annotation.getArray("coordinates").getDouble(0);
        double longitude = annotation.getArray("coordinates").getDouble(1);
        LatLng markerCenter = new LatLng(latitude, longitude);
        marker.position(markerCenter);

        if (annotation.hasKey("title")) {
            String title = annotation.getString("title");
            marker.title(title);
        }

        if (annotation.hasKey("subtitle")) {
            String subtitle = annotation.getString("subtitle");
            marker.snippet(subtitle);
        }

        if (annotation.hasKey("annotationImage")) {
            ReadableMap annotationImage = annotation.getMap("annotationImage");
            String annotationURL = annotationImage.getString("url");
            try {
                Drawable image;
                if (annotationURL.startsWith("image!")) {
                    image = drawableFromDrawableName(view, annotationURL.replace("image!", ""));
                } else {
                    image = drawableFromUrl(view, annotationURL);
                }

                IconFactory iconFactory = IconFactory.getInstance(view.getContext());
                Icon icon;
                if (annotationImage.hasKey("height") && annotationImage.hasKey("width")) {
                    float scale = view.getResources().getDisplayMetrics().density;
                    int height = Math.round((float)annotationImage.getInt("height") * scale);
                    int width = Math.round((float)annotationImage.getInt("width") * scale);
                    icon = iconFactory.fromDrawable(image, width, height);
                } else {
                    icon = iconFactory.fromDrawable(image);
                }

                marker.icon(icon);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return marker;
    }

    static PolylineOptions polylineFromJS(ReadableMap annotation) {
        PolylineOptions polyline = new PolylineOptions();

        int coordSize = annotation.getArray("coordinates").size();
        for (int p = 0; p < coordSize; p++) {
            double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
            double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
            polyline.add(new LatLng(latitude, longitude));
        }

        if (annotation.hasKey("alpha")) {
            double strokeAlpha = annotation.getDouble("alpha");
            polyline.alpha((float) strokeAlpha);
        }

        if (annotation.hasKey("strokeColor")) {
            int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
            polyline.color(strokeColor);
        }

        if (annotation.hasKey("strokeWidth")) {
            float strokeWidth = annotation.getInt("strokeWidth");
            polyline.width(strokeWidth);
        }

        return polyline;
    }

    static PolygonOptions polygonFromJS(ReadableMap annotation) {
        PolygonOptions polygon = new PolygonOptions();

        int coordSize = annotation.getArray("coordinates").size();
        for (int p = 0; p < coordSize; p++) {
            double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
            double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
            polygon.add(new LatLng(latitude, longitude));
        }

        if (annotation.hasKey("alpha")) {
            double fillAlpha = annotation.getDouble("alpha");
            polygon.alpha((float) fillAlpha);
        }

        if (annotation.hasKey("fillColor")) {
            int fillColor = Color.parseColor(annotation.getString("fillColor"));
            polygon.fillColor(fillColor);
        }

        if (annotation.hasKey("strokeColor")) {
            int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
            polygon.strokeColor(strokeColor);
        }

        return polygon;
    }
}
