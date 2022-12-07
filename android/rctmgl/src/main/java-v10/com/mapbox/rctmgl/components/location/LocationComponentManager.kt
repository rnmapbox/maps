package com.mapbox.rctmgl.components.location

import android.content.Context
import android.graphics.Color
import android.graphics.drawable.VectorDrawable
import androidx.appcompat.content.res.AppCompatResources
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.maps.Style
import com.mapbox.maps.plugin.LocationPuck2D
import com.mapbox.rctmgl.R
import com.mapbox.rctmgl.location.LocationManager

/**
 * The LocationComponent on android implements display of user's current location.
 * But viewport seems to be tied to it in the sense that if location is not enbabled then it's viewport user tracking is not working.
 * LocationComponentManager attempts to separate that, so that Camera can ask for location tracking independent of display of user current location.
 * And NativeUserLocation can ask for display of user's current location - independent of Camera's user tracking.
 */
class LocationComponentManager(mapView: RCTMGLMapView, context: Context) {
    private var mShowNativeUserLocation = false
    private var mFollowLocation = false
    var mMapView = mapView
    var mContext = context
    var mState = State(enabled=true, hidden=false, tintColor= null)
    var mLocationManager: LocationManager? = LocationManager.getInstance(context!!)

    data class State(
        val enabled: Boolean, // in case followUserLocation is active or visible
        val hidden: Boolean, // in case it isn't native
        val tintColor: Int?, // tint of location puck
    )

    fun showNativeUserLocation(showUserLocation: Boolean) {
        mShowNativeUserLocation = showUserLocation

        _applyChanges()
    }

    fun setFollowLocation(followLoation: Boolean) {
        mFollowLocation = followLoation

        _applyChanges()
    }

    fun update(style: Style) {
        _applyChanges()
    }

    fun setRenderMode(renderMode: RenderMode) {
        _applyChanges()
    }

    fun _applyChanges() {
        mMapView?.let {
            val newState = State(
                enabled = mShowNativeUserLocation || mFollowLocation,
                hidden = !mShowNativeUserLocation,
                tintColor = mMapView!!.tintColor,
            )

            if (! mState.equals(newState)) {
                it.location.updateSettings {
                    val trackLocation = true
                    enabled = newState.enabled

                    if ((newState.hidden != mState.hidden) || (newState.tintColor != mState.tintColor)) {
                        if (newState.hidden) {
                            var emptyLocationPuck = LocationPuck2D()
                            val empty = AppCompatResources.getDrawable(mContext!!, R.drawable.empty)
                            emptyLocationPuck.bearingImage = empty
                            emptyLocationPuck.shadowImage = empty
                            emptyLocationPuck.topImage = empty
                            //emptyLocationPuck.opacity = 0.0
                            locationPuck = emptyLocationPuck
                            pulsingEnabled = false
                        } else {
                            val mapboxBlueColor = Color.parseColor("#4A90E2")
                            val tintColor = newState.tintColor
                            val defaultLocationPuck = LocationPuck2D()
                            var topImage = AppCompatResources.getDrawable(mContext!!, R.drawable.mapbox_user_icon)
                            if (tintColor != null) {
                                val drawable = topImage as VectorDrawable?
                                drawable!!.setTint(tintColor)
                                topImage = drawable
                            }
                            defaultLocationPuck.topImage = topImage
                            val bearingImage = AppCompatResources.getDrawable(
                                mContext!!, R.drawable.mapbox_user_stroke_icon
                            )
                            defaultLocationPuck.bearingImage = bearingImage
                            val shadowImage = AppCompatResources.getDrawable(
                                mContext!!, R.drawable.mapbox_user_icon_shadow
                            )
                            defaultLocationPuck.shadowImage = shadowImage
                            locationPuck = defaultLocationPuck
                            pulsingEnabled = true
                            if (tintColor != null) {
                                pulsingColor = tintColor
                            } else {
                                pulsingColor = mapboxBlueColor
                            }
                        }
                    }
                }

                if (newState.enabled != mState.enabled) {
                    if (newState.enabled) {
                        mLocationManager?.startCounted()
                        val provider = mLocationManager?.provider
                        if (provider != null) {
                            it.location.setLocationProvider(provider)
                        }
                    } else {
                        mLocationManager?.stopCounted()
                    }
                }

                mState = newState;
            }


        }
    }
}