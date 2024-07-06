package com.rnmapbox.rnmbx.components.styles

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXStyleImportManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.mapbox.bindgen.Value
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.toValueHashMap
import org.json.JSONObject

class RNMBXStyleImportManager(context: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXStyleImport>(context),
    RNMBXStyleImportManagerInterface<RNMBXStyleImport> {
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>().build()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXStyleImport {
        return RNMBXStyleImport(context)
    }

    companion object {
        const val REACT_CLASS = "RNMBXStyleImport"
    }

    @ReactProp(name = "id")
    override fun setId(view: RNMBXStyleImport, value: String?) {
        if (value != null) {
            view.id = value
        }
    }

    @ReactProp(name = "existing")
    override fun setExisting(view: RNMBXStyleImport, value: Boolean) {

    }

    @ReactProp(name = "config")
    override fun setConfig(view: RNMBXStyleImport, value: Dynamic) {
        if (value.type != ReadableType.Map) {
            Logger.e(REACT_CLASS, "config expected Map but received: ${value.type}")
        } else {
            view.config = value.asMap().toValueHashMap()
        }
    }
}