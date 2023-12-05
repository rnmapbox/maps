package com.rnmapbox.rnmbx.components.styles.model

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXModelLayerManagerInterface
import com.facebook.react.viewmanagers.RNMBXModelsManagerInterface
import com.rnmapbox.rnmbx.components.styles.terrain.RNMBXTerrainManager
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.forEach

class RNMBXModelsManager(private val mContext: ReactApplicationContext) : ViewGroupManager<RNMBXModels>(),
    RNMBXModelsManagerInterface<RNMBXModels> {
    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXModels {
        return RNMBXModels(context)
    }

    @ReactProp(name = "models")
    override fun setModels(view: RNMBXModels, value: Dynamic?) {
        val map = hashMapOf<String,String>()
        value?.asMap()?.forEach { modelName, model ->
            when (model) {
                is ReadableMap -> {
                    model.getString("uri")?.also {
                        map.put(modelName, it)
                    } ?: model.getString("url")?.also {
                        map.put(modelName, it)
                    } ?: run {
                        Logger.e(
                            LOG_TAG,
                            "Invalid value for model key: ${modelName} => ${model} is not an uri/url"
                        )
                    }
                }

                else -> {
                    Logger.e(
                        LOG_TAG,
                        "Invalid value for model key: ${modelName} => ${model} is not an uri/url"
                    )

                }
            }
        }
        view.setModels(map)
    }

    companion object {
        const val REACT_CLASS = "RNMBXModels"
            const val LOG_TAG = "RNMBXModels"
    }
}