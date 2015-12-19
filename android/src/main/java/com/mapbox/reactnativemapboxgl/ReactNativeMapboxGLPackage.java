package com.mapbox.reactnativemapboxgl;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class ReactNativeMapboxGLPackage implements ReactPackage {

    private ReactNativeMapboxGLManager glManager;

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        ReactNativeMapboxGLModule module = new ReactNativeMapboxGLModule(reactContext);
        module.setPackage(this);
        modules.add(module);
        return modules;
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        glManager = new ReactNativeMapboxGLManager();
        return Arrays.<ViewManager>asList(
                glManager
        );
    }

    public ReactNativeMapboxGLManager getManager() {
        return glManager;
    }
}