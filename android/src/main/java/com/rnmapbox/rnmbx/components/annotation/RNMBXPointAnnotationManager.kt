package com.rnmapbox.rnmbx.components.annotation

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXPointAnnotationManagerDelegate
import com.facebook.react.viewmanagers.RNMBXPointAnnotationManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter
import com.rnmapbox.rnmbx.events.constants.EventKeys
import com.rnmapbox.rnmbx.utils.GeoJSONUtils.toPointGeometry

class RNMBXPointAnnotationManager(reactApplicationContext: ReactApplicationContext) : AbstractEventEmitter<RNMBXPointAnnotation>(reactApplicationContext),
  RNMBXPointAnnotationManagerInterface<RNMBXPointAnnotation> {

    private val mDelegate: ViewManagerDelegate<RNMBXPointAnnotation>

    init {
        mDelegate = RNMBXPointAnnotationManagerDelegate(this)
    }

    override fun getDelegate(): ViewManagerDelegate<RNMBXPointAnnotation> {
        return mDelegate
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun customEvents(): Map<String, String> {
        return MapBuilder.builder<String, String>()
            .put(EventKeys.POINT_ANNOTATION_SELECTED, "onMapboxPointAnnotationSelected")
            .put(EventKeys.POINT_ANNOTATION_DESELECTED, "onMapboxPointAnnotationDeselected")
            .put(EventKeys.POINT_ANNOTATION_DRAG_START, "onMapboxPointAnnotationDragStart")
            .put(EventKeys.POINT_ANNOTATION_DRAG, "onMapboxPointAnnotationDrag")
            .put(EventKeys.POINT_ANNOTATION_DRAG_END, "onMapboxPointAnnotationDragEnd")
            .build()
    }

    // TODO: check why it does not work correctly
    override fun createViewInstance(reactContext: ThemedReactContext): RNMBXPointAnnotation {
        return RNMBXPointAnnotation(reactContext!!, this)
    }

    @ReactProp(name = "id")
    override fun setId(annotation: RNMBXPointAnnotation, id: Dynamic) {
        annotation.iD = id.asString()
    }

    @ReactProp(name = "coordinate")
    override fun setCoordinate(annotation: RNMBXPointAnnotation, geoJSONStr: Dynamic) {
        annotation.setCoordinate(toPointGeometry(geoJSONStr.asString())!!)
    }

    @ReactProp(name = "anchor")
    override fun setAnchor(annotation: RNMBXPointAnnotation, map: Dynamic) {
        annotation.setAnchor(map.asMap().getDouble("x").toFloat(), map.asMap().getDouble("y").toFloat())
    }

    @ReactProp(name = "draggable")
    override fun setDraggable(annotation: RNMBXPointAnnotation, draggable: Dynamic) {
        annotation.setDraggable(draggable.asBoolean())
    }

    companion object {
        const val REACT_CLASS = "RNMBXPointAnnotation"
    }
}