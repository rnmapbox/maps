package com.mapbox.rctmgl.impl;

import android.content.Context;

import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.WellKnownTileServer;
import com.mapbox.mapboxsdk.log.Logger;

import java.util.HashMap;
import java.util.Map;

public class InstanceManagerImpl {
  public static void getInstance(Context context, String accessToken) {
    if (wellKnownTileServer == null) {
      Logger.w("InstanceManagerImpl", "setAccessToken requires setWellKnownTileServer for MapLibre, see setWellKnownTileServer docs for implications");
      wellKnownTileServer = WellKnownTileServer.MapLibre.name();
    }
    Mapbox.getInstance(context, accessToken,  WellKnownTileServer.valueOf(wellKnownTileServer) );
  }

  public static Map<String,String> getTileServers() {
    HashMap<String, String> result = new HashMap();
    result.put("Mapbox", WellKnownTileServer.Mapbox.name());
    result.put("MapLibre", WellKnownTileServer.MapLibre.name());
    result.put("MapTiler", WellKnownTileServer.MapTiler.name());
    return result;
  }

  static String wellKnownTileServer = null;

  public static void setWellKnownTileServer(String wellKnownTileServer) {
    InstanceManagerImpl.wellKnownTileServer = wellKnownTileServer;
  }

  public static String getAccessToken() {
    return Mapbox.getApiKey();
  }

  public static String getLibraryName() {
    return "maplibre";
  }
}
