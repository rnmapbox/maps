package com.rnmapbox.rnmbx.rncompat.dynamic

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableType

val Dynamic.type: ReadableType
    get() { return this.getType() }

val Dynamic.isNull: Boolean
    get() { return this.isNull() }
