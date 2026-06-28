package com.rnmapbox.rnmbx.components.annotation

import android.view.View
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableType
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNMBXPointAnnotationManagerManagerInterface
import com.rnmapbox.rnmbx.components.AbstractEventEmitter

class RNMBXPointAnnotationManagerViewManager(context: ReactApplicationContext) :
    AbstractEventEmitter<RNMBXPointAnnotationManagerView>(context),
    RNMBXPointAnnotationManagerManagerInterface<RNMBXPointAnnotationManagerView> {
    override fun customEvents(): Map<String, String>? {
        return MapBuilder.builder<String, String>().build()
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(context: ThemedReactContext): RNMBXPointAnnotationManagerView {
        return RNMBXPointAnnotationManagerView(context)
    }

    override fun addView(parent: RNMBXPointAnnotationManagerView, childView: View, childPosition: Int) {
        parent.addAnnotation(childView, childPosition)
    }

    override fun removeViewAt(parent: RNMBXPointAnnotationManagerView, childPosition: Int) {
        parent.removeAnnotationAt(childPosition)
    }

    override fun getChildAt(parent: RNMBXPointAnnotationManagerView, childPosition: Int): View {
        return parent.getChildAt(childPosition)
    }

    override fun getChildCount(parent: RNMBXPointAnnotationManagerView): Int {
        return parent.getChildCount()
    }

    private fun optBoolean(value: Dynamic): Boolean? {
        return if (value.isNull || value.type != ReadableType.Boolean) null else value.asBoolean()
    }

    companion object {
        const val REACT_CLASS = "RNMBXPointAnnotationManager"
    }

    @ReactProp(name = "id")
    override fun setId(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.reactId = if (value.isNull) null else value.asString()
    }

    @ReactProp(name = "isDefault")
    override fun setIsDefault(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.isDefault = !value.isNull && value.asBoolean()
    }

    @ReactProp(name = "slot")
    override fun setSlot(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.slot = if (value.isNull) null else value.asString()
    }

    @ReactProp(name = "iconAllowOverlap")
    override fun setIconAllowOverlap(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.iconAllowOverlap = optBoolean(value)
    }

    @ReactProp(name = "iconIgnorePlacement")
    override fun setIconIgnorePlacement(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.iconIgnorePlacement = optBoolean(value)
    }

    @ReactProp(name = "iconOptional")
    override fun setIconOptional(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.iconOptional = optBoolean(value)
    }

    @ReactProp(name = "textAllowOverlap")
    override fun setTextAllowOverlap(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.textAllowOverlap = optBoolean(value)
    }

    @ReactProp(name = "textIgnorePlacement")
    override fun setTextIgnorePlacement(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.textIgnorePlacement = optBoolean(value)
    }

    @ReactProp(name = "textOptional")
    override fun setTextOptional(view: RNMBXPointAnnotationManagerView, value: Dynamic) {
        view.textOptional = optBoolean(value)
    }
}
