package com.mapbox.rctmgl.impl;

import android.content.Context;
import com.mapbox.mapboxsdk.location.permissions.PermissionsManager;

public class PermissionsManagerImpl {
  public static boolean areLocationPermissionsGranted(Context context) {
    return PermissionsManager.areLocationPermissionsGranted(context);
  }
}
