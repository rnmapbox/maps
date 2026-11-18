package com.rnmapbox.rnmbx.components.location

/**
 * Applies location puck settings, recovering when the Maps SDK fails to re-add the puck layer.
 *
 * The location component keeps the last puck bearing it received, including NaN or Infinity.
 * The next time the puck layer is added, such as when the puck settings change,
 * `addPersistentStyleLayer` throws `IllegalArgumentException: Parse error at offset 165: Missing
 * a colon after a name of object member.` See https://github.com/mapbox/mapbox-maps-android/issues/2340
 *
 * Resetting the location component drops the puck state that holds the bad bearing, so the guard
 * resets it and applies once more. If the map is stopped, or the retry fails because the location
 * provider replays the same bearing, the component stays disabled and the next [apply] resets it.
 */
internal class LocationPuckGuard {
    interface Component {
        /** Whether the location component should be shown and the map is running. */
        val canReset: Boolean

        /** Disables and re-enables the location component. */
        fun reset()

        fun disable()
    }

    /** True while this guard keeps the location component disabled after a failure. */
    var disabledAfterError = false
        private set

    /** @return the failure that was recovered from, or null when [apply] succeeded the first time. */
    fun apply(component: Component, apply: () -> Unit): IllegalArgumentException? {
        val resetting = disabledAfterError && component.canReset
        try {
            if (resetting) {
                disabledAfterError = false
                component.reset()
            }
            apply()
            return null
        } catch (error: IllegalArgumentException) {
            if (!error.isAddLayerFailure()) throw error
            component.disable()
            disabledAfterError = true
            if (!resetting && component.canReset) {
                try {
                    component.reset()
                    apply()
                    disabledAfterError = false
                } catch (retryError: IllegalArgumentException) {
                    if (!retryError.isAddLayerFailure()) throw retryError
                    component.disable()
                    error.addSuppressed(retryError)
                }
            }
            return error
        }
    }
}

/**
 * Resets the location component for [LocationPuckGuard] without restarting the location provider.
 *
 * Giving up location that is on holds the provider briefly, so re-enabling does not restart it
 * before its stop completes (#4225). Location that is already off, or on a stopped map, is not held:
 * holding subscribes to the provider, which would start location collection.
 */
internal class LocationComponentReset(
    private val isRequested: () -> Boolean,
    private val isRunning: () -> Boolean,
    private val isEnabled: () -> Boolean,
    private val setEnabled: (Boolean) -> Unit,
    private val holdProvider: () -> Unit,
) : LocationPuckGuard.Component {
    override val canReset: Boolean
        get() = isRequested() && isRunning()

    override fun reset() {
        disable()
        setEnabled(true)
    }

    override fun disable() {
        if (isEnabled() && isRunning()) {
            holdProvider()
        }
        setEnabled(false)
    }
}

private fun IllegalArgumentException.isAddLayerFailure() =
    stackTrace.any { it.methodName == "addPersistentStyleLayer" }
