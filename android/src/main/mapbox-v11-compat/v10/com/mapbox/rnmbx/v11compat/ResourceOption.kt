package com.rnmapbox.rnmbx.v11compat.resourceoption;

import android.content.Context
import com.mapbox.maps.ResourceOptionsManager.Companion.getDefault

fun setMapboxAccessToken(context: Context, accessToken: String?) {
  getDefault(context, accessToken)
}

fun getMapboxAccessToken(context: Context?): String {
  return getDefault((context)!!, null).resourceOptions.accessToken
}