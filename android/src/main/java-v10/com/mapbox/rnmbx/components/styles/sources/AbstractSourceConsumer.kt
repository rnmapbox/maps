package com.mapbox.rnmbx.components.styles.sources

import android.content.Context
import com.mapbox.rnmbx.components.AbstractMapFeature

abstract class AbstractSourceConsumer(context: Context?) : AbstractMapFeature(context) {
    abstract val iD: String?
}