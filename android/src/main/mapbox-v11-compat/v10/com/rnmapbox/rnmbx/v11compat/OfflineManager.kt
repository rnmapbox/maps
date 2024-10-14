package com.rnmapbox.rnmbx.v11compat.offlinemanager;

import com.mapbox.common.TileStore
import com.mapbox.common.TileStoreOptions
import com.mapbox.common.toValue
import com.mapbox.maps.OfflineManager
import com.mapbox.maps.OfflineRegionManager
import com.mapbox.maps.ResourceOptions
import com.mapbox.maps.StylePackLoadOptions
import com.mapbox.maps.TilesetDescriptorOptions
import com.mapbox.maps.TilesetDescriptorOptionsForTilesets
import com.mapbox.common.TilesetDescriptor

fun getOfflineRegionManager(getAccessToken: () -> String): OfflineRegionManager {
  return OfflineRegionManager(ResourceOptions.Builder().accessToken(getAccessToken()).build())
}

fun getOfflineManager(tileStore: TileStore, getAccessToken: () -> String): OfflineManager {
  return OfflineManager(
    ResourceOptions.Builder()
      .accessToken(getAccessToken()).tileStore(
        tileStore
      ).build()
  )
}

fun getTilesetDescriptors(offlineManager: OfflineManager, styleURI: String, minZoom: Byte, maxZoom: Byte, stylePackOptions: StylePackLoadOptions, tilesets: List<String>): ArrayList<TilesetDescriptor>{
  val descriptorOptions = TilesetDescriptorOptions.Builder()
    .styleURI(styleURI)
    .minZoom(minZoom)
    .maxZoom(maxZoom)
    .stylePackOptions(stylePackOptions)
    .pixelRatio(2.0f)
    .build()
  val descriptor = offlineManager.createTilesetDescriptor(descriptorOptions)
  val tilesetDescriptorOptions = TilesetDescriptorOptionsForTilesets.Builder()
    .tilesets(tilesets)
    .minZoom(minZoom)
    .maxZoom(maxZoom)
    .build()
  val tilesetDescriptor = offlineManager.createTilesetDescriptor(tilesetDescriptorOptions)
  val descriptors = arrayListOf(descriptor)
  if (tilesets.isNotEmpty()) {
    descriptors.add(tilesetDescriptor)
  }
  return descriptors
}

fun TileStore.setAccessToken(token: String) {
  this.setOption(TileStoreOptions.MAPBOX_ACCESS_TOKEN, token.toValue());
}