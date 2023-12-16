package com.rnmapbox.rnmbx.modules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.mapbox.common.TileDataDomain
import com.mapbox.common.TileStore
import com.rnmapbox.rnmbx.utils.extensions.toValue
import com.rnmapbox.rnmbx.utils.writableMapOf

typealias Tag = Int

@ReactModule(name = RNMBXTileStoreModule.REACT_CLASS)
class RNMBXTileStoreModule(private val mReactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
        mReactContext
  ) {

  fun shared(path: String?): TileStore {
    return if (path != null) {
      TileStore.create(path)
    } else {
      TileStore.create()
    }
  }

  @ReactMethod
  fun shared(path: String?, promise: Promise) {
    val tag = RNMBXTileStoreModule.tileStorePathTags.get(path)
    if (tag != null) {
      promise.resolve(tag)
    } else {
      val tileStore = shared(path)
      RNMBXTileStoreModule.lastTag += 1
      val tag = RNMBXTileStoreModule.lastTag
      RNMBXTileStoreModule.tileStores.put(tag, tileStore)
      RNMBXTileStoreModule.tileStorePathTags.set(path, tag)
      promise.resolve(tag)
    }
  }

  @ReactMethod
  fun setOption(tag: Double, key:String, domain: String, value: ReadableMap, promise: Promise) {
    val tileStore = RNMBXTileStoreModule.tileStores[tag.toInt()]
    if (tileStore == null) {
      promise.reject(REACT_CLASS, "No tile store found for tag")
      return
    }

    tileStore.setOption(key, TileDataDomain.valueOf(domain.uppercase()), value.getDynamic("value").toValue());
    promise.resolve(null)
  }

  override fun getName(): String {
    return REACT_CLASS
  }

  companion object {
    const val REACT_CLASS = "RNMBXTileStoreModule"

    var tileStores = mutableMapOf<Tag, TileStore>()
    var tileStorePathTags = mutableMapOf<String?, Tag>()
    var lastTag = REACT_CLASS.hashCode() % 1096
  }
}