package com.rnmapbox.rnmbx.events.constants

private fun ns(name: String): String {
    val namespace = "rct.mapbox"
    return String.format("%s.%s", namespace, name)
}
enum class EventKeys(val value: String) {
    // map events
    MAP_CLICK(ns("map.press")),
    MAP_LONG_CLICK(ns("map.longpress")),
    MAP_ONCHANGE(ns("map.change")),
    MAP_ON_LOCATION_CHANGE(ns("map.location.change")),
    MAP_ANDROID_CALLBACK(ns("map.androidcallback")),
    MAP_USER_TRACKING_MODE_CHANGE(ns("map.usertrackingmodechange")),

    // point annotation events
    POINT_ANNOTATION_SELECTED(ns("pointannotation.selected")),
    POINT_ANNOTATION_DESELECTED(ns("pointannotation.deselected")),
    POINT_ANNOTATION_DRAG_START(ns("pointannotation.dragstart")),
    POINT_ANNOTATION_DRAG(ns("pointannotation.drag")),
    POINT_ANNOTATION_DRAG_END(ns("pointannotation.dragend")),

    // source events
    SHAPE_SOURCE_LAYER_CLICK(ns("shapesource.layer.pressed")),
    VECTOR_SOURCE_LAYER_CLICK(ns("vectorsource.layer.pressed")),
    RASTER_SOURCE_LAYER_CLICK(ns("rastersource.layer.pressed")),

    // images event
    IMAGES_MISSING(ns("images.missing")),

    // location events
    USER_LOCATION_UPDATE(ns("user.location.update")),

    // viewport events
    VIEWPORT_STATUS_CHANGE(ns("viewport.statuschange"))
}

fun eventMapOf(vararg values: Pair<EventKeys, String>): Map<String, String> {
    val mapped = values.map { (k,v) -> Pair(k.value, v) }

    return mapOf(
        *mapped.toTypedArray()
    )
}