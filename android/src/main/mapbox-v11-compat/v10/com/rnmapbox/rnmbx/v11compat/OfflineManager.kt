package com.rnmapbox.rnmbx.v11compat.offlinemanager;

import com.mapbox.common.TileStore
import com.mapbox.common.TileStoreOptions
import com.mapbox.common.toValue
import com.mapbox.maps.OfflineManager
import com.mapbox.maps.OfflineRegionManager
import com.mapbox.maps.ResourceOptions

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

fun TileStore.setAccessToken(token: String) {
  this.setOption(TileStoreOptions.MAPBOX_ACCESS_TOKEN, token.toValue());
}