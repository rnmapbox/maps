package com.mapbox.rctmgl;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.mapbox.rctmgl.components.camera.RCTMGLCameraManager;

/*
import com.mapbox.rctmgl.components.annotation.RCTMGLCalloutManager;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotationManager;
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerViewManager;
import com.mapbox.rctmgl.components.images.RCTMGLImagesManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocationManager;
*/
import com.mapbox.rctmgl.components.mapview.RCTMGLMapViewManager;
import com.mapbox.rctmgl.components.mapview.RCTMGLAndroidTextureMapViewManager;
/*
import com.mapbox.rctmgl.components.styles.layers.RCTMGLBackgroundLayerManager;
*/
import com.mapbox.rctmgl.components.styles.layers.RCTMGLCircleLayerManager;
/*
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillExtrusionLayerManager;
*/
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillLayerManager;
/*
import com.mapbox.rctmgl.components.styles.layers.RCTMGLHeatmapLayerManager;
*/
import com.mapbox.rctmgl.components.styles.layers.RCTMGLLineLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLRasterLayerManager;
/*
import com.mapbox.rctmgl.components.styles.layers.RCTMGLSymbolLayerManager;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLightManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLImageSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLRasterSourceManager;
*/
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLVectorSourceManager;
/*
import com.mapbox.rctmgl.modules.RCTMGLLogging;
import com.mapbox.rctmgl.modules.RCTMGLOfflineModule;
import com.mapbox.rctmgl.modules.RCTMGLSnapshotModule;
*/
import com.mapbox.rctmgl.modules.RCTMGLLocationModule;

import com.mapbox.rctmgl.modules.RCTMGLModule;


public class RCTMGLPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new RCTMGLModule(reactApplicationContext));
        modules.add(new RCTMGLLocationModule(reactApplicationContext));
/*
        modules.add(new RCTMGLOfflineModule(reactApplicationContext));
        modules.add(new RCTMGLSnapshotModule(reactApplicationContext));
        
        modules.add(new RCTMGLLogging(reactApplicationContext));
*/
        return modules;
    }

    @Deprecated
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactApplicationContext) {
        List<ViewManager> managers = new ArrayList<>();

        // components
        managers.add(new RCTMGLCameraManager(reactApplicationContext));
        managers.add(new RCTMGLAndroidTextureMapViewManager(reactApplicationContext));
        managers.add(new RCTMGLMapViewManager(reactApplicationContext));
 /*
        managers.add(new RCTMGLMarkerViewManager(reactApplicationContext));
        managers.add(new RCTMGLLightManager());
        managers.add(new RCTMGLPointAnnotationManager(reactApplicationContext));
        managers.add(new RCTMGLCalloutManager());
        managers.add(new RCTMGLNativeUserLocationManager());
*/
        // sources
        managers.add(new RCTMGLVectorSourceManager(reactApplicationContext));
        managers.add(new RCTMGLShapeSourceManager(reactApplicationContext));
/*
        managers.add(new RCTMGLRasterSourceManager(reactApplicationContext));
        managers.add(new RCTMGLImageSourceManager());

        // images
        managers.add(new RCTMGLImagesManager(reactApplicationContext));
*/
        // layers
        managers.add(new RCTMGLFillLayerManager());
        /*
        managers.add(new RCTMGLFillExtrusionLayerManager());
        managers.add(new RCTMGLHeatmapLayerManager());
 */
        managers.add(new RCTMGLLineLayerManager());
        managers.add(new RCTMGLCircleLayerManager());
 /*
        managers.add(new RCTMGLSymbolLayerManager());
        */
        managers.add(new RCTMGLRasterLayerManager());
/*
        managers.add(new RCTMGLBackgroundLayerManager());
*/
        return managers;
    }
}
