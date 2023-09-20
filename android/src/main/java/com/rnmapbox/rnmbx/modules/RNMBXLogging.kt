package com.rnmapbox.rnmbx.modules

import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.rnmapbox.rnmbx.modules.RNMBXLogging
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.Logger.LoggerDefinition

@ReactModule(name = RNMBXLogging.REACT_CLASS)
class RNMBXLogging(private val mReactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(
        mReactContext
    ) {
    override fun getName(): String {
        return REACT_CLASS
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Set up any upstream listeners or background tasks as necessary
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Remove upstream listeners, stop unnecessary background tasks
    }

    @ReactMethod
    fun setLogLevel(level: String?) {
        val NONE = 0
        var logLevel = NONE
        logLevel = when (level) {
            "error" -> Log.ERROR
            "warning" -> Log.WARN
            "info" -> Log.INFO
            "debug" -> Log.DEBUG
            "verbose" -> Log.VERBOSE
            else -> NONE
        }
        Logger.setVerbosity(logLevel)
    }

    fun onLog(level: String?, tag: String?, msg: String?, tr: Throwable?) {
        val event = Arguments.createMap()
        event.putString("message", msg)
        event.putString("tag", tag)
        event.putString("level", level)
        mReactContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit("LogEvent", event)
    }

    companion object {
        const val REACT_CLASS = "RNMBXLogging"
    }

    init {
        Logger.setVerbosity(Log.WARN)
        Logger.setLoggerDefinition(object : LoggerDefinition {
            override fun v(tag: String, msg: String) {
                Log.v(tag, msg)
                onLog("verbose", tag, msg, null)
            }

            override fun v(tag: String, msg: String, tr: Throwable) {
                Log.v(tag, msg, tr)
                onLog("verbose", tag, msg, tr)
            }

            override fun d(tag: String, msg: String) {
                Log.d(tag, msg)
                onLog("debug", tag, msg, null)
            }

            override fun d(tag: String, msg: String, tr: Throwable) {
                Log.d(tag, msg, tr)
                onLog("debug", tag, msg, tr)
            }

            override fun i(tag: String, msg: String) {
                Log.i(tag, msg)
                onLog("info", tag, msg, null)
            }

            override fun i(tag: String, msg: String, tr: Throwable) {
                Log.i(tag, msg, tr)
                onLog("info", tag, msg, tr)
            }

            override fun w(tag: String, msg: String) {
                Log.w(tag, msg)
                onLog("warning", tag, msg, null)
            }

            override fun w(tag: String, msg: String, tr: Throwable) {
                Log.w(tag, msg, tr)
                onLog("warning", tag, msg, tr)
            }

            override fun e(tag: String, msg: String) {
                Log.e(tag, msg)
                onLog("error", tag, msg, null)
            }

            override fun e(tag: String, msg: String, tr: Throwable) {
                Log.e(tag, msg, tr)
                onLog("error", tag, msg, tr)
            }
        })
    }
}