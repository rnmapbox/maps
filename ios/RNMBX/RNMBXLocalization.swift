import MapboxMaps

/// Label localization through MapboxCommon's settings service: tiles are requested in the given language, so it
/// works for every language Mapbox supports and for styles with imports (Standard).
/// https://docs.mapbox.com/help/dive-deeper/maps-internationalization/
///
/// The setting is global, so with several maps the last one that sets it wins. The map engine reads it from the
/// persistent storage, so it also outlives the app process, see `clearStaleLanguage`.
enum RNMBXLocalization {
  /// Set while the language setting was written by us
  private static let ownedMarkerKey = "com.rnmapbox.localizeLabels.ownsLanguage"

  /// Map that set the language, `ObjectIdentifier` instead of a weak reference so it can be reset from `deinit`
  private static var owner: ObjectIdentifier?

  private static var settings: SettingsService {
    SettingsServiceFactory.getInstance(storageType: .persistent)
  }

  /// Erases a language we set in a previous run that wasn't reset (e.g. the app was killed), evaluated once before the first map loads
  static let clearStaleLanguage: Void = {
    if case .success(true) = settings.has(key: ownedMarkerKey) {
      _ = settings.erase(key: MapboxCommonSettings.language)
      _ = settings.erase(key: ownedMarkerKey)
    }
  }()

  /// BCP-47 language tags for a `localizeLabels.locale` value, `current` expands to the device's preferred languages
  static func languages(for localeString: String) -> [String] {
    let tags = localeString == "current" ? Locale.preferredLanguages : [localeString]
    return tags.map(normalize)
  }

  static func normalize(_ tag: String) -> String {
    let tag = tag.replacingOccurrences(of: "_", with: "-")
    let parts = tag.split(separator: "-").map { String($0) }
    guard parts.first?.lowercased() == "zh" else {
      return tag
    }
    if parts.contains(where: { ["Hant", "TW", "HK", "MO"].contains($0) }) {
      return "zh-Hant"
    }
    return "zh-Hans"
  }

  static func setLanguages(_ languages: [String], owner: AnyObject) {
    guard !languages.isEmpty else {
      return
    }
    self.owner = ObjectIdentifier(owner)
    let result = languages.count == 1
      ? settings.set(key: MapboxCommonSettings.language, value: languages[0])
      : settings.set(key: MapboxCommonSettings.language, value: languages)
    if case .failure(let error) = result {
      Logger.log(level: .error, message: "RNMBXLocalization: failed to set language \(languages)", error: error)
    }
    _ = settings.set(key: ownedMarkerKey, value: true)
  }

  /// Erases the language setting if it was set by `owner`
  static func reset(owner: AnyObject) {
    guard self.owner == ObjectIdentifier(owner) else {
      return
    }
    self.owner = nil
    if case .failure(let error) = settings.erase(key: MapboxCommonSettings.language) {
      Logger.log(level: .error, message: "RNMBXLocalization: failed to reset language", error: error)
    }
    _ = settings.erase(key: ownedMarkerKey)
  }
}
