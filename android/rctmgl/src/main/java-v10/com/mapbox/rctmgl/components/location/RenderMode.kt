package com.mapbox.rctmgl.components.location

/**
 * Contains the variety of ways the user location can be rendered on the map.
 */
enum class RenderMode {
    /**
     * Basic tracking is enabled, bearing ignored.
     */
    NORMAL,
    /**
     * Tracking the user location with bearing considered
     * from a [CompassEngine].
     */
    COMPASS,
    /**
     * Tracking the user location with bearing considered from [android.location.Location].
     */
    GPS
}

