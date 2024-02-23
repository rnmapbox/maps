import Foundation

internal class AnimatableElement<T> {
  var source: T
  var progress: T
  var target: T
  var startedAtSec: TimeInterval
  var progressDurationSec: TimeInterval
  var totalDurationSec: TimeInterval
  /// A function returning the difference in meters between the two values.
  var getDistanceRemaining: (_ a: T, _ b: T) -> Double
  
  init(source: T, progress: T, target: T, startedAtSec: TimeInterval, progressDurationSec: TimeInterval, totalDurationSec: TimeInterval, getDistanceRemaining: @escaping (_: T, _: T) -> Double) {
    self.source = source
    self.progress = progress
    self.target = target
    self.startedAtSec = startedAtSec
    self.progressDurationSec = progressDurationSec
    self.totalDurationSec = totalDurationSec
    self.getDistanceRemaining = getDistanceRemaining
  }
  
  func distanceRemaining() -> Double {
    getDistanceRemaining(source, target)
  }
  
  func durationRatio() -> Double {
    if (totalDurationSec > 0) {
      return progressDurationSec / totalDurationSec
    } else {
      return 1
    }
  }
  
  func setProgress(value: T, animatorAgeSec: TimeInterval) {
    progress = value
    progressDurationSec = animatorAgeSec - startedAtSec
  }
  
  func reset(_source: T, _progress: T, _target: T, durationSec: TimeInterval, animatorAgeSec: TimeInterval) {
    self.source = _source
    self.progress = _progress
    self.target = _target
    self.startedAtSec = animatorAgeSec
    self.progressDurationSec = 0
    self.totalDurationSec = durationSec
  }
}
