package com.rnmapbox.rnmbx.events.constants

private fun ns(name: String): String {
    val namespace = "rct.mapbox"
    return String.format("%s.%s", namespace, name)
}

enum class EventKeys(val value: String) {
    // map events
    MAP_CLICK("topPress"),
    MAP_LONG_CLICK("topLongPress"),
    MAP_ONCHANGE("topMapChange"),
    MAP_ON_LOCATION_CHANGE("topLocationChange"),
    MAP_ANDROID_CALLBACK("topAndroidCallback"),
    MAP_USER_TRACKING_MODE_CHANGE("topUserTrackingModeChange"),

    // point annotation events
    POINT_ANNOTATION_SELECTED("topMapboxPointAnnotationSelected"),
    POINT_ANNOTATION_DESELECTED("topMapboxPointAnnotationDeselected"),
    POINT_ANNOTATION_DRAG_START("topMapboxPointAnnotationDragStart"),
    POINT_ANNOTATION_DRAG("topMapboxPointAnnotationDrag"),
    POINT_ANNOTATION_DRAG_END("topMapboxPointAnnotationDragEnd"),

    // source events
    SHAPE_SOURCE_LAYER_CLICK("topMapboxShapeSourcePress"),
    VECTOR_SOURCE_LAYER_CLICK("topMapboxVectorSourcePress"),
    RASTER_SOURCE_LAYER_CLICK("topMapboxRasterSourcePress"),

    // images event
    IMAGES_MISSING("topImageMissing"),

    // location events
    // TODO: not sure about this one since it is not registered anywhere
    USER_LOCATION_UPDATE(ns("user.location.update")),

    // viewport events
    VIEWPORT_STATUS_CHANGE("topStatusChanged")
}

fun eventMapOf(vararg values: Pair<EventKeys, String>): Map<String, String> {
    val mapped = values.map { (k,v) -> Pair(k.value, v) }

    return mapOf(
        *mapped.toTypedArray()
    )
}