package com.mapbox.rctmgl;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.mapbox.rctmgl.components.mapview.RCTMGLMapViewManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLCircleLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillExtrusionLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLFillLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLLineLayerManager;
import com.mapbox.rctmgl.components.styles.layers.RCTMGLSymbolLayerManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSourceManager;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLVectorSourceManager;
import com.mapbox.rctmgl.modules.RCTMGLModule;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactApplicationContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new RCTMGLModule(reactApplicationContext));

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
        managers.add(new RCTMGLMapViewManager(reactApplicationContext));

        // sources
        managers.add(new RCTMGLVectorSourceManager(reactApplicationContext));
        managers.add(new RCTMGLShapeSourceManager());

        // layers
        managers.add(new RCTMGLFillLayerManager());
        managers.add(new RCTMGLFillExtrusionLayerManager());
        managers.add(new RCTMGLLineLayerManager());
        managers.add(new RCTMGLCircleLayerManager());
        managers.add(new RCTMGLSymbolLayerManager());

        return managers;
    }
}
