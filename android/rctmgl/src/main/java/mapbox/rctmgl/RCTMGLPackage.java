package mapbox.rctmgl;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import mapbox.rctmgl.components.RCTMGLMapViewManager;
import mapbox.rctmgl.modules.RCTMGLModule;

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

        managers.add(new RCTMGLMapViewManager(reactApplicationContext));

        return managers;
    }
}
