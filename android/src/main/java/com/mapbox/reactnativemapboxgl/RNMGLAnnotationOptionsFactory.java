package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;
import com.mapbox.mapboxsdk.annotations.Annotation;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapboxMap;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

class RNMGLMarkerOptions implements RNMGLAnnotationOptions {
    protected MarkerOptions _options;

    public RNMGLMarkerOptions(MarkerOptions options) {
        _options = options;
    }

    @Override
    public Annotation addToMap(MapboxMap map) {
        return map.addMarker(_options);
    }
}

class RNMGLPolylineOptions implements RNMGLAnnotationOptions {
    protected PolylineOptions _options;

    public RNMGLPolylineOptions(PolylineOptions options) {
        _options = options;
    }

    @Override
    public Annotation addToMap(MapboxMap map) {
        return map.addPolyline(_options);
    }
}

class RNMGLPolygonOptions implements RNMGLAnnotationOptions {
    protected PolygonOptions _options;

    public RNMGLPolygonOptions(PolygonOptions options) {
        _options = options;
    }

    @Override
    public Annotation addToMap(MapboxMap map) {
        return map.addPolygon(_options);
    }
}

public class RNMGLAnnotationOptionsFactory {

    public static RNMGLAnnotationOptions annotationOptionsFromJS(ReadableMap annotation, Context context) {
        String type = annotation.getString("type");

        if (type.equals("point")) {
            return markerOptionsFromJS(annotation, context);
        } else if (type.equals("polyline")) {
            return polylineOptionsFromJS(annotation);
        } else if (type.equals("polygon")) {
            return polygonOptionsFromJS(annotation);
        }

        return null;
    }

    static Drawable drawableFromDrawableName(Context context, String drawableName) {
        int resID = context.getResources().getIdentifier(drawableName, "drawable", context.getApplicationContext().getPackageName());
        return ContextCompat.getDrawable(context, resID);
    }

    static Drawable drawableFromUrl(Context context, String url) throws IOException {
        // This doesn't currently work, as it throws NetworkOnMainThreadException
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.connect();
        InputStream input = connection.getInputStream();

        Bitmap bitmap = BitmapFactory.decodeStream(input);
        return new BitmapDrawable(context.getResources(), bitmap);
    }

    static Map<String, Icon> iconCache = new HashMap();

    static Icon iconFromSourceAndSize(Context context, ReadableMap source, int width, int height) throws IOException {
        String path = source.getString("uri");
        String cacheKey = path + "||" + width + "||" + height;
        Icon icon = iconCache.get(cacheKey);
        if (icon != null) { return icon; }

        Drawable drawable;
        try {
            drawable = drawableFromUrl(context, path);
        } catch (MalformedURLException ex) {
            drawable = drawableFromDrawableName(context, path);
        }

        IconFactory iconFactory = IconFactory.getInstance(context);

        int intrinsicWidth = drawable.getIntrinsicWidth();
        int intrinsicHeight = drawable.getIntrinsicHeight();

        if (width < 0) { width = intrinsicWidth; }
        if (height < 0) { height = intrinsicHeight; }

        // Check if a rescale would be superfluous
        if ((drawable instanceof BitmapDrawable) && width == intrinsicWidth && height == intrinsicHeight) {
            icon = iconFactory.fromBitmap(((BitmapDrawable)drawable).getBitmap());
        } else {
            icon = iconFactory.fromDrawable(drawable, width, height);
        }

        iconCache.put(cacheKey, icon);
        return icon;
    }

    static RNMGLAnnotationOptions markerOptionsFromJS(ReadableMap annotation, Context context) {
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
            ReadableMap annotationSource = annotationImage.getMap("source");
            try {
                int width = -1;
                int height = -1;

                if (annotationImage.hasKey("height") && annotationImage.hasKey("width")) {
                    float scale = context.getResources().getDisplayMetrics().density;
                    height = Math.round((float)annotationImage.getInt("height") * scale);
                    width = Math.round((float)annotationImage.getInt("width") * scale);
                }

                marker.icon(iconFromSourceAndSize(context, annotationSource, width, height));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return new RNMGLMarkerOptions(marker);
    }

    static RNMGLAnnotationOptions polylineOptionsFromJS(ReadableMap annotation) {
        PolylineOptions polyline = new PolylineOptions();

        ReadableArray coordinates = annotation.getArray("coordinates");
        int coordinatesSize = coordinates.size();
        if (coordinatesSize > 0) {
            LatLng[] points = new LatLng[coordinatesSize];
            ReadableArray coordinate;
            for (int p = 0; p < coordinatesSize; p++) {
                coordinate = coordinates.getArray(p);
                points[p] = new LatLng(
                    coordinate.getDouble(0),
                    coordinate.getDouble(1)
                );
            }
            polyline.add(points);
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

        return new RNMGLPolylineOptions(polyline);
    }

    static RNMGLAnnotationOptions polygonOptionsFromJS(ReadableMap annotation) {
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

        return new RNMGLPolygonOptions(polygon);
    }
}
