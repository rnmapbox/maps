package com.mapbox.rctmgl.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.mapbox.rctmgl.components.location.UserTrackingMode
import com.mapbox.rctmgl.events.constants.EventKeys
import com.mapbox.rctmgl.events.constants.EventTypes

class MapUserTrackingModeEvent(view: View?, val userTrackingMode: Int) : AbstractEvent(view, EventTypes.MAP_USER_TRACKING_MODE_CHANGE) {
    override fun getKey(): String {
        return EventKeys.MAP_USER_TRACKING_MODE_CHANGE;
    }

    override fun getPayload(): WritableMap {
        val payload = Arguments.createMap()
        payload.putBoolean("followUserLocation", userTrackingMode != UserTrackingMode.NONE)
        payload.putString("followUserMode", UserTrackingMode.toString(userTrackingMode))
        return payload
    }
}