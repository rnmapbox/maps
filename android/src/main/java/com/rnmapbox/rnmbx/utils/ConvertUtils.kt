package com.rnmapbox.rnmbx.utils

import android.graphics.PointF
import android.graphics.RectF
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NoSuchKeyException
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonPrimitive
import java.text.NumberFormat
import java.text.ParseException

object ConvertUtils {
    const val LOG_TAG: String = "ConvertUtils"

    fun toJsonObject(map: ReadableMap?): JsonObject? {
        if (map == null) return null
        val result = JsonObject()
        val it = map.keySetIterator()

        while (it.hasNextKey()) {
            val key = it.nextKey()
            when (map.getType(key)) {
                ReadableType.Map -> result.add(key, toJsonObject(map.getMap(key)))
                ReadableType.Array -> result.add(key, toJsonArray(map.getArray(key)))
                ReadableType.Null -> result.add(key, null)
                ReadableType.Number -> result.addProperty(key, map.getDouble(key))
                ReadableType.String -> result.addProperty(key, map.getString(key))
                ReadableType.Boolean -> result.addProperty(key, map.getBoolean(key))
            }
        }
        return result
    }

    @JvmStatic
    fun toJsonArray(array: ReadableArray?): JsonArray? {
        if (array == null) return null
        val result = JsonArray(array.size())
        for (i in 0..<array.size()) {
            when (array.getType(i)) {
                ReadableType.Map -> result.add(toJsonObject(array.getMap(i)))
                ReadableType.Array -> result.add(toJsonArray(array.getArray(i)))
                ReadableType.Null -> result.add(null as JsonElement?)
                ReadableType.Number -> result.add(array.getDouble(i))
                ReadableType.String -> result.add(array.getString(i))
                ReadableType.Boolean -> result.add(array.getBoolean(i))
            }
        }
        return result
    }

    @JvmStatic
    fun typedToJsonElement(map: ReadableMap?): JsonElement? {
        if (map == null) return null

        val type = map.getString("type")

        if (type == ExpressionParser.TYPE_MAP) {
            val result = JsonObject()

            val keyValues = map.getArray("value")
            for (i in 0..<keyValues!!.size()) {
                val keyValue = keyValues.getArray(i)
                val key = keyValue!!.getMap(0)!!.getString("value")

                result.add(key, typedToJsonElement(keyValue.getMap(1)))
            }
            return result
        } else if (type == ExpressionParser.TYPE_ARRAY) {
            val arrayValue = map.getArray("value")
            val result = JsonArray(arrayValue!!.size())
            for (i in 0..<arrayValue.size()) {
                result.add(typedToJsonElement(arrayValue.getMap(i)))
            }
            return result
        } else if (type == ExpressionParser.TYPE_BOOL) {
            return JsonPrimitive(map.getBoolean("value"))
        } else if (type == ExpressionParser.TYPE_NUMBER) {
            return JsonPrimitive(map.getDouble("value"))
        } else if (type == ExpressionParser.TYPE_STRING) {
            return JsonPrimitive(map.getString("value"))
        } else {
            throw RuntimeException(String.format("Unrecognized type {}", map.getString("type")))
        }
    }

    fun toWritableArray(array: JsonArray): WritableArray {
        val writableArray = Arguments.createArray()

        for (i in 0..<array.size()) {
            val element = array.get(i)

            if (element.isJsonArray()) {
                writableArray.pushArray(toWritableArray(element.getAsJsonArray()))
            } else if (element.isJsonObject()) {
                writableArray.pushMap(toWritableMap(element.getAsJsonObject()))
            } else if (element.isJsonPrimitive()) {
                val primitive = element.getAsJsonPrimitive()

                if (primitive.isBoolean()) {
                    writableArray.pushBoolean(primitive.getAsBoolean())
                } else if (primitive.isNumber()) {
                    writableArray.pushDouble(primitive.getAsDouble())
                } else {
                    writableArray.pushString(primitive.getAsString())
                }
            }
        }

        return writableArray
    }

    fun toWritableMap(inObject: JsonObject): WritableMap {
        val map = Arguments.createMap()

        for (entry in inObject.entrySet()) {
            val propName = entry.key
            val jsonElement = entry.value

            if (jsonElement.isJsonPrimitive()) {
                val primitive = jsonElement.getAsJsonPrimitive()

                if (primitive.isBoolean()) {
                    map.putBoolean(propName, primitive.getAsBoolean())
                } else if (primitive.isNumber()) {
                    map.putDouble(propName, primitive.getAsDouble())
                } else {
                    map.putString(propName, primitive.getAsString())
                }
            } else if (jsonElement.isJsonArray()) {
                map.putArray(propName, toWritableArray(jsonElement.getAsJsonArray()))
            } else if (jsonElement.isJsonObject()) {
                map.putMap(propName, toWritableMap(jsonElement.getAsJsonObject()))
            }
        }

        return map
    }

    fun getObjectFromString(str: String): Any? {
        val numberFormat = NumberFormat.getNumberInstance()

        try {
            return numberFormat.parse(str)
        } catch (e: ParseException) {
            // ignore we're just figuring out what type this is
        }

        return str
    }

    fun toStringList(array: ReadableArray?): MutableList<String> {
        val list: MutableList<String> = ArrayList<String>()

        if (array == null) {
            return list
        }

        for (i in 0..<array.size()) {
            array.getString(i)?.let {
                list.add(it)
            }
        }

        return list
    }

    fun toPointF(array: ReadableArray?): PointF {
        val pointF = PointF()

        if (array == null) {
            return pointF
        }

        pointF.set(array.getDouble(0).toFloat(), array.getDouble(1).toFloat())
        return pointF
    }

    // returns null if array is null
    fun toRectF(array: ReadableArray?): RectF? {
        val rectF = RectF()

        if (array == null || array.size() == 0) {
            return null
        }

        rectF.set(
            array.getDouble(3).toFloat(),
            array.getDouble(0).toFloat(),
            array.getDouble(1).toFloat(),
            array.getDouble(2).toFloat()
        )
        return rectF
    }

    fun getDouble(key: String, map: ReadableMap, defaultValue: Double): Double {
        var value = defaultValue

        try {
            value = map.getDouble(key)
        } catch (e: NoSuchKeyException) {
            // key not found use default value
            Log.d(
                LOG_TAG,
                String.format("No key found for %s, using default value %f", key, defaultValue)
            )
        }

        return value
    }

    fun getString(key: String, map: ReadableMap, defaultValue: String): String {
        var value = defaultValue

        try {
            map.getString(key)?.let {
                value = it
            } ?: run {
                Log.d(LOG_TAG, String.format("key %s is null, using default value %s", key, defaultValue))
                // value is already defaultValue
            }
        } catch (e: NoSuchKeyException) {
            // key not found use default value
            Log.d(
                LOG_TAG,
                String.format("No key found for %s, using default value %s", key, defaultValue)
            )
        }

        return value
    }
}
