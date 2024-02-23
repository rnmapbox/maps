package com.rnmapbox.rnmbx.shapeAnimators

internal class AnimatableElement<T>(
    var source: T,
    var progress: T,
    var target: T,
    var startedAtSec: Double,
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
            1.0
        }
    }

    fun setProgress(value: T, animatorAgeSec: Double) {
        progress = value
        progressDurationSec = (animatorAgeSec - startedAtSec)
    }

    fun reset(_source: T, _progress: T, _target: T, durationSec: Double, animatorAgeSec: Double) {
        this.source = _source
        this.progress = _progress
        this.target = _target
        this.startedAtSec = animatorAgeSec
        this.progressDurationSec = 0.0
        this.totalDurationSec = durationSec
    }
}