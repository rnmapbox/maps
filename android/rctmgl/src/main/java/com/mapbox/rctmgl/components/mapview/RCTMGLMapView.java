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
import com.mapbox.mapboxsdk.log.Logger;

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
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;
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

import com.mapbox.rctmgl.impl.SymbolClickListenerImpl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import org.json.*;

import javax.annotation.Nullable;

import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.visibility;

/**
 * Created by nickitaliano on 8/18/17.
 */

@SuppressWarnings({ "MissingPermission" })
public class RCTMGLMapView extends MapView implements OnMapReadyCallback, MapboxMap.OnMapClickListener,
        MapboxMap.OnMapLongClickListener, MapView.OnCameraIsChangingListener, MapView.OnCameraDidChangeListener,
        MapView.OnDidFailLoadingMapListener, MapView.OnDidFinishLoadingMapListener,
        MapView.OnWillStartRenderingFrameListener, MapView.OnDidFinishRenderingFrameListener,
        MapView.OnWillStartRenderingMapListener, MapView.OnDidFinishRenderingMapListener,
        MapView.OnDidFinishLoadingStyleListener, MapView.OnStyleImageMissingListener {
    public static final String LOG_TAG = "RCTMGLMapView";

    private RCTMGLMapViewManager mManager;
    private Context mContext;
    private Handler mHandler;
    private LifecycleEventListener mLifeCycleListener;
    private boolean mPaused;
    private boolean mDestroyed;

    private RCTMGLCamera mCamera;
    private List<AbstractMapFeature> mFeatures;
    private List<AbstractMapFeature> mQueuedFeatures;
    private Map<String, RCTMGLPointAnnotation> mPointAnnotations;
    private Map<String, RCTSource> mSources;
    private List<RCTMGLImages> mImages;

    private CameraChangeTracker mCameraChangeTracker = new CameraChangeTracker();
    private List<Pair<Integer, ReadableArray>> mPreRenderMethods = new ArrayList<>();

    private MapboxMap mMap;

    private LocalizationPlugin mLocalizationPlugin;

    private String mStyleURL;

    private Integer mPreferredFramesPerSecond;
    private boolean mLocalizeLabels;
    private Boolean mScrollEnabled;
    private Boolean mPitchEnabled;
    private Boolean mRotateEnabled;
    private Boolean mAttributionEnabled;
    private Integer mAttributionGravity;
    private int[] mAttributionMargin;
    private Boolean mLogoEnabled;
    private Integer mLogoGravity;
    private int[] mLogoMargins;
    private Boolean mCompassEnabled;
    private ReadableMap mCompassViewMargins;
    private int mCompassViewPosition = -1;
    private Boolean mZoomEnabled;

    private SymbolManager symbolManager;

    private long mActiveMarkerID = -1;

    private ReadableArray mInsets;

    private HashSet<String> mHandledMapChangedEvents = null;

    private MarkerViewManager markerViewManager = null;
    private ViewGroup mOffscreenAnnotationViewContainer = null;

    private boolean mAnnotationClicked = false;

    private LocationComponentManager mLocationComponentManager = null;

    private @Nullable Integer mTintColor = null;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager, MapboxMapOptions options) {
        super(context, options);

        mContext = context;
        onCreate(null);
        onStart();
        onResume();
        getMapAsync(this);

        mManager = manager;

        mSources = new HashMap<>();
        mImages = new ArrayList<>();
        mPointAnnotations = new HashMap<>();
        mQueuedFeatures = new ArrayList<>();
        mFeatures = new ArrayList<>();

        mHandler = new Handler();

        setLifecycleListeners();

        addOnCameraIsChangingListener(this);
        addOnCameraDidChangeListener(this);
        addOnDidFailLoadingMapListener(this);
        addOnDidFinishLoadingMapListener(this);
        addOnStyleImageMissingListener(this);

        addOnWillStartRenderingFrameListener(this);
        addOnDidFinishRenderingFrameListener(this);
        addOnWillStartRenderingMapListener(this);
        addOnDidFinishRenderingMapListener(this);
        addOnDidFinishLoadingStyleListener(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        mPaused = false;
    }

    @Override
    public void onPause() {
        super.onPause();
        mPaused = true;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mDestroyed = true;
    }

    public void enqueuePreRenderMapMethod(Integer methodID, @Nullable ReadableArray args) {
        mPreRenderMethods.add(new Pair<>(methodID, args));
    }

    public void addFeature(View childView, int childPosition) {
        AbstractMapFeature feature = null;

        if (childView instanceof RCTSource) {
            RCTSource source = (RCTSource) childView;
            mSources.put(source.getID(), source);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLImages) {
            RCTMGLImages images = (RCTMGLImages) childView;
            mImages.add(images);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLLight) {
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLNativeUserLocation) {
            feature = (AbstractMapFeature) childView;
        }  else if (childView instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) childView;
            mPointAnnotations.put(annotation.getID(), annotation);
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLMarkerView) {
            RCTMGLMarkerView marker = (RCTMGLMarkerView) childView;
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTMGLCamera) {
            mCamera = (RCTMGLCamera) childView;
            feature = (AbstractMapFeature) childView;
        } else if (childView instanceof RCTLayer) {
            feature = (RCTLayer) childView;
        } else if (childView instanceof ViewGroup) {
            ViewGroup children = (ViewGroup) childView;

            for (int i = 0; i < children.getChildCount(); i++) {
                addFeature(children.getChildAt(i), childPosition);
            }
        }

        if (feature != null) {
            if (mQueuedFeatures == null) {
                feature.addToMap(this);
                mFeatures.add(childPosition, feature);
            } else {
                mQueuedFeatures.add(childPosition, feature);
            }
        }
    }

    public void removeFeature(int childPosition) {
        AbstractMapFeature feature = features().get(childPosition);

        if (feature == null) {
            return;
        }

        if (feature instanceof RCTSource) {
            RCTSource source = (RCTSource) feature;
            mSources.remove(source.getID());
        } else if (feature instanceof RCTMGLPointAnnotation) {
            RCTMGLPointAnnotation annotation = (RCTMGLPointAnnotation) feature;

            if (annotation.getMapboxID() == mActiveMarkerID) {
                mActiveMarkerID = -1;
            }

            mPointAnnotations.remove(annotation.getID());
        } else if (feature instanceof RCTMGLImages) {
            RCTMGLImages images = (RCTMGLImages) feature;
            mImages.remove(images);
        }

        feature.removeFromMap(this);
        features().remove(feature);
    }

    private List<AbstractMapFeature> features() {
        if (mQueuedFeatures != null && mQueuedFeatures.size() > 0) {
            return mQueuedFeatures;
        } else {
            return mFeatures;
        }
    }

    public int getFeatureCount() {
        return features().size();
    }

    public AbstractMapFeature getFeatureAt(int i) {
        return features().get(i);
    }

    public synchronized void dispose() {
        if (mDestroyed) {
            return;
        }

        if (!layerWaiters.isEmpty()) {
            layerWaiters.clear();
        }

        ReactContext reactContext = (ReactContext) mContext;
        reactContext.removeLifecycleEventListener(mLifeCycleListener);

        if (!mPaused) {
            onPause();
        }

        onStop();
        onDestroy();
    }

    public VisibleRegion getVisibleRegion(LatLng center, double zoomLevel) {
        DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();
        int[] contentPadding = mMap.getPadding();

        int mapWidth = (int) ((mMap.getWidth() * 0.75 - (contentPadding[0] + contentPadding[2]))
                / metrics.scaledDensity);
        int mapHeight = (int) ((mMap.getHeight() * 0.75 - (contentPadding[1] + contentPadding[3]))
                / metrics.scaledDensity);
        VisibleRegion region = GeoViewport.getRegion(center, (int) zoomLevel, mapWidth, mapHeight);
        return region;
    }

    public CameraPosition getCameraPosition() {
        return mMap.getCameraPosition();
    }

    public void animateCamera(CameraUpdate cameraUpdate, MapboxMap.CancelableCallback callback) {
        mMap.animateCamera(cameraUpdate, callback);
    }

    public void moveCamera(CameraUpdate cameraUpdate, MapboxMap.CancelableCallback callback) {
        mMap.moveCamera(cameraUpdate, callback);
    }

    public void moveCamera(CameraUpdate cameraUpdate) {
        mMap.moveCamera(cameraUpdate);
    }

    public void easeCamera(CameraUpdate cameraUpdate, int duration, boolean easingInterpolator, MapboxMap.CancelableCallback callback) {
        mMap.easeCamera(cameraUpdate, duration, easingInterpolator, callback);
    }

    public void easeCamera(CameraUpdate cameraUpdate) {
        mMap.easeCamera(cameraUpdate);
    }

    public RCTMGLPointAnnotation getPointAnnotationByID(String annotationID) {
        if (annotationID == null) {
            return null;
        }

        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);

            if (annotation != null && annotationID.equals(annotation.getID())) {
                return annotation;
            }
        }

        return null;
    }

    public RCTMGLPointAnnotation getPointAnnotationByMarkerID(long markerID) {
        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);

            if (annotation != null && markerID == annotation.getMapboxID()) {
                return annotation;
            }
        }

        return null;
    }

    public MapboxMap getMapboxMap() {
        return mMap;
    }

    public SymbolManager getSymbolManager() {
        return symbolManager;
    }

    public interface FoundLayerCallback {
        public void found(Layer layer);
    }

    private Map<String, List<FoundLayerCallback>> layerWaiters = new HashMap<String, List<FoundLayerCallback>>();

    public void layerAdded(Layer layer) {
        String layerId = layer.getId();

        List<FoundLayerCallback> callbacks = layerWaiters.get(layerId);
        if (callbacks != null) {
            for (FoundLayerCallback callback : callbacks) {
                callback.found(layer);
            }
        }
        layerWaiters.remove(layerId);
    }

    public void waitForLayer(String layerID, FoundLayerCallback callback) {
        Layer layer = mMap.getStyle().getLayer(layerID);
        if (layer != null) {
            callback.found(layer);
        } else {
            List<FoundLayerCallback> waiters = layerWaiters.get(layerID);
            if (waiters == null) {
                waiters = new ArrayList<FoundLayerCallback>();
                layerWaiters.put(layerID, waiters);
            }
            waiters.add(callback);
        }
    }

    public boolean isJSONValid(String test) {
        try {
            new JSONObject(test);
        } catch (JSONException ex) {
            return false;
        }
        return true;
    }


    @Override
    public void onMapReady(final MapboxMap mapboxMap) {
        mMap = mapboxMap;

        if (isJSONValid(mStyleURL)) {
            mMap.setStyle(new Style.Builder().fromJson(mStyleURL));
        } else {
            mMap.setStyle(new Style.Builder().fromUri(mStyleURL));
        }


        reflow();

        mMap.getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                createSymbolManager(style);
                setUpImage(style);
                addQueuedFeatures();
                setupLocalization(style);
            }
        });

        updatePreferredFramesPerSecond();
        updateInsets();
        updateUISettings();

        mMap.addOnCameraIdleListener(new MapboxMap.OnCameraIdleListener() {
            @Override
            public void onCameraIdle() {
                sendRegionDidChangeEvent();
            }
        });

        mMap.addOnCameraMoveStartedListener(new MapboxMap.OnCameraMoveStartedListener() {
            @Override
            public void onCameraMoveStarted(int reason) {
                mCameraChangeTracker.setReason(reason);
                handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE);
            }
        });

        mMap.addOnCameraMoveListener(new MapboxMap.OnCameraMoveListener() {
            @Override
            public void onCameraMove() {
                if (markerViewManager != null) {
                    markerViewManager.updateMarkers();
                }
            }
        });

        mMap.addOnMoveListener(new MapboxMap.OnMoveListener() {
            @Override
            public void onMoveBegin(MoveGestureDetector detector) {
                mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE);
                handleMapChangedEvent(EventTypes.REGION_WILL_CHANGE);
            }

            @Override
            public void onMove(MoveGestureDetector detector) {
                mCameraChangeTracker.setReason(CameraChangeTracker.USER_GESTURE);
                handleMapChangedEvent(EventTypes.REGION_IS_CHANGING);
            }

            @Override
            public void onMoveEnd(MoveGestureDetector detector) {}
        });
    }

    public void reflow() {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                measure(View.MeasureSpec.makeMeasureSpec(getMeasuredWidth(), View.MeasureSpec.EXACTLY),
                        View.MeasureSpec.makeMeasureSpec(getMeasuredHeight(), View.MeasureSpec.EXACTLY));
                layout(getLeft(), getTop(), getRight(), getBottom());
            }
        });
    }

    public void createSymbolManager(Style style) {
        symbolManager = new SymbolManager(this, mMap, style);
        symbolManager.setIconAllowOverlap(true);
        symbolManager.addClickListener(
            SymbolClickListenerImpl.annotationClickListener(new SymbolClickListenerImpl.Listener() {
                @Override
                public boolean onAnnotationClick(Symbol symbol) {
                    onMarkerClick(symbol); return true;
                }
            })
        );
        symbolManager.addDragListener(new OnSymbolDragListener() {
            @Override
            public void onAnnotationDragStarted(Symbol symbol) {
                mAnnotationClicked = true;
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDragStart();
                }
            }

            @Override
            public void onAnnotationDrag(Symbol symbol) {
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDrag();
                }
            }

            @Override
            public void onAnnotationDragFinished(Symbol symbol) {
                mAnnotationClicked = false;
                final long selectedMarkerID = symbol.getId();
                RCTMGLPointAnnotation annotation = getPointAnnotationByMarkerID(selectedMarkerID);
                if (annotation != null) {
                    annotation.onDragEnd();
                }
            }
        });
        mMap.addOnMapClickListener(this);
        mMap.addOnMapLongClickListener(this);
    }

    public void addQueuedFeatures() {
        if (mQueuedFeatures != null && mQueuedFeatures.size() > 0) {
            for (int i = 0; i < mQueuedFeatures.size(); i++) {
                AbstractMapFeature feature = mQueuedFeatures.get(i);
                feature.addToMap(this);
                mFeatures.add(feature);
            }
            mQueuedFeatures = null;
        }
    }

    private void setupLocalization(Style style) {
      mLocalizationPlugin = new LocalizationPlugin(RCTMGLMapView.this, mMap, style);
      if (mLocalizeLabels) {
          try {
              mLocalizationPlugin.matchMapLanguageWithDeviceDefault();
          } catch (Exception e) {
              final String localeString = Locale.getDefault().toString();
              Logger.w(LOG_TAG, String.format("Could not find matching locale for %s", localeString));
          }
      }
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        boolean result = super.onTouchEvent(ev);

        if (result && mScrollEnabled) {
            requestDisallowInterceptTouchEvent(true);
        }

        return result;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        if (!mPaused) {
            if (markerViewManager != null) {
                markerViewManager.removeViews();
            }
            super.onLayout(changed, left, top, right, bottom);
            if (markerViewManager != null) {
                markerViewManager.restoreViews();
            }
        }
    }

    @Override
    public boolean onMapClick(@NonNull LatLng point) {
        if (mAnnotationClicked) {
            mAnnotationClicked = false;
            return true;
        }

        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
        List<RCTSource> touchableSources = getAllTouchableSources();

        Map<String, List<Feature>> hits = new HashMap<>();
        List<RCTSource> hitTouchableSources = new ArrayList<>();
        for (RCTSource touchableSource : touchableSources) {
            Map<String, Double> hitbox = touchableSource.getTouchHitbox();
            if (hitbox == null) {
                continue;
            }

            float halfWidth = hitbox.get("width").floatValue() / 2.0f;
            float halfHeight = hitbox.get("height").floatValue() / 2.0f;

            RectF hitboxF = new RectF();
            hitboxF.set(screenPoint.x - halfWidth, screenPoint.y - halfHeight, screenPoint.x + halfWidth,
                    screenPoint.y + halfHeight);

            List<Feature> features = mMap.queryRenderedFeatures(hitboxF, touchableSource.getLayerIDs());
            if (features.size() > 0) {
                hits.put(touchableSource.getID(), features);
                hitTouchableSources.add(touchableSource);
            }
        }

        if (hits.size() > 0) {
            RCTSource source = getTouchableSourceWithHighestZIndex(hitTouchableSources);
            if (source != null && source.hasPressListener()) {
                source.onPress(new RCTSource.OnPressEvent(
                        hits.get(source.getID()),
                        point,
                        screenPoint
                        ));
                return true;
            }
        }

        MapClickEvent event = new MapClickEvent(this, point, screenPoint);
        mManager.handleEvent(event);
        return false;
    }

    @Override
    public boolean onMapLongClick(@NonNull LatLng point) {
        if (mAnnotationClicked) {
            mAnnotationClicked = false;
            return true;
        }
        PointF screenPoint = mMap.getProjection().toScreenLocation(point);
        MapClickEvent event = new MapClickEvent(this, point, screenPoint, EventTypes.MAP_LONG_CLICK);
        mManager.handleEvent(event);
        return false;
    }

    public void onMarkerClick(@NonNull Symbol symbol) {
        mAnnotationClicked = true;
        final long selectedMarkerID = symbol.getId();

        RCTMGLPointAnnotation activeAnnotation = null;
        RCTMGLPointAnnotation nextActiveAnnotation = null;

        for (String key : mPointAnnotations.keySet()) {
            RCTMGLPointAnnotation annotation = mPointAnnotations.get(key);
            final long curMarkerID = annotation.getMapboxID();
            if (mActiveMarkerID == curMarkerID) {
                activeAnnotation = annotation;
            }
            if (selectedMarkerID == curMarkerID && mActiveMarkerID != curMarkerID) {
                nextActiveAnnotation = annotation;
            }
        }

        if (activeAnnotation != null) {
            deselectAnnotation(activeAnnotation);
        }

        if (nextActiveAnnotation != null) {
            selectAnnotation(nextActiveAnnotation);
        }

    }

    public void selectAnnotation(RCTMGLPointAnnotation annotation) {
        mActiveMarkerID = annotation.getMapboxID();
        annotation.onSelect(true);
    }

    public void deselectAnnotation(RCTMGLPointAnnotation annotation) {
        mActiveMarkerID = -1;
        annotation.onDeselect();
    }

    @Override
    public void onCameraDidChange(boolean animated) {
        mCameraChangeTracker.setIsAnimating(animated);
    }

    @Override
    public void onCameraIsChanging() {
        handleMapChangedEvent(EventTypes.REGION_IS_CHANGING);
    }

    @Override
    public void onDidFailLoadingMap(String errorMessage) {
        handleMapChangedEvent(EventTypes.DID_FAIL_LOADING_MAP);
    }

    @Override
    public void onDidFinishLoadingMap() {
        handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_MAP);
    }

    @Override
    public void onWillStartRenderingFrame() {
        handleMapChangedEvent(EventTypes.WILL_START_RENDERING_FRAME);
    }

    @Override
    public void onDidFinishRenderingFrame(boolean fully) {
        if (fully) {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_FRAME_FULLY);
        } else {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_FRAME);
        }
    }

    @Override
    public void onWillStartRenderingMap() {
        handleMapChangedEvent(EventTypes.WILL_START_RENDERING_MAP);
    }

    @Override
    public void onDidFinishRenderingMap(boolean fully) {
        if (fully) {
            for (Pair<Integer, ReadableArray> preRenderMethod : mPreRenderMethods) {
                Integer methodID = preRenderMethod.first;
                ReadableArray args = preRenderMethod.second;
                mManager.receiveCommand(this, methodID, args);
            }
            mPreRenderMethods.clear();
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_MAP_FULLY);
        } else {
            handleMapChangedEvent(EventTypes.DID_FINISH_RENDERING_MAP);
        }
    }

    @Override
    public void onDidFinishLoadingStyle() {
        handleMapChangedEvent(EventTypes.DID_FINISH_LOADING_STYLE);
    }

    @Override
    public void onStyleImageMissing(@NonNull String id) {
        for (RCTMGLImages images : mImages) {
            if (images.addMissingImageToStyle(id, mMap)) {
                return;
            }
        }
        for (RCTMGLImages images : mImages) {
            images.sendImageMissingEvent(id, mMap);
        }
    }

    private float getDisplayDensity() {
        return mContext.getResources().getDisplayMetrics().density;
    }

    public void setReactStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            removeAllSourcesFromMap();

            if (isJSONValid(mStyleURL)) {
                mMap.setStyle(new Style.Builder().fromJson(mStyleURL), new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        addAllSourcesToMap();
                    }
                });
            } else {
                mMap.setStyle(styleURL, new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        addAllSourcesToMap();
                    }
                });
            }
        }
    }

    public void setReactPreferredFramesPerSecond(Integer preferredFramesPerSecond) {
        mPreferredFramesPerSecond = preferredFramesPerSecond;
        updatePreferredFramesPerSecond();
    }

    public void setReactContentInset(ReadableArray array) {
        mInsets = array;
        updateInsets();
    }

    public void setLocalizeLabels(boolean localizeLabels) {
        mLocalizeLabels = localizeLabels;
    }

    public void setReactZoomEnabled(boolean zoomEnabled) {
        mZoomEnabled = zoomEnabled;
        updateUISettings();
    }

    public void setReactScrollEnabled(boolean scrollEnabled) {
        mScrollEnabled = scrollEnabled;
        updateUISettings();
    }

    public void setReactPitchEnabled(boolean pitchEnabled) {
        mPitchEnabled = pitchEnabled;
        updateUISettings();
    }

    public void setReactRotateEnabled(boolean rotateEnabled) {
        mRotateEnabled = rotateEnabled;
        updateUISettings();
    }

    public void setReactLogoEnabled(boolean logoEnabled) {
        mLogoEnabled = logoEnabled;
        updateUISettings();
    }

    public void setReactLogoPosition(ReadableMap position) {
        if (position == null) {
            // reset from explicit to default
            if (mLogoGravity != null) {
                MapboxMapOptions defaultOptions = MapboxMapOptions.createFromAttributes(mContext);
                mLogoGravity = defaultOptions.getLogoGravity();
                mLogoMargins = Arrays.copyOf(defaultOptions.getLogoMargins(), 4);
                updateUISettings();
            }
            return;
        }

        mLogoGravity = Gravity.NO_GRAVITY;
        if (position.hasKey("left")) {
            mLogoGravity |= Gravity.START;
        }
        if (position.hasKey("right")) {
            mLogoGravity |= Gravity.END;
        }
        if (position.hasKey("top")) {
            mLogoGravity |= Gravity.TOP;
        }
        if (position.hasKey("bottom")) {
            mLogoGravity |= Gravity.BOTTOM;
        }
        float density = getDisplayDensity();
        mLogoMargins = new int[]{
            position.hasKey("left") ? (int) density * position.getInt("left") : 0,
            position.hasKey("top") ? (int) density * position.getInt("top") : 0,
            position.hasKey("right") ? (int) density * position.getInt("right") : 0,
            position.hasKey("bottom") ? (int) density * position.getInt("bottom") : 0
        };
        updateUISettings();
    }

    public void setReactCompassEnabled(boolean compassEnabled) {
        mCompassEnabled = compassEnabled;
        updateUISettings();
    }

    public void setReactCompassViewMargins(ReadableMap compassViewMargins) {
        mCompassViewMargins = compassViewMargins;
        updateUISettings();
    }

    public void setReactCompassViewPosition(int compassViewPosition) {
        mCompassViewPosition = compassViewPosition;
        updateUISettings();
    }

    public void setReactAttributionEnabled(boolean attributionEnabled) {
        mAttributionEnabled = attributionEnabled;
        updateUISettings();
    }

    public void setReactAttributionPosition(ReadableMap position) {
        if (position == null) {
            // reset from explicit to default
            if (mAttributionGravity != null) {
                MapboxMapOptions defaultOptions = MapboxMapOptions.createFromAttributes(mContext);
                mAttributionGravity = defaultOptions.getAttributionGravity();
                mAttributionMargin = Arrays.copyOf(defaultOptions.getAttributionMargins(), 4);
                updateUISettings();
            }
            return;
        }
        mAttributionGravity = Gravity.NO_GRAVITY;
        if (position.hasKey("left")) {
            mAttributionGravity |= Gravity.START;
        }
        if (position.hasKey("right")) {
            mAttributionGravity |= Gravity.END;
        }
        if (position.hasKey("top")) {
            mAttributionGravity |= Gravity.TOP;
        }
        if (position.hasKey("bottom")) {
            mAttributionGravity |= Gravity.BOTTOM;
        }
        float density = getDisplayDensity();
        mAttributionMargin = new int[]{
            position.hasKey("left") ? (int) density * position.getInt("left") : 0,
            position.hasKey("top") ? (int) density * position.getInt("top") : 0,
            position.hasKey("right") ? (int) density * position.getInt("right") : 0,
            position.hasKey("bottom") ? (int) density * position.getInt("bottom") : 0
        };
        updateUISettings();
    }

    public void queryRenderedFeaturesAtPoint(String callbackID, PointF point, Expression filter,
            List<String> layerIDs) {
        List<Feature> features = mMap.queryRenderedFeatures(point, filter,
                layerIDs.toArray(new String[layerIDs.size()]));

        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getZoom(String callbackID) {
        CameraPosition position = mMap.getCameraPosition();

        WritableMap payload = new WritableNativeMap();
        payload.putDouble("zoom", position.zoom);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void queryRenderedFeaturesInRect(String callbackID, RectF rect, Expression filter, List<String> layerIDs) {
        List<Feature> features = mMap.queryRenderedFeatures(rect, filter,
                layerIDs.toArray(new String[layerIDs.size()]));

        WritableMap payload = new WritableNativeMap();
        payload.putString("data", FeatureCollection.fromFeatures(features).toJson());

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getVisibleBounds(String callbackID) {
        VisibleRegion region = mMap.getProjection().getVisibleRegion();

        WritableMap payload = new WritableNativeMap();
        payload.putArray("visibleBounds", GeoJSONUtils.fromLatLngBounds(region.latLngBounds));

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getPointInView(String callbackID, LatLng mapCoordinate) {

        PointF pointInView = mMap.getProjection().toScreenLocation(mapCoordinate);
        float density = getDisplayDensity();
        pointInView.x /= density;
        pointInView.y /= density;
        WritableMap payload = new WritableNativeMap();

        WritableArray array = new WritableNativeArray();
        array.pushDouble(pointInView.x);
        array.pushDouble(pointInView.y);
        payload.putArray("pointInView", array);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void getCoordinateFromView(String callbackID, PointF pointInView) {
        float density = getDisplayDensity();
        pointInView.x *= density;
        pointInView.y *= density;

        LatLng mapCoordinate = mMap.getProjection().fromScreenLocation(pointInView);
        WritableMap payload = new WritableNativeMap();

        WritableArray array = new WritableNativeArray();
        array.pushDouble(mapCoordinate.getLongitude());
        array.pushDouble(mapCoordinate.getLatitude());
        payload.putArray("coordinateFromView", array);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void takeSnap(final String callbackID, final boolean writeToDisk) {

        if (mMap == null) {
            throw new Error("takeSnap should only be called after the map has rendered");
        }

        mMap.snapshot(new MapboxMap.SnapshotReadyCallback() {
            @Override
            public void onSnapshotReady(Bitmap snapshot) {
                WritableMap payload = new WritableNativeMap();
                String uri = writeToDisk ? BitmapUtils.createTempFile(mContext, snapshot)
                        : BitmapUtils.createBase64(snapshot);
                payload.putString("uri", uri);

                AndroidCallbackEvent event = new AndroidCallbackEvent(RCTMGLMapView.this, callbackID, payload);
                mManager.handleEvent(event);
            }
        });
    }

    public void getCenter(String callbackID) {
        LatLng center = mMap.getCameraPosition().target;

        WritableArray array = new WritableNativeArray();
        array.pushDouble(center.getLongitude());
        array.pushDouble(center.getLatitude());
        WritableMap payload = new WritableNativeMap();
        payload.putArray("center", array);

        AndroidCallbackEvent event = new AndroidCallbackEvent(this, callbackID, payload);
        mManager.handleEvent(event);
    }

    public void showAttribution() {
        AttributionDialogManager manager = new AttributionDialogManager(mContext, mMap);
        manager.onClick(this);
    }

    public void setSourceVisibility(final boolean visible, @NonNull final String sourceId, @Nullable final String sourceLayerId) {
        if (mMap == null) {
            return;
        }
        mMap.getStyle(new Style.OnStyleLoaded() {
            @Override
            public void onStyleLoaded(@NonNull Style style) {
                List<Layer> layers = style.getLayers();
                for (Layer layer : layers) {
                    LayerSourceInfo layerSourceInfo = new LayerSourceInfo(layer);
                    if (layerSourceInfo.sourceId.equals(sourceId) && (sourceLayerId == null
                            || sourceLayerId.equals(layerSourceInfo.sourceLayerId))) {
                        layer.setProperties(visibility(visible ? Property.VISIBLE : Property.NONE));
                    }
                }
            }
        });
    }

    public void init() {
        // Required for rendering properly in Android Oreo
        getViewTreeObserver().dispatchOnGlobalLayout();
    }

    public boolean isDestroyed() {
        return mDestroyed;
    }

    public void getStyle(Style.OnStyleLoaded onStyleLoaded) {
        if (mMap == null) {
            return;
        }

        mMap.getStyle(onStyleLoaded);
    }

    private void updateUISettings() {
        if (mMap == null) {
            return;
        }

        UiSettings uiSettings = mMap.getUiSettings();

        if (mScrollEnabled != null && uiSettings.isScrollGesturesEnabled() != mScrollEnabled) {
            uiSettings.setScrollGesturesEnabled(mScrollEnabled);
            if (!mScrollEnabled) {
                mMap.getGesturesManager().getMoveGestureDetector().interrupt();
            }
        }

        if (mPitchEnabled != null && uiSettings.isTiltGesturesEnabled() != mPitchEnabled) {
            uiSettings.setTiltGesturesEnabled(mPitchEnabled);
        }

        if (mRotateEnabled != null && uiSettings.isRotateGesturesEnabled() != mRotateEnabled) {
            uiSettings.setRotateGesturesEnabled(mRotateEnabled);
            if (!mRotateEnabled) {
                mMap.getGesturesManager().getRotateGestureDetector().interrupt();
            }
        }

        if (mAttributionEnabled != null && uiSettings.isAttributionEnabled() != mAttributionEnabled) {
            uiSettings.setAttributionEnabled(mAttributionEnabled);
        }

        if (mAttributionGravity != null && uiSettings.getAttributionGravity() != mAttributionGravity) {
            uiSettings.setAttributionGravity(mAttributionGravity);
        }

        if (mAttributionMargin != null &&
                (uiSettings.getAttributionMarginLeft() != mAttributionMargin[0] ||
                        uiSettings.getAttributionMarginTop() != mAttributionMargin[1] ||
                        uiSettings.getAttributionMarginRight() != mAttributionMargin[2] ||
                        uiSettings.getAttributionMarginBottom() != mAttributionMargin[3]
                )
        ) {
            uiSettings.setAttributionMargins(
                mAttributionMargin[0],
                mAttributionMargin[1],
                mAttributionMargin[2],
                mAttributionMargin[3]
            );
        }

        if (mTintColor != null) {
            uiSettings.setAttributionTintColor(mTintColor);
        }

        if (mLogoEnabled != null && uiSettings.isLogoEnabled() != mLogoEnabled) {
            uiSettings.setLogoEnabled(mLogoEnabled);
        }

        if (mLogoGravity != null && uiSettings.getLogoGravity() != mLogoGravity) {
            uiSettings.setLogoGravity(mLogoGravity);
        }

        if (mLogoMargins != null &&
            (uiSettings.getLogoMarginLeft() != mLogoMargins[0] ||
                uiSettings.getLogoMarginTop() != mLogoMargins[1] ||
                uiSettings.getLogoMarginRight() != mLogoMargins[2] ||
                uiSettings.getLogoMarginBottom() != mLogoMargins[3]
            )
        ) {
            uiSettings.setLogoMargins(
                mLogoMargins[0],
                mLogoMargins[1],
                mLogoMargins[2],
                mLogoMargins[3]
            );
        }

        if (mCompassEnabled != null && uiSettings.isCompassEnabled() != mCompassEnabled) {
            uiSettings.setCompassEnabled(mCompassEnabled);
        }

        if (mCompassViewPosition != -1 && uiSettings.isCompassEnabled()) {
            switch (mCompassViewPosition) {
                case 0:
                    uiSettings.setCompassGravity(Gravity.TOP | Gravity.START);
                    break;
                case 1:
                    uiSettings.setCompassGravity(Gravity.TOP | Gravity.END);
                    break;
                case 2:
                    uiSettings.setCompassGravity(Gravity.BOTTOM | Gravity.START);
                    break;
                case 3:
                    uiSettings.setCompassGravity(Gravity.BOTTOM | Gravity.END);
                    break;
            }
        }

        if (mCompassViewMargins != null && uiSettings.isCompassEnabled()) {
            int pixelDensity = (int)getResources().getDisplayMetrics().density;

            int x = mCompassViewMargins.getInt("x") * pixelDensity;
            int y = mCompassViewMargins.getInt("y") * pixelDensity;

            switch (uiSettings.getCompassGravity()) {
                case Gravity.TOP | Gravity.START:
                    uiSettings.setCompassMargins(x, y, 0, 0);
                    break;
                default:
                case Gravity.TOP | Gravity.END:
                    uiSettings.setCompassMargins(0, y, x, 0);
                    break;
                case Gravity.BOTTOM | Gravity.START:
                    uiSettings.setCompassMargins(x, 0, 0, y);
                    break;
                case Gravity.BOTTOM | Gravity.END:
                    uiSettings.setCompassMargins(0, 0, x, y);
                    break;
            }
        }

        if (mZoomEnabled != null && uiSettings.isZoomGesturesEnabled() != mZoomEnabled) {
            uiSettings.setZoomGesturesEnabled(mZoomEnabled);
            if (!mZoomEnabled) {
                mMap.getGesturesManager().getStandardScaleGestureDetector().interrupt();
            }
        }
    }

    private void updatePreferredFramesPerSecond() {
        if (mPreferredFramesPerSecond == null) {
            return;
        }
        setMaximumFps(mPreferredFramesPerSecond);
    }

    public double[] getContentInset() {
        if (mInsets == null) {
            double[] result = {0,0,0,0};

            return result;
        }
        double top = 0, right = 0, bottom = 0, left = 0;

        if (mInsets.size() == 4) {
            top = mInsets.getInt(0);
            right = mInsets.getInt(1);
            bottom = mInsets.getInt(2);
            left = mInsets.getInt(3);
        } else if (mInsets.size() == 2) {
            top = mInsets.getInt(0);
            right = mInsets.getInt(1);
            bottom = top;
            left = right;
        } else if (mInsets.size() == 1) {
            top = mInsets.getInt(0);
            right = top;
            bottom = top;
            left = top;
        }

        final DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();

        double[] result = {left * metrics.scaledDensity, top * metrics.scaledDensity, right * metrics.scaledDensity, bottom * metrics.scaledDensity};
        return result;
    }

    private void updateInsets() {
        if (mMap == null || mInsets == null) {
            return;
        }

        double padding[] = getContentInset();
        double top = padding[1], right = padding[2], bottom = padding[3], left = padding[0];

        mMap.setPadding(Double.valueOf(left).intValue(),
                Double.valueOf(top).intValue(),
                Double.valueOf(right).intValue(),
                Double.valueOf(bottom).intValue());
    }

    private void setLifecycleListeners() {
        final ReactContext reactContext = (ReactContext) mContext;

        mLifeCycleListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                onResume();
            }

            @Override
            public void onHostPause() {
                onPause();
            }

            @Override
            public void onHostDestroy() {
                dispose();
            }
        };

        reactContext.addLifecycleEventListener(mLifeCycleListener);
    }

    private WritableMap makeRegionPayload(Boolean isAnimated) {
        CameraPosition position = mMap.getCameraPosition();
        if(position == null || position.target == null) {
            return new WritableNativeMap();
        }
        LatLng latLng = new LatLng(position.target.getLatitude(), position.target.getLongitude());

        WritableMap properties = new WritableNativeMap();

        properties.putDouble("zoomLevel", position.zoom);
        properties.putDouble("heading", position.bearing);
        properties.putDouble("pitch", position.tilt);
        properties.putBoolean("animated",
                (null == isAnimated) ? mCameraChangeTracker.isAnimated() : isAnimated.booleanValue());
        properties.putBoolean("isUserInteraction", mCameraChangeTracker.isUserInteraction());

        try {
            VisibleRegion visibleRegion = mMap.getProjection().getVisibleRegion();
            properties.putArray("visibleBounds", GeoJSONUtils.fromLatLngBounds(visibleRegion.latLngBounds));
        } catch(Exception ex) {
            Logger.e(LOG_TAG, String.format("An error occurred while attempting to make the region: %s", ex.getMessage()));
        }

        return GeoJSONUtils.toPointFeature(latLng, properties);
    }

    public void sendRegionChangeEvent(boolean isAnimated) {
        IEvent event = new MapChangeEvent(this, EventTypes.REGION_DID_CHANGE,
                makeRegionPayload(new Boolean(isAnimated)));

                mManager.handleEvent(event);
        mCameraChangeTracker.setReason(CameraChangeTracker.EMPTY);
    }

    private void removeAllSourcesFromMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.removeFromMap(this);
        }
    }

    private void addAllSourcesToMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.addToMap(this);
        }
    }

    private List<RCTSource> getAllTouchableSources() {
        List<RCTSource> sources = new ArrayList<>();

        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            if (source != null && source.hasPressListener()) {
                sources.add(source);
            }
        }

        return sources;
    }

    private List<RCTMGLShapeSource> getAllShapeSources() {
        List<RCTMGLShapeSource> shapeSources = new ArrayList<>();

        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);

            if (source instanceof RCTMGLShapeSource) {
                shapeSources.add((RCTMGLShapeSource) source);
            }
        }

        return shapeSources;
    }

    private RCTSource getTouchableSourceWithHighestZIndex(List<RCTSource> sources) {
        if (sources == null || sources.size() == 0) {
            return null;
        }

        if (sources.size() == 1) {
            return sources.get(0);
        }

        Map<String, RCTSource> layerToSourceMap = new HashMap<>();
        for (RCTSource source : sources) {
            String[] layerIDs = source.getLayerIDs();

            for (String layerID : layerIDs) {
                layerToSourceMap.put(layerID, source);
            }
        }

        List<Layer> mapboxLayers = mMap.getStyle().getLayers();
        for (int i = mapboxLayers.size() - 1; i >= 0; i--) {
            Layer mapboxLayer = mapboxLayers.get(i);

            String layerID = mapboxLayer.getId();
            if (layerToSourceMap.containsKey(layerID)) {
                return layerToSourceMap.get(layerID);
            }
        }

        return null;
    }

    private boolean hasSetCenterCoordinate() {
        CameraPosition cameraPosition = mMap.getCameraPosition();
        LatLng center = cameraPosition.target;
        return center.getLatitude() != 0.0 && center.getLongitude() != 0.0;
    }

    private double getMapRotation() {
        CameraPosition cameraPosition = mMap.getCameraPosition();
        return cameraPosition.bearing;
    }

    public void sendRegionDidChangeEvent() {

        handleMapChangedEvent(EventTypes.REGION_DID_CHANGE);
        mCameraChangeTracker.setReason(mCameraChangeTracker.EMPTY);
    }

    private void handleMapChangedEvent(String eventType) {
        if (!canHandleEvent(eventType))
            return;

        IEvent event;

        switch (eventType) {
            case EventTypes.REGION_WILL_CHANGE:
            case EventTypes.REGION_DID_CHANGE:
            case EventTypes.REGION_IS_CHANGING:
                event = new MapChangeEvent(this, eventType, makeRegionPayload(null));
                break;
            default:
                event = new MapChangeEvent(this, eventType);
        }

        mManager.handleEvent(event);
    }

    private boolean canHandleEvent(String event) {
        return mHandledMapChangedEvents == null || mHandledMapChangedEvents.contains(event);
    }

    public void setHandledMapChangedEvents(ArrayList<String> eventsWhiteList) {
        this.mHandledMapChangedEvents = new HashSet<>(eventsWhiteList);
    }

    private void sendUserLocationUpdateEvent(Location location) {
        if (location == null) {
            return;
        }
        IEvent event = new MapChangeEvent(this, EventTypes.USER_LOCATION_UPDATED, makeLocationChangePayload(location));
        mManager.handleEvent(event);
    }

    private WritableMap makeLocationChangePayload(Location location) {

        WritableMap positionProperties = new WritableNativeMap();
        WritableMap coords = new WritableNativeMap();

        coords.putDouble("longitude", location.getLongitude());
        coords.putDouble("latitude", location.getLatitude());
        coords.putDouble("altitude", location.getAltitude());
        coords.putDouble("accuracy", location.getAccuracy());
        // A better solution will be to pull the heading from the compass engine,
        // unfortunately the api is not publicly available in the mapbox sdk
        coords.putDouble("heading", location.getBearing());
        coords.putDouble("course", location.getBearing());
        coords.putDouble("speed", location.getSpeed());

        positionProperties.putMap("coords", coords);
        positionProperties.putDouble("timestamp", location.getTime());
        return positionProperties;
    }

    /**
    * Adds the marker image to the map for use as a SymbolLayer icon
    */
    private void setUpImage(@NonNull Style loadedStyle) {
        loadedStyle.addImage("MARKER_IMAGE_ID", BitmapFactory.decodeResource(
            this.getResources(), R.drawable.red_marker)
        );
    }

    /**
     * PointAnnotations are rendered to a canvas, but react native Image component is
     * implemented on top of Fresco, and fresco will not load images when their view is
     * not attached to the window. So we'll have an offscreen view where we add those views
     * so they can rendered full to canvas.
     */
    public ViewGroup offscreenAnnotationViewContainer() {
        if (mOffscreenAnnotationViewContainer == null) {
            mOffscreenAnnotationViewContainer = new FrameLayout(getContext());
            FrameLayout.LayoutParams flParams = new FrameLayout.LayoutParams(0,0);
            flParams.setMargins(-10000, -10000, -10000,-10000);
            mOffscreenAnnotationViewContainer.setLayoutParams(flParams);
            addView(mOffscreenAnnotationViewContainer);
        }
        return mOffscreenAnnotationViewContainer;
    }

    public MarkerViewManager getMarkerViewManager(MapboxMap map) {
        if (markerViewManager == null) {
            if (map == null) {
                throw new Error("makerViewManager should be called one the map has loaded");
            }
            markerViewManager = new MarkerViewManager(this, map);
        }
        return markerViewManager;
    }

    public LocationComponentManager getLocationComponentManager() {
        if (mLocationComponentManager == null) {
            mLocationComponentManager = new LocationComponentManager(this, mContext);
        }
        return mLocationComponentManager;
    }

    public @Nullable Integer getTintColor() {
        return mTintColor;
    }

    public void setTintColor(@Nullable Integer tintColor) {
        if (mTintColor == tintColor) return;
        mTintColor = tintColor;
        updateUISettings();
        if (mLocationComponentManager == null) return;
        mLocationComponentManager.update(getMapboxMap().getStyle());
    }
}
