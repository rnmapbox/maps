package com.rnmapbox.rnmbx.v11compat.ornamentsettings

import com.mapbox.maps.plugin.attribution.generated.AttributionSettings
import com.mapbox.maps.plugin.compass.generated.CompassSettings
import com.mapbox.maps.plugin.logo.generated.LogoSettings
import com.mapbox.maps.plugin.scalebar.generated.ScaleBarSettings
import com.rnmapbox.rnmbx.components.mapview.OrnamentSettings

fun getAttributionSettings(): AttributionSettings {
    return AttributionSettings()
}

interface GenericOrnamentSettings {
    fun setHMargins(left: Float?, right: Float?)
    fun setVMargins(top: Float?, bottom: Float?)
    var enabled: Boolean
    var position: Int
}

fun ScaleBarSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private val settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) { settings.position = value }
}

fun CompassSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private var settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) {
            settings.position = value
        }
}

fun LogoSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private var settings = this@toGenericOrnamentSettings
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) {
            settings.position = value
        }
}

fun AttributionSettings.toGenericOrnamentSettings() = object : GenericOrnamentSettings {
    private var settings = this@toGenericOrnamentSettings;
    override fun setHMargins(left: Float?, right: Float?) {
        left?.let { settings.marginLeft = it }
        right?.let { settings.marginRight = it }
    }
    override fun setVMargins(top: Float?, bottom: Float?) {
        top?.let { settings.marginTop = it }
        bottom?.let { settings.marginBottom = it }
    }
    override var enabled: Boolean
        get() = settings.enabled
        set(value) { settings.enabled = value }
    override var position: Int
        get() = settings.position
        set(value) {
            settings.position = value
        }
}