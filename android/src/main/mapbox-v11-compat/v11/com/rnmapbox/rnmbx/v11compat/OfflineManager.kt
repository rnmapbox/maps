package com.rnmapbox.rnmbx.v11compat.offlinemanager;

import com.mapbox.common.MapboxOptions
import com.mapbox.common.TileStore
import com.mapbox.maps.OfflineManager
import com.mapbox.maps.OfflineRegionManager
import com.mapbox.maps.StylePackLoadOptions
import com.mapbox.maps.TilesetDescriptorOptions
import com.mapbox.common.TilesetDescriptor

fun getOfflineRegionManager(getAccessToken: () -> String): OfflineRegionManager {
  return OfflineRegionManager()
}

fun getOfflineManager(tileStore: TileStore, getAccessToken: () -> String): OfflineManager {
  return OfflineManager()
}

fun getTilesetDescriptors(offlineManager: OfflineManager, styleURI: String, minZoom: Byte, maxZoom: Byte, stylePackOptions: StylePackLoadOptions, tilesets: List<String>): ArrayList<TilesetDescriptor>{
  if (tilesets.isNotEmpty()) {
    val descriptorOptions = TilesetDescriptorOptions.Builder()
      .styleURI(styleURI)
      .minZoom(minZoom)
      .maxZoom(maxZoom)
//    TODO: When tilesets is passed in the mappack doesn't save -- not sure why
//      .tilesets(tilesets)
      .stylePackOptions(stylePackOptions)
      .pixelRatio(2.0f)
      .build()
    val descriptor = offlineManager.createTilesetDescriptor(descriptorOptions)
    val descriptors = arrayListOf(descriptor)
    return descriptors
  }
  val descriptorOptions = TilesetDescriptorOptions.Builder()
    .styleURI(styleURI)
    .minZoom(minZoom)
    .maxZoom(maxZoom)
    .stylePackOptions(stylePackOptions)
    .pixelRatio(2.0f)
    .build()
  val descriptor = offlineManager.createTilesetDescriptor(descriptorOptions)
  val descriptors = arrayListOf(descriptor)
  return descriptors
}

fun TileStore.setAccessToken(token: String) {
  MapboxOptions.accessToken = token
}