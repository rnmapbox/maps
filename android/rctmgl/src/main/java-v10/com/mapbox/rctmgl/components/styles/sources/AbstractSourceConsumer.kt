package com.mapbox.rctmgl.components.styles.sources

import android.content.Context
import com.mapbox.rctmgl.components.AbstractMapFeature

abstract class AbstractSourceConsumer(context: Context?) : AbstractMapFeature(context) {
    abstract val iD: String?
}