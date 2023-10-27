package com.rnmapbox.rnmbx.utils

/**
 * This mechanism allows to separate property updates from application of property updates. Usefull for delaying the propery updates
 * because the object is not yet created for example. Or to apply multiple propery changes at once.
 *
 * @sample
 *
 * class MapView {
 *   enum class Property(_apply: (MapView)->Unit) : PropertyUpdaterWithName<MapView> {
 *     class LOGO_POSITION(MapView.applyLogoPosition)
 *
 *     override fun apply(mapView: MapView): Unit {
 *       _apply(mapView)
 *     }
 *   }
 *     val changes: PropertyUpdates()
 *
 *     var logoPosition: LogoPosition;
 *
 *     fun setLogoPosition(value: LogoPosition) {
 *        logoPosition = value
 *        changes.add(Property::LOGO_POSITION)
 *     }
 *
 *     fun setGestureSettings(value: Custom) {
 *         changes.add(Property::CUSTOM("gestures") {
 *            mapboxMap.updateGestures(...)
 *         })
 *     }
 *
 *     fun applyLogoPosition() {
 *       mapboxMap.updateLogoPosition(logoPosition)
 *     }
 *   }
 * }
 */

interface PropertyUpdater<Base: Any> {
    fun apply(item: Base): Unit;
}
interface PropertyUpdaterWithName<Base: Any> : PropertyUpdater<Base> {
    val name: String;
}

class CustomPropUpdater<T: Any>(val _apply: (T) -> Unit) : PropertyUpdater<T> {
    override fun apply(item: T): Unit {
        _apply(item)
    }
}
class PropertyChanges<T : Any> {
    val changes = mutableMapOf<String, PropertyUpdater<T>>();

    fun add(change: PropertyUpdaterWithName<T>) {
        changes.set(change.name, change)
    }

    fun add(key: String, apply: (T) -> Unit) {
        changes.set(key, CustomPropUpdater(apply))
    }

    fun apply(target: T) {
        for (entry in changes.entries.iterator()) {
            entry.value.apply(target)
        }
        changes.clear()
    }
}