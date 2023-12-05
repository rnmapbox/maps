package com.rnmapbox.rnmbx.components.camera

import android.content.Context
import android.util.Log
import androidx.annotation.RequiresPermission.Read
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.UIManager
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.viewport.CompletionListener
import com.mapbox.maps.plugin.viewport.ViewportPlugin
import com.mapbox.maps.plugin.viewport.ViewportStatus
import com.mapbox.maps.plugin.viewport.ViewportStatusObserver
import com.mapbox.maps.plugin.viewport.data.DefaultViewportTransitionOptions
import com.mapbox.maps.plugin.viewport.data.ViewportStatusChangeReason
import com.mapbox.maps.plugin.viewport.state.FollowPuckViewportState
import com.mapbox.maps.plugin.viewport.state.OverviewViewportState
import com.mapbox.maps.plugin.viewport.state.ViewportState
import com.mapbox.maps.plugin.viewport.transition.DefaultViewportTransition
import com.mapbox.maps.plugin.viewport.transition.ViewportTransition
import com.mapbox.maps.plugin.viewport.viewport
import com.rnmapbox.rnmbx.components.AbstractMapFeature
import com.rnmapbox.rnmbx.components.mapview.RNMBXMapView
import com.rnmapbox.rnmbx.modules.RNMBXLogging
import com.rnmapbox.rnmbx.utils.Logger
import com.rnmapbox.rnmbx.utils.extensions.*
import com.rnmapbox.rnmbx.utils.writableMapOf

import com.facebook.react.uimanager.events.Event
import com.mapbox.geojson.Geometry
import com.mapbox.maps.EdgeInsets
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateBearing
import com.mapbox.maps.plugin.viewport.data.FollowPuckViewportStateOptions
import com.mapbox.maps.plugin.viewport.data.OverviewViewportStateOptions
import com.rnmapbox.rnmbx.events.constants.EventKeys

class BaseEvent(
    private val surfaceId: Int,
    private val viewTag: Int,
    private val eventName: String,
    private val eventData: WritableMap,
    private val canCoalesce: Boolean = false
): Event<BaseEvent>(surfaceId, viewTag) {
    override fun getEventName(): String {
        return eventName
    }

    override fun canCoalesce(): Boolean {
        return canCoalesce
    }

    override fun getEventData(): WritableMap? {
        return eventData
    }
}

class RNMBXViewport(private val mContext: Context, private val mManager: RNMBXViewportManager) :
AbstractMapFeature(
mContext
) {
    // region properties
    var transitionsToIdleUponUserInteraction: Boolean? = null
        set(value: Boolean?) {
            field = value
            if (value != null) {
                mMapView?.let { applyTransitionsToIdleUponUserIntraction(it.mapView) }
            }
        }

    fun applyTransitionsToIdleUponUserIntraction(mapView: MapView) {
        this.transitionsToIdleUponUserInteraction?.let {
            mapView.viewport.options = mapView.viewport.options.toBuilder().transitionsToIdleUponUserInteraction(it).build()
        }
    }

    var hasStatusChanged: Boolean = false
        set(value: Boolean) {
            field = value
            mMapView?.let { applyHasStatusChanged(it.mapView) }
        }
    private var statusObserver: ViewportStatusObserver? = null

    private fun applyHasStatusChanged(mapView: MapView) {
        val viewport = mapView.viewport
        if (hasStatusChanged) {
            if (statusObserver == null) {
                val statusObserver = ViewportStatusObserver { from, to, reason ->
                    val payload = writableMapOf("from" to statusToMap(from), "to" to statusToMap(to), "reason" to reasonToSrting(reason))
                    mManager.dispatchEvent(
                        BaseEvent(
                            UIManagerHelper.getSurfaceId(mContext),
                            id,
                            EventKeys.VIEWPORT_STATUS_CHANGE.value,
                            writableMapOf(
                                "type" to "statuschanged",
                                "payload" to payload
                            )
                        )
                    )
                }
                this.statusObserver = statusObserver
                viewport.addStatusObserver(statusObserver)
            }
        } else {
            statusObserver?.let {
                viewport.removeStatusObserver(it)
            }
        }
    }
    // endregion

    override fun addToMap(mapView: RNMBXMapView) {
        super.addToMap(mapView)
        applyTransitionsToIdleUponUserIntraction(mapView.mapView)
        applyHasStatusChanged(mapView.mapView)
    }

    private fun toState(viewport: ViewportPlugin, state: ReadableMap): ViewportState? {
        return when (val kind = state.getAndLogIfNotString("kind")) {
            "followPuck" -> viewport.makeFollowPuckViewportState(
                parseFollowViewportOptions(state)
            )
            "overview" -> return viewport.makeOverviewViewportState(
                parseOverviewViewportOption(state)
            )
            else -> {
                Logger.e(LOG_TAG, "toState: unexpected state: $kind")
                null
            }
        }
    }

    data class FollowPuckViewportStateBearingOrNull(val state: FollowPuckViewportStateBearing?)
    private fun parseFollowViewportOptions(state: ReadableMap): FollowPuckViewportStateOptions {
        val builder = FollowPuckViewportStateOptions.Builder()
        state.getAndLogIfNotMap("options", LOG_TAG)?.let { options ->
            if (options.hasKey("zoom")) {
                if (options.isKeep("zoom")) {
                    builder.zoom(null)
                } else {
                    options.getAndLogIfNotDouble("zoom", LOG_TAG)?.let { zoom ->
                        builder.zoom(zoom)
                    }
                }
            }
            if (options.hasKey("pitch")) {
                if (options.isKeep("pitch")) {
                    builder.pitch(null)
                } else {
                    options.getAndLogIfNotDouble("pitch", LOG_TAG)?.let {pitch ->
                        builder.pitch(pitch)
                    }
                }
            }

            if (options.hasKey("bearing")) {
                when (options.getType("bearing")) {
                    ReadableType.Number ->
                        FollowPuckViewportStateBearingOrNull(FollowPuckViewportStateBearing.Constant(options.getDouble("bearing")))

                    ReadableType.String ->
                        when (options.getString("bearing")) {
                            "course" ->
                                FollowPuckViewportStateBearingOrNull(FollowPuckViewportStateBearing.SyncWithLocationPuck)
                            "heading" ->
                                FollowPuckViewportStateBearingOrNull(FollowPuckViewportStateBearing.SyncWithLocationPuck)
                            "keep" ->
                                FollowPuckViewportStateBearingOrNull(null)
                            else -> {
                                Logger.e(
                                    LOG_TAG,
                                    "bearing in viewport options should be either a constant number or syncWithLocationPuck"
                                )
                                null
                            }
                        }
                    else -> {
                        Logger.e(
                            LOG_TAG,
                        "bearing in viewport options should be either constant number or course or heading or keep"
                        )
                        null
                    }
                }?.let { bearing ->
                    builder.bearing(bearing.state)
                }
            }
            if (options.hasKey("padding")) {
                if (options.isNull("padding")) {
                    builder.padding(null)
                } else {
                    options.getAndLogIfNotMap("padding", LOG_TAG)?.let { paddingMap ->
                        paddingMap?.toPadding(LOG_TAG, resources.displayMetrics.density)?.let { padding ->
                            builder.padding(padding)
                        }
                    }
                }
            }
        }
        return builder.build()
    }

    private fun parseOverviewViewportOption(state: ReadableMap): OverviewViewportStateOptions {
        val builder = OverviewViewportStateOptions.Builder()

        state.getAndLogIfNotMap("options", LOG_TAG)?.let { options ->
            if (options.hasKey("padding")) {
                if (!options.isNull("padding")) {
                    options.getAndLogIfNotMap("padding", LOG_TAG)?.let { paddingMap ->
                        paddingMap?.toPadding(LOG_TAG, resources.displayMetrics.density)?.let { padding ->
                            builder.padding(padding)
                        }
                    }
                }
            }

            if (options.hasKey("bearing")) {
                when (options.getType("bearing")) {
                    ReadableType.Number ->
                        builder.bearing(options.getDouble("bearing"))
                    ReadableType.Null ->
                        builder.bearing(null)
                    else -> {
                        Logger.e(
                            LOG_TAG,
                            "bearing in viewport options should be either constant number or null"
                        )
                        null
                    }
                }
            }

            if (options.hasKey("pitch")) {
                if (options.isNull("pitch")) {
                    builder.pitch(null)
                } else {
                    options.getAndLogIfNotDouble("pitch", LOG_TAG)?.let {pitch ->
                        builder.pitch(pitch)
                    }
                }
            }

            if (options.hasKey("animationDuration")) {
                if (!options.isNull("animationDuration")) {
                    options.getAndLogIfNotDouble("zoom", LOG_TAG)?.let { duration ->
                        builder.animationDurationMs((duration * 1000.0).toLong())
                    }
                }
            }

            if (options.hasKey("geometry")) {
                options.getAndLogIfNotMap("geometry")?.let {map ->
                    map.toGeometry()?.let { geometry ->
                        builder.geometry(geometry)
                    }
                }
            }
        }

        return builder.build()
    }


    private fun toDefaultViewportTransitionOptions(state: ReadableMap?): DefaultViewportTransitionOptions {
        val builder = DefaultViewportTransitionOptions.Builder()
        if (state?.hasKey("maxDurationMs") == true) {
            val maxDurationMs = state.getAndLogIfNotDouble("maxDurationMs", LOG_TAG)
            if (maxDurationMs != null) {
                builder.maxDurationMs(maxDurationMs.toLong())
            }
            builder.build()
        }
        return builder.build()
    }

    private fun toGeometry(geometry: ReadableMap): Geometry? {
        return geometry.toGeometry()
    }

    private fun toTransition(viewport: ViewportPlugin, state: ReadableMap?): ViewportTransition? {
        viewport.idle()
        return when (val kind = state?.getAndLogIfNotString("kind", LOG_TAG)) {
            "default" -> viewport.makeDefaultViewportTransition(
               toDefaultViewportTransitionOptions(state?.getMap("options"))
            )
            "immediate" -> viewport.makeImmediateViewportTransition()
            null -> null
            else -> {
                Logger.e(LOG_TAG, "toTransition: unexpected transition to: $kind")
                null
            }
        }
    }

    fun transitionTo(state: ReadableMap,
                     transition: ReadableMap?,
                     promise: Promise
    ) {
        val mapView = mMapView
        if (mapView == null) {
            Logger.e(LOG_TAG, "transitionTo: mapView is null")
            return
        }

        val toState = toState(mapView.mapView.viewport, state)
        if (toState == null) {
            Logger.e(LOG_TAG, "transitionTo: no state to transition to: $state")
            return;
        }
        val transition = toTransition(mapView.mapView.viewport, transition)

        mapView.mapView.viewport.transitionTo(toState, transition, CompletionListener { promise.resolve(it) } )
    }

    fun idle() {
        val mapView = mMapView
        if (mapView == null) {
            Logger.e(LOG_TAG, "transitionTo: mapView is null")
            return
        }

        mapView.mapView.viewport.idle()
    }

    private fun transitionToMap(transition: ViewportTransition): WritableMap? {
        return when (transition) {
            is DefaultViewportTransition -> writableMapOf("kind" to "default", "maxDurationMs" to transition.options.maxDurationMs)
            else ->
                if (transition.javaClass.toString().indexOf("ImmediateViewportTransition") >= 0) {
                    writableMapOf("kind" to "immediate")
                } else {
                    writableMapOf("kind" to "unknown")
                }
        }
    }

    private fun stateToMap(state: ViewportState): WritableMap? {
        return when (state) {
            is FollowPuckViewportState -> writableMapOf("kind" to "followPuck")
            is OverviewViewportState -> writableMapOf("kind" to "overview")
            else -> {
                writableMapOf("kind" to "custom", "impl" to state.javaClass.toString())
            }
        }
    }

    private fun statusToMap(status: ViewportStatus): WritableMap? {
        return when (status) {
            is ViewportStatus.Idle -> {
                writableMapOf(
                    "kind" to "idle"
                )
            }

            is ViewportStatus.State -> {
                writableMapOf(
                    "kind" to "state",
                    "state" to stateToMap(status.state)
                )
            }

            is ViewportStatus.Transition -> {
                writableMapOf(
                    "kind" to "transition",
                    "transition" to transitionToMap(status.transition),
                    "toState" to stateToMap(status.toState)
                )
            }
        }
    }

    private fun reasonToSrting(reason: ViewportStatusChangeReason): String {
        return when (reason) {
           ViewportStatusChangeReason.IDLE_REQUESTED -> "IdleRequested"
            ViewportStatusChangeReason.TRANSITION_FAILED -> "TransitionFailed"
            ViewportStatusChangeReason.TRANSITION_STARTED -> "TransitionStarted"
            ViewportStatusChangeReason.USER_INTERACTION -> "UserInteraction"
            ViewportStatusChangeReason.TRANSITION_SUCCEEDED -> "TransitionSucceeded"
            else -> {
                "Unknown:${reason.toString()}"
            }
        }
    }

    fun getState(): WritableMap? {
        val mapView = mMapView
        if (mapView == null) {
            Logger.e(LOG_TAG, "getState: mapView is null")
            return null
        }
        return statusToMap(mapView.mapView.viewport.status)
    }

    companion object {
        const val LOG_TAG = "RNMBXViewport"
    }
}

private fun ReadableMap.isKeep(s: String): Boolean {
    return ((getType(s) == ReadableType.String) && (getString(s) == "keep"))
}


