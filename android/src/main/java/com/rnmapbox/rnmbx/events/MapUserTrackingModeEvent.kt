package com.rnmapbox.rnmbx.events

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.rnmapbox.rnmbx.components.location.UserTrackingMode
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.events.constants.EventTypes

class MapUserTrackingModeEvent(view: View?, val userTrackingMode: Int, val basePayload: WritableMap? = null) : AbstractEvent(view, EventTypes.MAP_USER_TRACKING_MODE_CHANGE) {
    override val key
        get() = EventKeys.MAP_USER_TRACKING_MODE_CHANGE.value

    override val payload : WritableMap
        get() {
            val payload = basePayload?.copy() ?: Arguments.createMap()
            payload.putBoolean("followUserLocation", userTrackingMode != UserTrackingMode.NONE)
            payload.putString("followUserMode", UserTrackingMode.toString(userTrackingMode))
            return payload
        }
}