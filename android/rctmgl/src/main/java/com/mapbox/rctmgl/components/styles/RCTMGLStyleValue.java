package com.mapbox.rctmgl.components.styles;

import android.support.annotation.NonNull;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.TransitionOptions;
import com.mapbox.rctmgl.utils.ExpressionParser;

/**
 * Created by nickitaliano on 9/12/17.
 */

public class RCTMGLStyleValue {

    private String mType;
    private boolean isExpression;
    private Expression mExpression;
    private ReadableMap mPayload;

    private String imageURI = "";
    private boolean isAddImage;

    public static final int InterpolationModeExponential = 100;
    public static final int InterpolationModeInterval = 101;
    public static final int InterpolationModeCategorical = 102;
    public static final int InterpolationModeIdentity = 103;

    public RCTMGLStyleValue(@NonNull ReadableMap config) {
        mType = config.getString("styletype");
        mPayload = config.getMap("stylevalue");

        if ("image".equals(mType)) {
            imageURI = mPayload.getString("value");
            isAddImage = imageURI != null && imageURI.contains("://");
            return;
        }

        Dynamic dynamic = mPayload.getDynamic("value");
        if (dynamic.getType().equals(ReadableType.Array)) {
            isExpression = true;
            mExpression = ExpressionParser.from(dynamic.asArray());
        }
    }

    public String getType() {
        return mType;
    }

    public boolean isFunction() {
        return mType.equals("function");
    }

    public int getInt(String key) {
        return mPayload.getInt(key);
    }

    public String getString(String key) {
        return mPayload.getString(key);
    }

    public Double getDouble(String key) {
        return mPayload.getDouble(key);
    }

    public Float getFloat(String key) {
        return getDouble(key).floatValue();
    }

    public Dynamic getDynamic(String key) {
        return mPayload.getDynamic(key);
    }

    public ReadableArray getArray(String key) {
        return mPayload.getArray(key);
    }

    public Boolean getBoolean(String key) {
        return mPayload.getBoolean(key);
    }

    public Float[] getFloatArray(String key) {
        ReadableArray arr = getArray(key);

        Float[] floatArr = new Float[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            ReadableMap item = arr.getMap(i);
            floatArr[i] = (float) item.getDouble("value");
        }

        return floatArr;
    }

    public String[] getStringArray(String key) {
        ReadableArray arr = getArray(key);

        String[] stringArr = new String[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            stringArr[i] = arr.getString(i);
        }

        return stringArr;
    }

    public ReadableMap getMap(String key) {
        return mPayload.getMap(key);
    }

    public Expression getExpression() {
        return mExpression;
    }

    public boolean isExpression() {
        return isExpression;
    }

    public boolean shouldAddImage() {
        return isAddImage;
    }

    public String getImageURI() {
        return imageURI;
    }

    public TransitionOptions getTransition() {
        if (!mType.equals("transition")) {
            return null;
        }
        ReadableMap config = getMap(RCTMGLStyleFactory.VALUE_KEY);
        return TransitionOptions.fromTransitionOptions(config.getInt("duration"), config.getInt("delay"));
    }
}
