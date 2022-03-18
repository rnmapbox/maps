package com.mapbox.rctmgl.impl;

import android.content.Context;
import com.mapbox.mapboxsdk.Mapbox;
import com.mapbox.mapboxsdk.WellKnownTileServer;

public class InstanceManagerImpl {
  public static void getInstance(Context context, String accessToken) {
    Mapbox.getInstance(context, accessToken, WellKnownTileServer.Mapbox);
  }

  public static String getAccessToken() {
    return null;
  }
}
