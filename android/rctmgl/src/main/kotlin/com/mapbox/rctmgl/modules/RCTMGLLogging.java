package com.mapbox.rctmgl.modules;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.mapbox.rctmgl.utils.Logger;

import android.util.Log;

@ReactModule(name = RCTMGLLogging.REACT_CLASS)
public class RCTMGLLogging extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = "RCTMGLLogging";
    private ReactApplicationContext mReactContext;

    public RCTMGLLogging(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mReactContext = reactApplicationContext;

        Logger.setVerbosity(Log.WARN);
        Logger.setLoggerDefinition(new Logger.LoggerDefinition() {
            @Override
            public void v(String tag, String msg) {
                Log.v(tag, msg);
                onLog("verbose", tag, msg, null);
            }

            @Override
            public void v(String tag, String msg, Throwable tr) {
                Log.v(tag, msg, tr);
                onLog("verbose", tag, msg, tr);
            }

            @Override
            public void d(String tag, String msg) {
                Log.d(tag, msg);
                onLog("debug", tag, msg, null);
            }

            @Override
            public void d(String tag, String msg, Throwable tr) {
                Log.d(tag, msg, tr);
                onLog("debug",tag,msg,tr);
            }

            @Override
            public void i(String tag, String msg) {
                Log.i(tag, msg);
                onLog("info", tag, msg, null);
            }

            @Override
            public void i(String tag, String msg, Throwable tr) {
                Log.i(tag, msg, tr);
                onLog("info", tag, msg, tr);
            }

            @Override
            public void w(String tag, String msg) {
                Log.w(tag, msg);
                onLog("warning", tag, msg, null);
            }

            @Override
            public void w(String tag, String msg, Throwable tr) {
                Log.w(tag, msg, tr);
                onLog("warning", tag, msg, tr);
            }

            @Override
            public void e(String tag, String msg) {
                Log.e(tag, msg);
                onLog("error", tag, msg, null);
            }

            @Override
            public void e(String tag, String msg, Throwable tr) {
                Log.e(tag, msg, tr);
                onLog("error", tag, msg, tr);
            }
        });
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void setLogLevel(String level) {
        int NONE = 0;
        int logLevel = NONE;
        switch(level)
        {
            case "error":
                logLevel = Log.ERROR;
                break;
            case "warning":
                logLevel = Log.WARN;
                break;
            case "info":
                logLevel = Log.INFO;
                break;
            case "debug":
                logLevel = Log.DEBUG;
                break;
            case "verbose":
                logLevel = Log.VERBOSE;
                break;
            default:
                logLevel = NONE;
                break;
        }
        Logger.setVerbosity(logLevel);
    }

    public void onLog(String level, String tag, String msg, Throwable tr) {
        WritableMap event = Arguments.createMap();
        event.putString("message", msg);
        event.putString("tag", tag);
        event.putString("level", level);

        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("LogEvent", event);
    }

}
