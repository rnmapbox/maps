package com.rnmapbox.rnmbx.utils.extensions

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.mapbox.bindgen.Value
import com.rnmapbox.rnmbx.rncompat.dynamic.*

fun ReadableMap.toValueHashMap(): HashMap<String, Value> {
    var result = hashMapOf<String, Value>()
    var iterator = keySetIterator()
    while (iterator.hasNextKey()) {
        val i = iterator.nextKey()

        result[i] = when (getType(i)) {
            ReadableType.Null -> Value.nullValue()
            ReadableType.Boolean -> Value.valueOf(getBoolean(i))
            ReadableType.Number -> Value.valueOf(getDouble(i))
            ReadableType.String -> Value.valueOf(getString(i)!!)
            ReadableType.Array -> getArray(i)!!.toValue()
            ReadableType.Map -> getMap(i)!!.toValue()
        }
    }
    return result
}

fun ReadableMap.toValue() : Value {
    return Value.valueOf(toValueHashMap())
}

fun ReadableArray.toValue(): Value {
    var result = ArrayList<Value>(size())

    for (i in 0 until size()) {
        result.add(
        when (getType(i)) {
            ReadableType.Null -> Value.nullValue()
            ReadableType.Boolean -> Value.valueOf(getBoolean(i))
            ReadableType.Number -> Value.valueOf(getDouble(i))
            ReadableType.String -> Value.valueOf(getString(i))
            ReadableType.Array -> getArray(i).toValue()
            ReadableType.Map -> getMap(i).toValue()
        })
    }
    return Value.valueOf(result)
}

fun Dynamic.toValue(): Value {
    return when (type) {
        ReadableType.Null -> Value.nullValue()
        ReadableType.Boolean -> Value.valueOf(asBoolean())
        ReadableType.Number -> Value.valueOf(asDouble())
        ReadableType.String -> Value.valueOf(asString())
        ReadableType.Array -> asArray().toValue()
        ReadableType.Map -> asMap().toValue()
    }
}

fun Dynamic.asBooleanOrNull(): Boolean? {
    return if (isNull) {
        null
    } else {
        asBoolean()
    }
}

fun Dynamic.asDoubleOrNull(): Double? {
    return if (isNull) {
        null
    } else {
        asDouble()
    }
}

fun Dynamic.asStringOrNull(): String? {
    return if (isNull) {
        null
    } else {
        asString()
    }
}