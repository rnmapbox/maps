package com.rnmapbox.rnmbx.components.camera

import android.animation.Animator
import android.content.Context
import android.location.Location
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableMap
import com.mapbox.maps.plugin.gestures.gestures
import com.rnmapbox.rnmbx.location.LocationManager.Companion.getInstance
import com.mapbox.maps.plugin.animation.flyTo
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.components.location.LocationComponentManager
import com.rnmapbox.rnmbx.utils.LatLngBounds
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorBearingChangedListener
import com.mapbox.maps.plugin.locationcomponent.OnIndicatorPositionChangedListener
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.uimanager.annotations.ReactProp
import com.mapbox.maps.*
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.maps.plugin.viewport.ViewportStatus
import com.mapbox.maps.plugin.viewport.ViewportStatusObserver
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateBearing
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateOptions
import com.mapbox.maps.plugin.viewport.data.ViewportStatusChangeReason
import com.mapbox.maps.plugin.viewport.state.FollowPuckViewportState
import com.mapbox.maps.plugin.viewport.state.OverviewViewportState
import com.mapbox.maps.plugin.viewport.state.ViewportState
import com.mapbox.maps.plugin.viewport.viewport
import com.rnmapbox.rnmbx.components.RemovalReason
import com.rnmapbox.rnmbx.components.camera.constants.CameraMode
import com.rnmapbox.rnmbx.components.location.*
import com.rnmapbox.rnmbx.events.MapUserTrackingModeEvent
import com.rnmapbox.rnmbx.location.*
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.writableMapOf

import com.rnmapbox.rnmbx.v11compat.location.*;

class RNMBXCamera(private val mContext: Context, private val mManager: RNMBXCameraManager) :
    AbstractMapFeature(
        mContext
    ) {
    override var requiresStyleLoad = false

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

    private var mFollowUserLocation = defaultFollowUserLocation
    private var mFollowUserMode: String? = null
    private var mFollowZoomLevel : Double? = null
    private var mFollowPitch : Double? = null
    private var mFollowHeading : Double? = null
    private var mFollowPadding : EdgeInsets? = null

    private var mZoomLevel = -1.0
    private var mMinZoomLevel : Double? = null
    private var mMaxZoomLevel : Double? = null
    private var mMaxBounds: LatLngBounds? = null


    var ts: Int? = null;


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

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        mapView.callIfAttachedToWindow {
            withMapView { mapView ->
                setInitialCamera(mapView)
                updateMaxBounds(mapView)
                mCameraStop?.let { updateCamera(it, mapView) }
            }
        }
        _observeViewportState(mapView.mapView)
        _updateViewportState()
    }

    override fun removeFromMap(mapView: RNMBXMapView, reason: RemovalReason) : Boolean {
        if (reason == RemovalReason.STYLE_CHANGE) {
            return false
        } else {
            return super.removeFromMap(mapView, reason);
        }
    }
    fun setStop(stop: CameraStop) {
        mCameraStop = stop
        stop.setCallback(mCameraCallback)
        withMapView { mapView ->
            stop.let { updateCamera(it, mapView) }
        }
    }

    fun updateCameraStop(map: ReadableMap) {
        val stop = CameraStop.fromReadableMap(mContext, map, null)
        setStop(stop)
    }

    fun setDefaultStop(stop: CameraStop?) {
        mDefaultStop = stop
    }

    fun setFollowUserMode(mode: String?) {
        mFollowUserMode = mode
        _updateViewportState()
    }

    fun setFollowUserLocation(value: Boolean?) {
        mFollowUserLocation = value ?: defaultFollowUserLocation
        _updateViewportState()
    }

    fun setFollowZoomLevel(zoomLevel: Double?) {
        mFollowZoomLevel = zoomLevel
        _updateViewportState();
    }

    fun setFollowPitch(pitch: Double?) {
        mFollowPitch = pitch
        _updateViewportState();
    }

    fun setFollowHeading(heading: Double?) {
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
        withMapView { mapView ->
            updateMaxBounds(mapView)
        }
    }


    private fun updateMaxBounds(mapView: RNMBXMapView) {
        val map = mapView.getMapboxMap()
        val builder = CameraBoundsOptions.Builder()
        builder.bounds(mMaxBounds?.toBounds())
        builder.minZoom(mMinZoomLevel ?: 0.0) // Passing null does not reset this value.
        builder.maxZoom(mMaxZoomLevel ?: 25.0) // Passing null does not reset this value.
        map.setBounds(builder.build())
        mCameraStop?.let { updateCamera(it, mapView) }
    }

    private fun setInitialCamera(mapView: RNMBXMapView) {
        mDefaultStop?.let {
            val map = mapView.getMapboxMap()

            it.setDuration(0)
            it.setMode(CameraMode.NONE)
            val item = it.toCameraUpdate(mapView)
            item.run()
        }
    }

    private fun updateCamera(cameraStop: CameraStop, mapView: RNMBXMapView) {
        mCameraUpdateQueue.offer(cameraStop)
        mCameraUpdateQueue.execute(mapView)
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
        withMapView { updateMaxBounds(it) }
    }

    fun setMaxZoomLevel(zoomLevel: Double?) {
        mMaxZoomLevel = zoomLevel
        withMapView { updateMaxBounds(it) }
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
        mManager.handleEvent(MapUserTrackingModeEvent(this@RNMBXCamera, userTrackingMode))
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
                return toFollowUserMode(status.state)
            is ViewportStatus.Transition ->
                return toFollowUserMode(status.toState)
        }
    }

    fun toUserTrackingMode(state: ViewportState): Int {
        when (state) {
            is FollowPuckViewportState -> {
                return when (state.options.bearing) {
                    is FollowPuckViewportStateBearing.SyncWithLocationPuck -> {
                        val location = mMapView?.mapView?.location2
                        if (location?.puckBearingEnabled == true) {
                            when (location.puckBearingSource) {

                                PuckBearing.HEADING -> {
                                    UserTrackingMode.FollowWithHeading
                                }
                                PuckBearing.COURSE -> {
                                    UserTrackingMode.FollowWithCourse
                                }
                                else -> {
                                    UserTrackingMode.FOLLOW
                                }
                            }
                        } else {
                            UserTrackingMode.FOLLOW
                        }
                    }

                    is FollowPuckViewportStateBearing.Constant ->
                        UserTrackingMode.FOLLOW

                    else -> {
                        Logger.w(LOG_TAG, "Unexpected bearing: ${state.options.bearing}")
                        UserTrackingMode.FOLLOW
                    }
                }
            }

            is OverviewViewportState -> {
                return UserTrackingMode.NONE
            }

            else -> {
                return UserTrackingMode.NONE // TODO
            }
        }
    }

    fun toUserTrackingMode(status: ViewportStatus): Int {
        return when (status) {
            ViewportStatus.Idle -> UserTrackingMode.NONE
            is ViewportStatus.State ->
                toUserTrackingMode(status.state)

            is ViewportStatus.Transition ->
                toUserTrackingMode(status.toState)
        }
    }

    fun toReadableMap(status: ViewportStatus): ReadableMap {
        return when (status) {
            ViewportStatus.Idle -> writableMapOf("state" to "idle")
            is ViewportStatus.State ->
                writableMapOf(
                    "state" to status.toString()
                )

            is ViewportStatus.Transition ->
                writableMapOf(
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
                if (reason == ViewportStatusChangeReason.USER_INTERACTION || reason == ViewportStatusChangeReason.TRANSITION_SUCCEEDED) {
                    val followUserLocation = toFollowUserLocation(toStatus)

                    val mode = toUserTrackingMode(toStatus)
                    mManager.handleEvent(MapUserTrackingModeEvent(this@RNMBXCamera, mode,
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
                    location.puckBearingSource = PuckBearing.HEADING
                    followOptions.bearing(FollowPuckViewportStateBearing.SyncWithLocationPuck)
                }
                "course" -> {
                    location.puckBearingEnabled = true
                    location.puckBearingSource = PuckBearing.COURSE
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
                    Logger.e("RNMBXCamera", "unexpected follow mode: $mFollowUserMode")
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
        const val LOG_TAG = "RNMBXCamera"

        const val defaultFollowUserLocation = false
    }
}