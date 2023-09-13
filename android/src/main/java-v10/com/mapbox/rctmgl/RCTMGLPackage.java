package com.mapbox.rctmgl;

import androidx.annotation.Nullable;

import com.facebook.react.ReactPackage;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.mapbox.rctmgl.components.camera.RCTMGLCameraManager;

import com.mapbox.rctmgl.components.annotation.RCTMGLCalloutManager;
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotationManager;
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerViewManager;
import com.mapbox.rctmgl.components.images.RCTMGLImageManager;
import com.mapbox.rctmgl.components.images.RCTMGLImagesManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocationManager;
import com.mapbox.rctmgl.components.mapview.NativeMapViewModule;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapViewManager;
import com.mapbox.rctmgl.components.mapview.RCTMGLAndroidTextureMapViewManager;
import com.mapbox.rctmgl.components.styles.atmosphere.RCTMGLAtmosphereManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLBackgroundLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLCircleLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillExtrusionLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLHeatmapLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLLineLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLRasterLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLSkyLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLSymbolLayerManager;

import com.mapbox.rctmgl.components.styles.light.RCTMGLLightManager;
import com.mapbox.rctmgl.components.styles.terrain.RCTMGLTerrainManager;

import com.mapbox.rctmgl.components.styles.sources.RCTMGLImageSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLRasterSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLRasterDemSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLVectorSourceManager;

import com.mapbox.rctmgl.modules.RCTMGLLogging;

import com.mapbox.rctmgl.modules.RCTMGLOfflineModule;
import com.mapbox.rctmgl.modules.RCTMGLSnapshotModule;
import com.mapbox.rctmgl.modules.RCTMGLLocationModule;

import com.mapbox.rctmgl.modules.RCTMGLModule;


public class RCTMGLPackage extends TurboReactPackage {

    @Nullable
    @Override
    public NativeModule getModule(String s, ReactApplicationContext reactApplicationContext) {
        switch (s) {
            case RCTMGLModule.REACT_CLASS:
                return new RCTMGLModule(reactApplicationContext);
            case RCTMGLLocationModule.REACT_CLASS:
                return new RCTMGLLocationModule(reactApplicationContext);
            case RCTMGLOfflineModule.REACT_CLASS:
                return new RCTMGLOfflineModule(reactApplicationContext);
            case RCTMGLSnapshotModule.REACT_CLASS:
                return new RCTMGLSnapshotModule(reactApplicationContext);
            case RCTMGLLogging.REACT_CLASS:
                return new RCTMGLLogging(reactApplicationContext);
            case NativeMapViewModule.NAME:
                return new NativeMapViewModule(reactApplicationContext);
        }

        return null;
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

        // annotations
        managers.add(new RCTMGLMarkerViewManager(reactApplicationContext));
        managers.add(new RCTMGLPointAnnotationManager(reactApplicationContext));
        managers.add(new RCTMGLCalloutManager());

        managers.add(new RCTMGLNativeUserLocationManager());

        // sources
        managers.add(new RCTMGLVectorSourceManager(reactApplicationContext));
        managers.add(new RCTMGLShapeSourceManager(reactApplicationContext));
        managers.add(new RCTMGLRasterDemSourceManager(reactApplicationContext));
        managers.add(new RCTMGLRasterSourceManager(reactApplicationContext));
        managers.add(new RCTMGLImageSourceManager());

        // images
        managers.add(new RCTMGLImagesManager(reactApplicationContext));
        managers.add(new RCTMGLImageManager(reactApplicationContext));

        // layers
        managers.add(new RCTMGLFillLayerManager());
        managers.add(new RCTMGLFillExtrusionLayerManager());
        managers.add(new RCTMGLHeatmapLayerManager());
 
        managers.add(new RCTMGLLineLayerManager());
        managers.add(new RCTMGLCircleLayerManager());
        managers.add(new RCTMGLSymbolLayerManager());   
        managers.add(new RCTMGLRasterLayerManager());
        managers.add(new RCTMGLSkyLayerManager());
        managers.add(new RCTMGLTerrainManager());
        managers.add(new RCTMGLAtmosphereManager());
        managers.add(new RCTMGLBackgroundLayerManager());

        managers.add(new RCTMGLLightManager());

        return managers;
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
            final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
            boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;

            moduleInfos.put(
                    RCTMGLModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RCTMGLModule.REACT_CLASS,
                            RCTMGLModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RCTMGLLocationModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RCTMGLLocationModule.REACT_CLASS,
                            RCTMGLLocationModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RCTMGLOfflineModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RCTMGLOfflineModule.REACT_CLASS,
                            RCTMGLOfflineModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RCTMGLSnapshotModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RCTMGLSnapshotModule.REACT_CLASS,
                            RCTMGLSnapshotModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RCTMGLLogging.REACT_CLASS,
                    new ReactModuleInfo(
                            RCTMGLLogging.REACT_CLASS,
                            RCTMGLLogging.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    NativeMapViewModule.NAME,
                    new ReactModuleInfo(
                            NativeMapViewModule.NAME,
                            NativeMapViewModule.NAME,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            false, // hasConstants
                            false, // isCxxModule
                            isTurboModule // isTurboModule
                    ));

            return moduleInfos;
        };
    }
}
