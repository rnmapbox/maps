package com.rnmapbox.rnmbx.v11compat.offlinemanager;

import com.mapbox.common.MapboxOptions
import com.mapbox.common.TileStore
import com.mapbox.maps.OfflineManager
import com.mapbox.maps.OfflineRegionManager

fun getOfflineRegionManager(getAccessToken: () -> String): OfflineRegionManager {
  return OfflineRegionManager()
}
fun getOfflineManager(tileStore: TileStore, getAccessToken: () -> String): OfflineManager {
  return OfflineManager()
}
fun TileStore.setAccessToken(token: String) {
  MapboxOptions.accessToken = token
}