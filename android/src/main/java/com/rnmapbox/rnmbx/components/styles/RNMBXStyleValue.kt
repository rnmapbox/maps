package com.rnmapbox.rnmbx.components.styles

import com.facebook.react.bridge.*
import com.mapbox.bindgen.Value
import com.mapbox.maps.extension.style.types.StyleTransition.Builder
import com.rnmapbox.rnmbx.utils.ImageEntry
import com.mapbox.maps.extension.style.types.StyleTransition
import com.rnmapbox.rnmbx.components.styles.RNMBXStyleFactory
import com.mapbox.maps.extension.style.expressions.generated.Expression
import com.mapbox.maps.extension.style.light.LightPosition
import com.rnmapbox.rnmbx.rncompat.dynamic.*
import com.rnmapbox.rnmbx.utils.ExpressionParser
import com.rnmapbox.rnmbx.utils.Logger
import java.util.ArrayList

class RNMBXStyleValue(key: String?, config: ReadableMap) {
    val type: String?
    val key: String?
    private var isExpression = false
    private var mExpression: Expression? = null
    private val mPayload: ReadableMap?
    var imageURI: String? = ""
    private var isAddImage = false
    var imageScale: Double? = null
    private fun isTokenizedValue(value: String): Boolean {
        return value.startsWith("{") && value.endsWith("}")
    }

    val isFunction: Boolean
        get() = type == "function"

    fun getInt(key: String?): Int {
        return mPayload!!.getInt(key!!)
    }

    fun getLong(key: String?): Long {
        return mPayload!!.getInt(key!!).toLong()
    }

    fun getIntExpression(key: String?): Expression {
        return Expression.literal(mPayload!!.getInt(key!!).toLong())
    }

    fun getString(key: String?): String? {
        return mPayload!!.getString(key!!)
    }

    fun getEnumName(): String {
        return mPayload!!.getString("value")!!.uppercase().replace("-", "_")
    }

    fun getDouble(key: String?): Double {
        return mPayload!!.getDouble(key!!)
    }

    fun getFloat(key: String?): Float {
        return getDouble(key).toFloat()
    }

    fun getDynamic(key: String?): Dynamic {
        return mPayload!!.getDynamic(key!!)
    }

    fun getArray(key: String?): ReadableArray? {
        return mPayload!!.getArray(key!!)
    }

    fun getBoolean(key: String?): Boolean {
        return mPayload!!.getBoolean(key!!)
    }

    /*
    public Float[] getFloatArray(String key) {
        ReadableArray arr = getArray(key);

        Float[] floatArr = new Float[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            ReadableMap item = arr.getMap(i);
            floatArr[i] = (float) item.getDouble("value");
        }

        return floatArr;
    }
    */
    fun getFloatArray(key: String?): List<Double> {
        val arr = getArray(key)
        val result = ArrayList<Double>(arr!!.size())
        for (i in 0 until arr.size()) {
            val item = arr.getMap(i)
            if (item != null) {
                if (item.getString("type") != "number") {
                    Logger.e("RNMBXStyleValue", "getFloatArray: invalid type for item: $i ${item.getString("type")} expected to be number")
                    continue
                }
                result.add(item.getDouble("value"))
            } else {
                Logger.e("RNMBXStyleValue", "getFloatArray: null value for item: $i")
            }
        }
        return result
    }

    /*
    public String[] getStringArray(String key) {
        ReadableArray arr = getArray(key);

        String[] stringArr = new String[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            ReadableMap item = arr.getMap(i);
            stringArr[i] = item.getString("value");
        }

        return stringArr;
    } */
    fun getStringArray(key: String?): List<String> {
        val arr = getArray(key)
        val result = ArrayList<String>(arr!!.size())
        for (i in 0 until arr.size()) {
            val item = arr.getMap(i)
            val value = item?.getString("value")
            if (value != null) {
                if (item.getString("type") != "string") {
                    Logger.e("RNMBXStyleValue", "getStringArray: invalid type for item: $i ${item.getString("type")} expected to be string")
                    continue
                }
                result.add(value)
            } else {
                Logger.e("RNMBXStyleValue", "getStringArray: null value for item: $i")
            }
        }
        return result
    }

    val map: ReadableMap?
        get() {
            if ("hashmap" == mPayload!!.getString("type")) {
                val keyValues = mPayload.getArray("value")
                val result = WritableNativeMap()
                for (i in 0 until keyValues!!.size()) {
                    val keyValue = keyValues.getArray(i)
                    val stringKey = keyValue?.getMap(0)?.getString("value")
                    val value = WritableNativeMap()
                    if (keyValue != null) {
                        keyValue.getMap(1)?.let { value.merge(it) }
                    }
                    result.putMap(stringKey!!, value)
                }
                return result
            }
            return null
        }

    fun getMap(_key: String?): ReadableMap? {
        return map
    }

    fun getExpression(): Expression? {
        return mExpression
    }

    fun getLightPosition(): LightPosition {
        return LightPosition.fromList(getFloatArray("value"))
    }

    fun isExpression(): Boolean {
        return isExpression
    }

    fun shouldAddImage(): Boolean {
        return isAddImage
    }

    val isImageStringValue: Boolean
        get() = "string" == mPayload!!.getString("type")

    fun getImageStringValue(): String? {
        return mPayload!!.getString("value")
    }

    val transition: StyleTransition?
        get() {
            if (type != "transition") {
                return null
            }
            val config = getMap(RNMBXStyleFactory.VALUE_KEY)
            var enablePlacementTransitions = true
            if (config!!.hasKey("enablePlacementTransitions")) {
                enablePlacementTransitions =
                    config.getMap("enablePlacementTransitions")!!.getBoolean("value")
            }
            var duration = 300
            var delay = 0
            if (config.hasKey("duration") && ReadableType.Map == config.getType("duration")) {
                duration = config.getMap("duration")!!.getInt("value")
            }
            if (config.hasKey("delay") && ReadableType.Map == config.getType("delay")) {
                delay = config.getMap("delay")!!.getInt("value")
            }
            return Builder().duration(duration.toLong()).delay(delay.toLong()).build()
        }

    companion object {
        const val InterpolationModeExponential = 100
        const val InterpolationModeInterval = 101
        const val InterpolationModeCategorical = 102
        const val InterpolationModeIdentity = 103
    }

    init {
        this.key = key
        type = config.getString("styletype")
        mPayload = config.getMap("stylevalue")
        isAddImage = false
        if ("image" == type) {
            imageScale = null
            if ("hashmap" == mPayload!!.getString("type")) {
                val map = map
                imageURI = map!!.getMap("uri")!!.getString("value")
                if (map.getMap("scale") != null) {
                    imageScale = map.getMap("scale")!!.getDouble("value")
                }
            } else if ("string" == mPayload.getString("type")) {
                val value = mPayload.getString("value")
                if (value!!.contains("://")) {
                    imageURI = value
                } else {
                    imageURI = null
                    isExpression = true
                    mExpression = Expression.literal(value)
                }
            } else {
                imageURI = null
            }
            isAddImage = imageURI != null
        }
        if (!isAddImage) {
            val dynamic = mPayload!!.getDynamic("value")
            if (isExpression(dynamic)) {
                isExpression = true
                Logger.logged("$key ExpressionParser.fromTyped") {
                    mExpression = ExpressionParser.fromTyped(mPayload)
                }
            }
        }
    }

    private fun isExpression(payload: Dynamic): Boolean {
        if (payload.type != ReadableType.Array) {
            return false
        }

        var potentialExpression = payload.asArray()
            ?: return false

        while (
            potentialExpression.size() > 0 &&
            potentialExpression.getType(0) == ReadableType.Map
        ) {
            val firstElementMap = potentialExpression.getMap(0)
                ?: return false

            if (firstElementMap.getString("type") == "array") {
                potentialExpression = firstElementMap.getArray("value")
                    ?: return false
            } else {
                break
            }
        }

        if (potentialExpression.size() == 0 || potentialExpression.getType(0) != ReadableType.Map) {
            return false
        }

        val firstElementMap = potentialExpression.getMap(0)
            ?: return false

        // A valid expression starts with an operator, which is identified by its type being "string".
        return firstElementMap.getString("type") == "string"
    }
}
