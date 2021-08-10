package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PointF;
import android.graphics.RectF;
import android.location.Location;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.annotation.UiThread;

import android.util.DisplayMetrics;
import android.util.Pair;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
// import com.mapbox.mapboxsdk.log.Logger;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.android.gestures.MoveGestureDetector;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
/*
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.maps.AttributionDialogManager;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.localization.LocalizationPlugin;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolClickListener;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolDragListener;
import com.mapbox.mapboxsdk.plugins.annotation.Symbol;
import com.mapbox.mapboxsdk.plugins.annotation.SymbolManager;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;

 */
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;
/*
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerViewManager;
import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.images.RCTMGLImages;
import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocation;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
import com.mapbox.rctmgl.components.styles.sources.RCTSource;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.MapClickEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.GeoViewport;

 */

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import org.json.*;

import javax.annotation.Nullable;

import com.mapbox.maps.MapView;

// import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.visibility;

public class RCTMGLMapView extends MapView  {
    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager/*, MapboxMapOptions options*/) {
        super(context);
    }

    public void init() {
    }

    public void addFeature(View childView, int childPosition) {

    }

    public int getFeatureCount() {
        return 0;
    }

    public View getFeatureAt(int index) {
        return null;
    }

    public void removeFeature(int index) {
    }
}