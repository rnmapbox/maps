package com.rnmapbox.rnmbx.v11compat.event;

//import com.mapbox.maps.MapboxMap
//import com.mapbox.maps.extension.observable.getMapLoadingErrorEventData

//fun MapboxMap.subscribe(callback: (Any?)->Void) {
//
//}

import com.mapbox.maps.Event
import com.mapbox.maps.extension.observable.eventdata.MapLoadingErrorEventData
import com.mapbox.maps.extension.observable.getMapLoadingErrorEventData as _getMapLoadingErrorEventData

fun Event.getMapLoadingErrorEventData() : MapLoadingErrorEventData {
    return _getMapLoadingErrorEventData()
};

