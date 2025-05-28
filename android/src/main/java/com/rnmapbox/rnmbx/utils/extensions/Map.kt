package com.rnmapbox.rnmbx.utils.extensions

fun  Map<*, *>.toStringKeyPairs(): Array<Pair<String, *>> {
    return this.entries.fold(mutableListOf<Pair<String, *>>()) { acc, (key, value) ->
        acc.apply {
            if (key is String) {
                add(key to value)
            }
        }
    }.toTypedArray()
}
