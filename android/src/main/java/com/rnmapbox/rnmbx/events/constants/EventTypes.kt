package com.rnmapbox.rnmbx.events.constants

object EventTypes {
    // map event types
    const val MAP_CLICK = "press"
    const val MAP_LONG_CLICK = "longpress"
    const val MAP_USER_TRACKING_MODE_CHANGE = "usertrackingmodechange"
    const val REGION_WILL_CHANGE = "regionwillchange"
    const val REGION_IS_CHANGING = "regionischanging" // deprecated
    const val CAMERA_CHANGED = "camerachanged"
    const val REGION_DID_CHANGE = "regiondidchange"
    const val MAP_IDLE = "mapidle"
    const val USER_LOCATION_UPDATED = "userlocationdupdated"
    const val WILL_START_LOADING_MAP = "willstartloadingmap"
    const val DID_FINISH_LOADING_MAP = "didfinishloadingmap"
    const val DID_FAIL_LOADING_MAP = "didfailloadingmap"
    const val WILL_START_RENDERING_FRAME = "willstartrenderingframe"
    const val DID_FINISH_RENDERING_FRAME = "didfinishrenderingframe"
    const val DID_FINISH_RENDERING_FRAME_FULLY = "didfinishrenderingframefully"
    const val WILL_START_RENDERING_MAP = "willstartrenderingmap"
    const val DID_FINISH_RENDERING_MAP = "didfinishrenderingmap"
    const val DID_FINISH_RENDERING_MAP_FULLY = "didfinishrenderingmapfully"
    const val DID_FINISH_LOADING_STYLE = "didfinishloadingstyle"
    const val MAP_LOADING_ERROR = "maploadingerror"

    // point annotation event types
    const val ANNOTATION_SELECTED = "annotationselected"
    const val ANNOTATION_DESELECTED = "annotationdeselected"
    const val ANNOTATION_DRAG_START = "annotationdragstart"
    const val ANNOTATION_DRAG = "annotationdrag"
    const val ANNOTATION_DRAG_END = "annotationdragend"

    // offline event types
    const val OFFLINE_ERROR = "offlineerror"
    const val OFFLINE_TILE_LIMIT = "offlinetilelimit"
    const val OFFLINE_STATUS = "offlinestatus"

    // shape source event types
    const val SHAPE_SOURCE_LAYER_CLICK = "shapesourcelayerpress"
    const val VECTOR_SOURCE_LAYER_CLICK = "vectorsourcelayerpress"
    const val RASTER_SOURCE_LAYER_CLICK = "rastersourcelayerpress"

    // image missing event type
    const val IMAGES_MISSING = "imagesmissing"
}