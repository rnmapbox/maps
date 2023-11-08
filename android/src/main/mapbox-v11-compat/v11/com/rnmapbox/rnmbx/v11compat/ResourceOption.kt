package com.rnmapbox.rnmbx.v11compat.resourceoption;

import android.content.Context
import com.mapbox.common.MapboxOptions

fun setMapboxAccessToken(context: Context?, accessToken: String?) {
  accessToken?.let {
    MapboxOptions.accessToken = it
  }
}

fun getMapboxAccessToken(context: Context?): String {
  return MapboxOptions.accessToken;
}
