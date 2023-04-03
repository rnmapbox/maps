package com.mapbox.rctmgl.components.camera

import android.animation.Animator
import android.content.Context
import android.location.Location
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.plugin.gestures.gestures
import com.mapbox.rctmgl.location.LocationManager.Companion.getInstance
import com.mapbox.maps.plugin.animation.flyTo
import com.mapbox.rctmgl.components.AbstractMapFeature
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView
import com.mapbox.rctmgl.components.location.LocationComponentManager
import com.mapbox.rctmgl.utils.LatLngBounds
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorBearingChangedListener
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorPositionChangedListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.mapbox.maps.*
import com.mapbox.maps.plugin.PuckBearingSource
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.maps.plugin.locationcomponent.location2
import com.mapbox.maps.plugin.viewport.ViewportStatus
import com.mapbox.maps.plugin.viewport.ViewportStatusObserver
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateBearing
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateOptions
import com.mapbox.maps.plugin.viewport.data.ViewportStatusChangeReason
import com.mapbox.maps.plugin.viewport.state.FollowPuckViewportState
import com.mapbox.maps.plugin.viewport.state.OverviewViewportState
import com.mapbox.maps.plugin.viewport.state.ViewportState
import com.mapbox.maps.plugin.viewport.viewport
import com.mapbox.rctmgl.components.RemovalReason
import com.mapbox.rctmgl.components.camera.constants.CameraMode
import com.mapbox.rctmgl.components.location.*
import com.mapbox.rctmgl.events.MapUserTrackingModeEvent
import com.mapbox.rctmgl.location.*
import com.mapbox.rctmgl.utils.Logger
import com.mapbox.rctmgl.utils.writableMapOf


class RCTMGLCamera(private val mContext: Context, private val mManager: RCTMGLCameraManager) :
    AbstractMapFeature(
        mContext
    ) {
    private var hasSentFirstRegion = false
    private var mDefaultStop: CameraStop? = null
    private var mCameraStop: CameraStop? = null
    private val mCameraUpdateQueue = CameraUpdateQueue()

    /*
    // private LocationComponent mLocationComponent;
     */
    private var mLocationComponentManager: LocationComponentManager? = null
    private var mUserTrackingMode = 0
    private var mUserTrackingState = UserTrackingState.POSSIBLE
    private val mLocationManager: LocationManager?
    private val mUserLocation: UserLocation = UserLocation()
    private val mCenterCoordinate: ScreenCoordinate? = null
    private val mAnimated = false
    private val mHeading = 0.0

    private var mFollowUserLocation = false
    private var mFollowUserMode: String? = null
    private var mFollowZoomLevel : Double? = null
    private var mFollowPitch : Double? = null
    private var mFollowHeading : Double? = null
    private var mFollowPadding : EdgeInsets? = null

    private var mZoomLevel = -1.0
    private var mMinZoomLevel : Double? = null
    private var mMaxZoomLevel : Double? = null
    private var mMaxBounds: LatLngBounds? = null


    private val mCameraCallback: Animator.AnimatorListener = object : Animator.AnimatorListener {
        override fun onAnimationStart(animator: Animator) {}
        override fun onAnimationEnd(animator: Animator) {
            if (!hasSentFirstRegion) {
                mMapView?.sendRegionChangeEvent(false)
                hasSentFirstRegion = true
            }
        }

        override fun onAnimationCancel(animator: Animator) {
            if (!hasSentFirstRegion) {
                mMapView?.sendRegionChangeEvent(false)
                hasSentFirstRegion = true
            }
        }

        override fun onAnimationRepeat(animator: Animator) {}
    }

    override fun addToMap(mapView: RCTMGLMapView) {
        super.addToMap(mapView)
        setInitialCamera()
        updateMaxBounds()
        mCameraStop?.let { updateCamera(it) }
        _observeViewportState(mapView.mapView)
        _updateViewportState()
    }

    override fun removeFromMap(mapView: RCTMGLMapView, reason: RemovalReason) : Boolean {
        if (reason == RemovalReason.STYLE_CHANGE) {
            return false
        } else {
            return super.removeFromMap(mapView, reason);
        }
    }
    fun setStop(stop: CameraStop) {
        mCameraStop = stop
        stop.setCallback(mCameraCallback)
        if (mMapView != null) {
            stop.let { updateCamera(it) }
        }
    }

    fun setDefaultStop(stop: CameraStop?) {
        mDefaultStop = stop
    }

    fun setFollowUserMode(mode: String?) {
        mFollowUserMode = mode
        _updateViewportState()
    }

    fun setFollowUserLocation(value: Boolean) {
        mFollowUserLocation = value
        _updateViewportState()
    }

    fun setFollowZoomLevel(zoomLevel: Double) {
        mFollowZoomLevel = zoomLevel
        _updateViewportState();
    }

    fun setFollowPitch(pitch: Double) {
        mFollowPitch = pitch
        _updateViewportState();
    }

    fun setFollowHeading(heading: Double) {
        mFollowHeading = heading
        _updateViewportState();
    }

    fun setFollowPadding(padding: ReadableMap) {
        // scale padding by pixel ratio
        val metrics = context.resources.displayMetrics
        val edgeInsets = EdgeInsets(
            if (padding.hasKey("paddingTop")) padding.getDouble("paddingTop") * metrics.density else 0.0,
            if (padding.hasKey("paddingLeft")) padding.getDouble("paddingLeft") * metrics.density else 0.0,
            if (padding.hasKey("paddingBottom")) padding.getDouble("paddingBottom") * metrics.density else 0.0,
            if (padding.hasKey("paddingRight")) padding.getDouble("paddingRight") * metrics.density else 0.0,
        )

        mFollowPadding = edgeInsets
        _updateViewportState();
    }

    fun setMaxBounds(bounds: LatLngBounds?) {
        mMaxBounds = bounds
        updateMaxBounds()
    }


    private fun updateMaxBounds() {
        withMapView { mapView ->
            val map = mapView.getMapboxMap()
            val maxBounds = mMaxBounds
            val builder = CameraBoundsOptions.Builder()

            if (maxBounds != null) {
                builder.bounds(maxBounds.toBounds())
            }
            mMinZoomLevel?.let { builder.minZoom(it) }
            mMaxZoomLevel?.let { builder.maxZoom(it) }
            map.setBounds(builder.build())
        }
    }

    private fun setInitialCamera() {
        mDefaultStop?.let {
            val mapView = mMapView!!
            val map = mapView.getMapboxMap()

            it.setDuration(0)
            it.setMode(CameraMode.NONE)
            val item = it.toCameraUpdate(mapView)
            item.run()
        }
    }

    private fun updateCamera(cameraStop: CameraStop) {
        mCameraUpdateQueue.offer(cameraStop)
        mCameraUpdateQueue.execute(mMapView)
    }

    private fun updateUserLocation(isAnimated: Boolean) {

    }

    // NOTE: The direction of this is used for map rotation only, not location layer rotation
    private val directionForUserLocationUpdate: Double
        private get() {
            // NOTE: The direction of this is used for map rotation only, not location layer rotation
            val currentCamera = mMapView!!.getMapboxMap().cameraState
            var direction = currentCamera.bearing
            val userTrackingMode = mUserLocation.trackingMode
            if (userTrackingMode == UserTrackingMode.FollowWithHeading || userTrackingMode == UserTrackingMode.FollowWithCourse) {
                direction = mUserLocation.bearing
            } else if (mHeading != 0.0) {
                direction = mHeading
            }
            return direction
        }

    private fun hasSetCenterCoordinate(): Boolean {
        val state = mapboxMap!!.cameraState
        val center = state.center
        return center.latitude() != 0.0 && center.longitude() != 0.0
    }

    init {
        mLocationManager = getInstance(mContext)
    }

    private fun updateLocationLayer(style: Style) {
        if (mLocationComponentManager == null) {
            mLocationComponentManager = mMapView!!.locationComponentManager
        }
        mLocationComponentManager!!.update()
    }

    fun setMinZoomLevel(zoomLevel: Double?) {
        mMinZoomLevel = zoomLevel
        updateMaxBounds()
    }

    fun setMaxZoomLevel(zoomLevel: Double?) {
        mMaxZoomLevel = zoomLevel
        updateMaxBounds()
    }

    fun setZoomLevel(zoomLevel: Double) {
        mZoomLevel = zoomLevel
        updateCameraPositionIfNeeded(false)
    }

    private fun buildCamera(
        previousPosition: CameraState,
        shouldUpdateTarget: Boolean
    ): CameraOptions {
        return if (shouldUpdateTarget) {
            previousPosition.toCameraOptions(mCenterCoordinate)
        } else {
            previousPosition.toCameraOptions(null)
        }
    }

    private fun updateCameraPositionIfNeeded(shouldUpdateTarget: Boolean) {
        if (mMapView != null) {
            val prevPosition = mapboxMap!!.cameraState
            val cameraUpdate =  /*CameraUpdateFactory.newCameraPosition(*/
                buildCamera(prevPosition, shouldUpdateTarget)
            if (mAnimated) {
                mapboxMap!!.flyTo(cameraUpdate, null)
            } else {
                mapboxMap!!.setCamera(cameraUpdate)
            }
        }
    }

    fun setUserTrackingMode(userTrackingMode: Int) {
        val oldTrackingMode = mUserTrackingMode
        mUserTrackingMode = userTrackingMode
        mManager.handleEvent(MapUserTrackingModeEvent(this@RCTMGLCamera, userTrackingMode))
        when (mUserTrackingMode) {
            UserTrackingMode.NONE -> mUserTrackingState = UserTrackingState.POSSIBLE
            UserTrackingMode.FOLLOW, UserTrackingMode.FollowWithCourse, UserTrackingMode.FollowWithHeading -> if (oldTrackingMode == UserTrackingMode.NONE) {
                mUserTrackingState = UserTrackingState.POSSIBLE
            }
        }
        if (mapboxMap != null) {
            updateLocationLayer(mapboxMap!!.getStyle()!!)
        }
    }

    fun toFollowUserLocation(toStatus: ViewportStatus): Boolean {
        when (toStatus) {
            ViewportStatus.Idle -> return false
            is ViewportStatus.State -> return true
            is ViewportStatus.Transition -> return true
        }
    }

    fun toFollowUserMode(state: ViewportState): String? {
        if (state is FollowPuckViewportState) {
            when (state.options.bearing) {
                is FollowPuckViewportStateBearing.SyncWithLocationPuck ->
                    return "normal"
                is FollowPuckViewportStateBearing.Constant ->
                    return "constant"
                else -> {
                    Logger.w(LOG_TAG, "Unexpected bearing: ${state.options.bearing}")
                    return "normal"
                }
            }
        } else if (state is OverviewViewportState) {
            return "overview"
        } else {
            return "custom"
        }
    }

    fun toFollowUserMode(status: ViewportStatus): String? {
        when (status) {
            ViewportStatus.Idle -> return null
            is ViewportStatus.State ->
                return toFollowUserMode(status)
            is ViewportStatus.Transition ->
                return toFollowUserMode(status.toState)
        }
    }

    fun toReadableMap(status: ViewportStatus): ReadableMap {
        when (status) {
            ViewportStatus.Idle -> return writableMapOf("state" to "idle")
            is ViewportStatus.State ->
                return writableMapOf(
                    "state" to status.toString()
                )
            is ViewportStatus.Transition ->
                return writableMapOf(
                    "transition" to status.toString()
                )
        }
    }

    fun _observeViewportState(mapView: MapView) {
        mapView.viewport.addStatusObserver(object: ViewportStatusObserver {
            override fun onViewportStatusChanged(
                fromStatus: ViewportStatus,
                toStatus: ViewportStatus,
                reason: ViewportStatusChangeReason
            ) {
                if (reason == ViewportStatusChangeReason.USER_INTERACTION) {
                    val followUserLocation = toFollowUserLocation(toStatus)



                    mManager.handleEvent(MapUserTrackingModeEvent(this@RCTMGLCamera, UserTrackingMode.NONE,
                    writableMapOf(
                        "followUserMode" to toFollowUserMode(toStatus),
                        "followUserLocation" to followUserLocation,
                        "fromViewportState" to toReadableMap(fromStatus),
                        "toViewportState" to toReadableMap(toStatus),
                        "reason" to toString(reason),
                    )
                    ))
                }
            }
        })
    }

    fun toString(reason: ViewportStatusChangeReason): String {
        when (reason) {
            ViewportStatusChangeReason.IDLE_REQUESTED ->
                return "idleRequested"
            ViewportStatusChangeReason.TRANSITION_FAILED ->
                return "transitionFailed"
            ViewportStatusChangeReason.TRANSITION_STARTED ->
                return "transitionStarted"
            ViewportStatusChangeReason.TRANSITION_SUCCEEDED ->
                return "transitionSucceeded"
            ViewportStatusChangeReason.USER_INTERACTION ->
                return "userInteraction"
            else -> {
                Logger.w(LOG_TAG, "toString; unkown reason: ${reason}")
                return "unkown: $reason"
            }
        }
    }

    fun _updateViewportState() {
        mMapView?.let {
            val map = it.mapView
            val viewport = map.viewport;

            if (mLocationComponentManager == null) {
                mLocationComponentManager = it.locationComponentManager
            }

            if (mFollowUserLocation == false) {
                viewport.idle()
                mLocationComponentManager?.setFollowLocation(false)
                return;
            }

            mLocationComponentManager?.setFollowLocation(true)
            mLocationManager?.let {
                val provider = map.location.getLocationProvider()
                if (provider != null) {
                    it.provider = provider
                }
            }

            val location = map.location2
            val followOptions = FollowPuckViewportStateOptions.Builder()
            val cameraState = map.getMapboxMap().cameraState
            when (mFollowUserMode ?: "normal") {
                "compass" -> {
                    location.puckBearingEnabled = true
                    location.puckBearingSource = PuckBearingSource.HEADING
                    followOptions.bearing(FollowPuckViewportStateBearing.SyncWithLocationPuck)
                }
                "course" -> {
                    location.puckBearingEnabled = true
                    location.puckBearingSource = PuckBearingSource.COURSE
                    followOptions.bearing(FollowPuckViewportStateBearing.SyncWithLocationPuck)
                }
                "normal" -> {
                    location.puckBearingEnabled = false
                    when(val it=mFollowHeading) {
                        null -> followOptions.bearing( FollowPuckViewportStateBearing.Constant(
                            cameraState.bearing
                        ))
                        else -> followOptions.bearing( FollowPuckViewportStateBearing.Constant(
                            cameraState.bearing
                        ))
                    }
                }
                else -> {
                    Logger.e("RCTMGLCamera", "unexpected follow mode: $mFollowUserMode")
                }
            }

            when(val it=mFollowZoomLevel) {
                null -> followOptions.zoom(cameraState.zoom)
                else -> followOptions.zoom(it)
            }

            when(val it=mFollowPitch) {
                null -> followOptions.pitch(cameraState.pitch)
                else -> followOptions.pitch(it)
            }

            when(val it=mFollowPadding) {
                null -> followOptions.padding(cameraState.padding)
                else -> followOptions.padding(it)
            }


            val followState = viewport.makeFollowPuckViewportState(followOptions.build())
            viewport.transitionTo(followState)
        }
        mapboxMap?.let {
            it.getStyle()?.let {
                updateLocationLayer(it)
            }
        }
    }

    private fun updatedFollowUserMode() {
        if (mFollowUserLocation) {
            setUserTrackingMode(UserTrackingMode.fromString(mFollowUserMode))
        } else {
            setUserTrackingMode(UserTrackingMode.NONE)
        }
    }

    val mapboxMap: MapboxMap?
        get() = if (mMapView == null) {
            null
        } else mMapView!!.getMapboxMap()

    /**
     * Create a payload of the location data per the web api geolocation spec
     * https://dev.w3.org/geo/api/spec-source.html#position
     *
     * @return
     */
    private fun makeLocationChangePayload(location: Location): WritableMap {
        val positionProperties: WritableMap = WritableNativeMap()
        val coords: WritableMap = WritableNativeMap()
        coords.putDouble("longitude", location.longitude)
        coords.putDouble("latitude", location.latitude)
        coords.putDouble("altitude", location.altitude)
        coords.putDouble("accuracy", location.accuracy.toDouble())
        // A better solution will be to pull the heading from the compass engine, 
        // unfortunately the api is not publicly available in the mapbox sdk
        coords.putDouble("heading", location.bearing.toDouble())
        coords.putDouble("course", location.bearing.toDouble())
        coords.putDouble("speed", location.speed.toDouble())
        positionProperties.putMap("coords", coords)
        positionProperties.putDouble("timestamp", location.time.toDouble())
        return positionProperties
    }

    companion object {
        const val USER_LOCATION_CAMERA_MOVE_DURATION = 1000
        const val minimumZoomLevelForUserTracking = 10.5
        const val defaultZoomLevelForUserTracking = 14.0
        const val LOG_TAG = "RCTMGLCamera"
    }
}