package com.rnmapbox.rnmbx.components.mapview

import androidx.core.os.LocaleListCompat
import com.mapbox.bindgen.Value
import com.mapbox.common.MapboxCommonSettings
import com.mapbox.common.SettingsServiceFactory
import com.mapbox.common.SettingsServiceStorageType
import com.rnmapbox.rnmbx.utils.Logger

/**
 * Label localization through MapboxCommon's settings service: tiles are requested in the given language, so it
 * works for every language Mapbox supports and for styles with imports (Standard).
 * https://docs.mapbox.com/help/dive-deeper/maps-internationalization/
 *
 * The setting is global, so with several maps the last one that sets it wins. The map engine reads it from the
 * persistent storage, so it also outlives the app process, see [clearStaleLanguage].
 */
object RNMBXLocalization {
    private const val LOG_TAG = "RNMBXLocalization"

    /** Set while the language setting was written by us */
    private const val OWNED_MARKER_KEY = "com.rnmapbox.localizeLabels.ownsLanguage"

    /** Map that set the language */
    private var owner: Any? = null

    private val settings
        get() = SettingsServiceFactory.getInstance(SettingsServiceStorageType.PERSISTENT)

    /** Erases a language we set in a previous run that wasn't reset (e.g. the app was killed), runs once before the first map loads */
    val clearStaleLanguage: Unit by lazy {
        if (settings.has(OWNED_MARKER_KEY).value == true) {
            settings.erase(MapboxCommonSettings.LANGUAGE)
            settings.erase(OWNED_MARKER_KEY)
        }
    }

    /** BCP-47 language tags for a `localizeLabels.locale` value, `current` expands to the device's preferred languages */
    fun languages(localeString: String): List<String> {
        val tags = if (localeString == "current") {
            val locales = LocaleListCompat.getDefault()
            (0 until locales.size()).mapNotNull { locales.get(it)?.toLanguageTag() }
        } else {
            listOf(localeString)
        }
        return tags.map(::normalize)
    }

    fun normalize(tag: String): String {
        val normalized = tag.replace('_', '-')
        val parts = normalized.split('-')
        if (!parts[0].equals("zh", ignoreCase = true)) {
            return normalized
        }
        if (parts.any { it in listOf("Hant", "TW", "HK", "MO") }) {
            return "zh-Hant"
        }
        return "zh-Hans"
    }

    fun setLanguages(languages: List<String>, owner: Any) {
        if (languages.isEmpty()) {
            return
        }
        this.owner = owner
        val value = if (languages.size == 1) Value(languages[0]) else Value(languages.map { Value(it) })
        settings.set(MapboxCommonSettings.LANGUAGE, value).onError {
            Logger.e(LOG_TAG, "Failed to set language $languages: $it")
        }
        settings.set(OWNED_MARKER_KEY, Value(true))
    }

    /** Erases the language setting if it was set by [owner] */
    fun reset(owner: Any) {
        if (this.owner !== owner) {
            return
        }
        this.owner = null
        settings.erase(MapboxCommonSettings.LANGUAGE).onError {
            Logger.e(LOG_TAG, "Failed to reset language: $it")
        }
        settings.erase(OWNED_MARKER_KEY)
    }
}
