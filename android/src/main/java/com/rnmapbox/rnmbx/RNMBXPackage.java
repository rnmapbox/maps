package com.rnmapbox.rnmbx;

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

import com.rnmapbox.rnmbx.components.camera.RNMBXCameraManager;

import com.rnmapbox.rnmbx.components.annotation.RNMBXCalloutManager;
import com.rnmapbox.rnmbx.components.annotation.RNMBXPointAnnotationManager;
import com.rnmapbox.rnmbx.components.annotation.RNMBXMarkerViewManager;
import com.rnmapbox.rnmbx.components.images.RNMBXImageManager;
import com.rnmapbox.rnmbx.components.images.RNMBXImagesManager;
import com.rnmapbox.rnmbx.components.location.RNMBXNativeUserLocationManager;
import com.rnmapbox.rnmbx.components.mapview.NativeMapViewModule;
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapViewManager;
import com.rnmapbox.rnmbx.components.mapview.RNMBXAndroidTextureMapViewManager;
import com.rnmapbox.rnmbx.components.styles.atmosphere.RNMBXAtmosphereManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXBackgroundLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXCircleLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillExtrusionLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXFillLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXHeatmapLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXLineLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXRasterLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSkyLayerManager;
import com.rnmapbox.rnmbx.components.styles.layers.RNMBXSymbolLayerManager;

import com.rnmapbox.rnmbx.components.styles.light.RNMBXLightManager;
import com.rnmapbox.rnmbx.components.styles.terrain.RNMBXTerrainManager;

import com.rnmapbox.rnmbx.components.styles.sources.RNMBXImageSourceManager;
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXRasterSourceManager;
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXRasterDemSourceManager;
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXShapeSourceManager;
import com.rnmapbox.rnmbx.components.styles.sources.RNMBXVectorSourceManager;

import com.rnmapbox.rnmbx.modules.RNMBXLogging;

import com.rnmapbox.rnmbx.modules.RNMBXOfflineModule;
import com.rnmapbox.rnmbx.modules.RNMBXSnapshotModule;
import com.rnmapbox.rnmbx.modules.RNMBXLocationModule;

import com.rnmapbox.rnmbx.modules.RNMBXModule;


public class RNMBXPackage extends TurboReactPackage {

    @Nullable
    @Override
    public NativeModule getModule(String s, ReactApplicationContext reactApplicationContext) {
        switch (s) {
            case RNMBXModule.REACT_CLASS:
                return new RNMBXModule(reactApplicationContext);
            case RNMBXLocationModule.REACT_CLASS:
                return new RNMBXLocationModule(reactApplicationContext);
            case RNMBXOfflineModule.REACT_CLASS:
                return new RNMBXOfflineModule(reactApplicationContext);
            case RNMBXSnapshotModule.REACT_CLASS:
                return new RNMBXSnapshotModule(reactApplicationContext);
            case RNMBXLogging.REACT_CLASS:
                return new RNMBXLogging(reactApplicationContext);
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
        managers.add(new RNMBXCameraManager(reactApplicationContext));
        managers.add(new RNMBXAndroidTextureMapViewManager(reactApplicationContext));
        managers.add(new RNMBXMapViewManager(reactApplicationContext));

        // annotations
        managers.add(new RNMBXMarkerViewManager(reactApplicationContext));
        managers.add(new RNMBXPointAnnotationManager(reactApplicationContext));
        managers.add(new RNMBXCalloutManager());

        managers.add(new RNMBXNativeUserLocationManager());

        // sources
        managers.add(new RNMBXVectorSourceManager(reactApplicationContext));
        managers.add(new RNMBXShapeSourceManager(reactApplicationContext));
        managers.add(new RNMBXRasterDemSourceManager(reactApplicationContext));
        managers.add(new RNMBXRasterSourceManager(reactApplicationContext));
        managers.add(new RNMBXImageSourceManager());

        // images
        managers.add(new RNMBXImagesManager(reactApplicationContext));
        managers.add(new RNMBXImageManager(reactApplicationContext));

        // layers
        managers.add(new RNMBXFillLayerManager());
        managers.add(new RNMBXFillExtrusionLayerManager());
        managers.add(new RNMBXHeatmapLayerManager());
 
        managers.add(new RNMBXLineLayerManager());
        managers.add(new RNMBXCircleLayerManager());
        managers.add(new RNMBXSymbolLayerManager());   
        managers.add(new RNMBXRasterLayerManager());
        managers.add(new RNMBXSkyLayerManager());
        managers.add(new RNMBXTerrainManager());
        managers.add(new RNMBXAtmosphereManager());
        managers.add(new RNMBXBackgroundLayerManager());

        managers.add(new RNMBXLightManager());

        return managers;
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
            final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
            boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;

            moduleInfos.put(
                    RNMBXModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RNMBXModule.REACT_CLASS,
                            RNMBXModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RNMBXLocationModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RNMBXLocationModule.REACT_CLASS,
                            RNMBXLocationModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RNMBXOfflineModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RNMBXOfflineModule.REACT_CLASS,
                            RNMBXOfflineModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RNMBXSnapshotModule.REACT_CLASS,
                    new ReactModuleInfo(
                            RNMBXSnapshotModule.REACT_CLASS,
                            RNMBXSnapshotModule.REACT_CLASS,
                            false, // canOverrideExistingModule
                            false, // needsEagerInit
                            true, // hasConstants
                            false, // isCxxModule
                            false // isTurboModule
                    ));

            moduleInfos.put(
                    RNMBXLogging.REACT_CLASS,
                    new ReactModuleInfo(
                            RNMBXLogging.REACT_CLASS,
                            RNMBXLogging.REACT_CLASS,
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
