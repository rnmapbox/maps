package com.rnmapbox.rnmbx.components.styles.sources

import android.content.Context
import com.rnmapbox.rnmbx.components.AbstractMapFeature

abstract class AbstractSourceConsumer(context: Context?) : AbstractMapFeature(context) {
    abstract val iD: String?
}