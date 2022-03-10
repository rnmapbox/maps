package com.mapbox.rctmgl.impl;

import android.content.Context;
import com.mapbox.mapboxsdk.Mapbox;

public class InstanceManagerImpl {
  public static void getInstance(Context context, String accessToken) {
    Mapbox.getInstance(context, accessToken);
  }

  public static String getAccessToken() {
    return Mapbox.getAccessToken();
  }
}
