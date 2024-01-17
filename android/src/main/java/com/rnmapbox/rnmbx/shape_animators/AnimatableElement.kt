package com.rnmapbox.rnmbx.shape_animators

internal class AnimatableElement<T>(
    var source: T,
    var progress: T,
    var target: T,
    var startedAt: Long,
    var progressDurationSec: Double,
    var totalDurationSec: Double,
    /** A function returning the difference in meters between the two values. */
    var getDistanceRemaining: (a: T, b: T) -> Double
) {
    fun distanceRemaining(): Double {
        return getDistanceRemaining(source, target)
    }

    fun durationRatio(): Double {
        return if (totalDurationSec > 0.0) {
            progressDurationSec / totalDurationSec
        } else {
            0.0
        }
    }

    fun setProgress(value: T, currentTimestamp: Long) {
        progress = value
        progressDurationSec = (currentTimestamp - startedAt).toDouble() / 1000
    }

    fun reset(_source: T, _progress: T, _target: T, durationSec: Double, currentTimestamp: Long) {
        this.source = _source
        this.progress = _progress
        this.target = _target
        this.startedAt = currentTimestamp
        this.progressDurationSec = 0.0
        this.totalDurationSec = durationSec
    }
}