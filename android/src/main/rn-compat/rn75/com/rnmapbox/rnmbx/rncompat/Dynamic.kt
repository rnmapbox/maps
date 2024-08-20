package com.rnmapbox.rnmbx.rncompat.dynamic

import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.ReadableType


fun Dynamic.getType(): ReadableType {
    return type
}

/*
val Dynamic.type: ReadableType
    get() { return this.getType() }
*/
/*
val Dynamic.isNull: Boolean
    get() { return this.isNull() }
 */
