package com.rnmapbox.rnmbx.components.location

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ColorPropConverter
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.bindgen.Value
import com.mapbox.maps.Image
import com.mapbox.maps.MapView
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.Style
import com.mapbox.maps.plugin.LocationPuck2D
import com.mapbox.maps.plugin.locationcomponent.LocationComponentConstants
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.maps.plugin.locationcomponent.R as LR
import com.rnmapbox.rnmbx.R
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.images.ImageManager
import com.rnmapbox.rnmbx.components.images.Resolver
import com.rnmapbox.rnmbx.components.images.Subscription
import com.rnmapbox.rnmbx.components.mapview.OnMapReadyCallback
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.utils.BitmapUtils
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.getAndLogIfNotBoolean
import com.rnmapbox.rnmbx.utils.extensions.getAndLogIfNotString
import com.rnmapbox.rnmbx.v11compat.image.AppCompatResourcesV11
import com.rnmapbox.rnmbx.v11compat.image.ImageHolder
import com.rnmapbox.rnmbx.v11compat.image.toDrawable
import com.rnmapbox.rnmbx.v11compat.image.toImageHolder
import com.rnmapbox.rnmbx.v11compat.location.*
import java.nio.ByteBuffer

enum class RenderMode {
    GPS, COMPASS, NORMAL
}

class RNMBXNativeUserLocation(context: Context) : AbstractMapFeature(context), OnMapReadyCallback, Style.OnStyleLoaded {
    private var mEnabled = true
    private var mMap: MapboxMap? = null
    private var mMBXMapView: RNMBXMapView? = null
    private var mRenderMode : RenderMode = RenderMode.NORMAL;
    private var mContext : Context = context

    private var imageManager: ImageManager? = null

    // region bearing
    var androidRenderMode: RenderMode? = null
    var puckBearing: PuckBearing? = null
    var puckBearingEnabled: Boolean? = null
    // endregion

    enum class PuckImagePart {
        TOP,
        BEARING,
        SHADOW
    }

    private var imageNames = mutableMapOf<PuckImagePart, String?>()
    private var subscriptions = mutableMapOf<PuckImagePart, Subscription>()
    private var images = mutableMapOf<PuckImagePart, ImageHolder>()

    var topImage: String?
        get() = imageNames[PuckImagePart.TOP]
        set(value) { imageNameUpdated(PuckImagePart.TOP, value) }

    var bearingImage: String?
        get() = imageNames[PuckImagePart.BEARING]
        set(value) { imageNameUpdated(PuckImagePart.BEARING, value) }

    var shadowImage: String?
        get() = imageNames[PuckImagePart.SHADOW]
        set(value) { imageNameUpdated(PuckImagePart.SHADOW, value) }

    var scale: Value? = null
        set(value) {
            field = value
            _apply()
        }

    var visible: Boolean = true
        set(value) {
            field = value
            _apply()
        }

    var pulsing: ReadableMap? = null
        set(value) {
            field = value
            _apply()
        }

    private fun imageNameUpdated(image: PuckImagePart, name: String?) {
        imageNames[image] = name
        mMBXMapView?.let {
            _fetchImages(it)
        }
    }

    private fun imageUpdated(image: PuckImagePart, imageHolder: ImageHolder?) {
        if (imageHolder != null) {
            images[image] = imageHolder
        } else {
            images.remove(image)
        }
        _apply()
    }

    private fun _apply() {
        mMapView?.let {
            it.mapView?.let {
                _apply(it)
            }
        }
    }

    private fun _apply(mapView: MapView) {
        val location2 = mapView.location2;

        if (visible) {
            if (images.isEmpty()) {
                location2.locationPuck =
                    makeDefaultLocationPuck2D(mContext, androidRenderMode ?: RenderMode.NORMAL)
            } else {
                location2.locationPuck = LocationPuck2D(
                    topImage = images[PuckImagePart.TOP],
                    bearingImage = images[PuckImagePart.BEARING],
                    shadowImage = images[PuckImagePart.SHADOW],
                    scaleExpression = scale?.toJson()
                )
            }
        } else {
            val empty =
                AppCompatResourcesV11.getDrawableImageHolder(mContext, R.drawable.empty)
            location2.locationPuck = LocationPuck2D(
                topImage = empty,
                bearingImage = empty,
                shadowImage = empty
            )
        }

        this.puckBearing?.let {
            location2.puckBearing = it
        }
        this.puckBearingEnabled?.let {
            location2.puckBearingEnabled = it
        }

        pulsing?.let { pulsing ->
            pulsing.getAndLogIfNotString("kind")?.also { kind ->
                if (kind == "default") {
                    location2.pulsingEnabled = true
                }
            }
            if (pulsing.hasKey("color")) {
                when (pulsing.getType("color")) {
                    ReadableType.Map ->
                        location2.pulsingColor = ColorPropConverter.getColor(pulsing.getMap("color"), mContext)
                    ReadableType.Number ->
                        location2.pulsingColor = pulsing.getInt("color")
                    else ->
                        Logger.e(LOG_TAG, "pusling.color should be either a map or a number, but was ${pulsing.getDynamic("color")}")
                }
            }
            pulsing.getAndLogIfNotBoolean("isEnabled")?.let { enabled ->
               location2.pulsingEnabled = enabled
            }
            if (pulsing.hasKey("radius")) {
                when (pulsing.getType("radius")) {
                    ReadableType.Number ->
                        location2.pulsingMaxRadius = pulsing.getDouble("radius").toFloat()
                    ReadableType.String ->
                        if (pulsing.getString("radius") == "accuracy") {
                            location2.pulsingMaxRadius = LocationComponentConstants.PULSING_MAX_RADIUS_FOLLOW_ACCURACY
                        } else {
                            Logger.e(LOG_TAG, "Expected pulsing/radius to be a number or accuracy but was ${pulsing.getString("radius")}")
                        }
                    else ->
                        Logger.e(LOG_TAG, "Expected pulsing/radius to be a number or accuracy but was ${pulsing.getString("radius")}")
                }
            }
        }
    }

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mEnabled = true
        mapView.getMapboxMap()
        mapView.getMapAsync(this)
        mMapView?.locationComponentManager?.showNativeUserLocation(true)
        mMBXMapView = mapView
        _fetchImages(mapView)
        _apply()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason): Boolean {
        mEnabled = false
        mMapView?.locationComponentManager?.showNativeUserLocation(false)
        mMap?.getStyle(this)
        mMBXMapView = null
        return super.removeFromMap(mapView, reason)
    }

    @SuppressLint("MissingPermission")
    override fun onMapReady(mapboxMap: MapboxMap) {
        mMap = mapboxMap
        mapboxMap.getStyle(this)
        _apply()
    }

    @SuppressLint("MissingPermission")
    override fun onStyleLoaded(style: Style) {
        val context = context
        if (!PermissionsManager.areLocationPermissionsGranted(context)) {
            return
        }

        mMapView?.locationComponentManager?.update()
        mMapView?.locationComponentManager?.showNativeUserLocation(mEnabled)
    }

    // region fetch images and subscribe on updates
    private fun subscribe(imageManager: ImageManager, image: PuckImagePart, name: String) {
        subscriptions[image]?.let {
            it.cancel()
            subscriptions.remove(image)
            Logger.e("RNMBXNativeUserLocation", "subscribe: there is alread a subscription for image: $image")
        }
        subscriptions[image] = imageManager.subscribe(name, Resolver { _, imageData  ->
            imageUpdated(image, imageData.toImageHolder())
        })
    }

    private fun removeSubscriptions() {
        subscriptions.forEach {
            it.value.cancel()
        }
        subscriptions.clear()
    }

    private fun _fetchImages(map: RNMBXMapView) {
        map.mapView?.getMapboxMap()?.getStyle()?.let { style ->
            imageNames.forEach { (part,name) ->
                if (name != null) {
                    if (style.hasStyleImage(name)) {
                        style.getStyleImage(name)?.let { image ->
                            images[part] = image.toImageHolder()
                        }
                    } else {
                        images.remove(part)
                    }
                } else {
                    images.remove(part)
                }
            }
        }
        removeSubscriptions()
        val imageManager = map.imageManager
        this.imageManager = imageManager
        _apply()
        imageNames.forEach { (part,name) ->
            if (name != null) {
                subscribe(imageManager, part, name)
            }
        }
    }
    // endregion

    companion object {
        const val LOG_TAG = "RNMBXNativeUserLocation"
    }
}

fun makeDefaultLocationPuck2D(context: Context, renderMode: RenderMode): LocationPuck2D {
    return LocationPuck2D(
        topImage = AppCompatResourcesV11.getDrawableImageHolder(
            context,
            LR.drawable.mapbox_user_icon
        ),
        bearingImage = AppCompatResourcesV11.getDrawableImageHolder(
            context,
            when (renderMode) {
                RenderMode.GPS -> LR.drawable.mapbox_user_bearing_icon
                RenderMode.COMPASS -> LR.drawable.mapbox_user_puck_icon
                RenderMode.NORMAL -> LR.drawable.mapbox_user_stroke_icon
            }
        ),
        shadowImage = AppCompatResourcesV11.getDrawableImageHolder(
            context,
            LR.drawable.mapbox_user_icon_shadow
        )
    );
}