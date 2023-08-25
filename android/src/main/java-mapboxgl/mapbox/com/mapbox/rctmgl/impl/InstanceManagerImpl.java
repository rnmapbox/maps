package com.mapbox.rctmgl.impl;

import android.content.Context;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.log.Logger;

import java.util.HashMap;
import java.util.Map;

public class InstanceManagerImpl {
  public static void getInstance(Context context, String accessToken) {
    Mapbox.getInstance(context, accessToken);
  }

  public static void setWellKnownTileServer(String wellKnownTileServer) {
    if (wellKnownTileServer != "mapbox") {
      Logger.w("InstanceManagerImpl", "setWellKnownTileServer: only mapbox is supported");
      return;
    }
  }

  public static String getAccessToken() {
    return Mapbox.getAccessToken();
  }

  public static String getLibraryName() {
    return "mapbox-gl";
  }

  public static Map<String, String> getTileServers() {
    HashMap<String, String> result = new HashMap();
    result.put("Mapbox", "mapbox");
    return result;
  }
}
