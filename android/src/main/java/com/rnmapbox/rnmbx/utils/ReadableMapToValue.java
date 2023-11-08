package com.rnmapbox.rnmbx.utils;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.mapbox.bindgen.Value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class ReadableMapToValue {
    static Value convert(Dynamic dynamic) {
        switch (dynamic.getType()) {
            case Map:
                return Value.valueOf(convert(dynamic.asMap()));
            case Array:
                return Value.valueOf(convert(dynamic.asArray()));
            case String:
                return Value.valueOf(dynamic.asString());
            case Number:
                return Value.valueOf(dynamic.asDouble());
            case Boolean:
                return Value.valueOf(dynamic.asBoolean());
            case Null:
                return Value.nullValue();
        }
        return null;
    }

    static List<Value> convert(ReadableArray array) {
        ArrayList<Value> list = new ArrayList<>();
        for (int i = 0; i < array.size(); ++i) {
            list.add(convert(array.getDynamic(i)));
        }
        return list;
    }

    public static HashMap<String, Value> convert(ReadableMap map) {
        HashMap<String, Value> result = new HashMap<>();
        for (Iterator<Map.Entry<String, Object>> it = map.getEntryIterator(); it.hasNext(); ) {
            Map.Entry<String, Object> entry = it.next();

            String key = entry.getKey();
            result.put(key, convert(map.getDynamic(key)));
        }
        return result;
    }
}
