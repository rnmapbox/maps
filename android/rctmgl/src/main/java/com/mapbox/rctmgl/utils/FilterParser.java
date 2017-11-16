package com.mapbox.rctmgl.utils;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.mapbox.mapboxsdk.style.layers.Filter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by nickitaliano on 10/3/17.
 */

public class FilterParser {
    public static final Set<String> FILTER_OPS = new HashSet<String>(Arrays.asList(
            "all",
            "any",
            "none",
            "in",
            "!in",
            "<=",
            "<",
            ">=",
            ">",
            "!=",
            "==",
            "has",
            "!has"
    ));

    public static final int COMPOUND_FILTER_ALL = 3;
    public static final int COMPOUND_FILTER_ANY = 2;
    public static final int COMPOUND_FILTER_NONE = 1;

    public static FilterList getFilterList(ReadableArray readableArray) {
        List<Map<String, Object>> rawFilterList = new ArrayList<>();

        for (int i = 0; i < readableArray.size(); i++) {
            ReadableMap readableMap = readableArray.getMap(i);

            Map<String, Object> filterItem = new HashMap<>();
            filterItem.put("type", readableMap.getString("type"));

            switch (readableMap.getString("type")) {
                case "boolean":
                    filterItem.put("value", readableMap.getBoolean("value"));
                    break;
                case "number":
                    filterItem.put("value", readableMap.getDouble("value"));
                    break;
                default:
                    filterItem.put("value", readableMap.getString("value"));
                    break;
            }

            rawFilterList.add(filterItem);
        }

        return new FilterList(rawFilterList);
    }

    public static Filter.Statement parse(FilterList filterList) {
        Filter.Statement completeStatement = null;

        int compound = 0;

        // no filter
        if (filterList == null || filterList.size() < 2) {
            return null;
        }

        // peak ahead to see if this is a compound filter or not
        switch (filterList.getString(0)) {
            case "all":
                compound = COMPOUND_FILTER_ALL;
                break;
            case "any":
                compound = COMPOUND_FILTER_ANY;
                break;
            case "none":
                compound = COMPOUND_FILTER_NONE;
                break;
        }

        List<Filter.Statement> compoundStatement = new ArrayList<>();

        if (compound > 0) {
            filterList.removeFirst();
        }

        while (!filterList.isEmpty()) {

            int posPointer = 1;

            while (posPointer < filterList.size()) {
                if (FILTER_OPS.contains(filterList.getString(posPointer))) {
                    break;
                }
                posPointer++;
            }

            // TODO: throw useful exceptions here when popping from list fails due to an invalid filter

            FilterList currentFilters = filterList.subList(posPointer);
            filterList.removeAll(currentFilters);

            String op = currentFilters.getString(0);
            currentFilters.removeFirst();

            Filter.Statement statement = null;
            String key = currentFilters.getString(0);
            currentFilters.removeFirst();

            Object[] values = getObjectValues(currentFilters);

            switch (op) {
                case "in":
                    statement = Filter.in(key, values);
                    break;
                case "!in":
                    statement = Filter.notIn(key, values);
                    break;
                case "<=":
                    statement = Filter.lte(key, values[0]);
                    break;
                case "<":
                    statement = Filter.lt(key, values[0]);
                    break;
                case ">=":
                    statement = Filter.gte(key, values[0]);
                    break;
                case ">":
                    statement = Filter.gt(key, values[0]);
                    break;
                case "!=":
                    statement = Filter.neq(key, values[0]);
                    break;
                case "==":
                    statement = Filter.eq(key, values[0]);
                    break;
                case "has":
                    statement = Filter.has(key);
                    break;
                case "!has":
                    statement = Filter.notHas(key);
                    break;
            }

            if (compound > 0) {
                compoundStatement.add(statement);
            } else {
                completeStatement = statement;
            }
        }

        if (compound > 0) {
            Filter.Statement[] statements = new Filter.Statement[compoundStatement.size()];
            compoundStatement.toArray(statements);

            switch (compound) {
                case COMPOUND_FILTER_ALL:
                    return Filter.all(statements);
                case COMPOUND_FILTER_ANY:
                    return Filter.any(statements);
                case COMPOUND_FILTER_NONE:
                    return Filter.none(statements);
            }
        }

        return completeStatement;
    }

    private static Object[] getObjectValues(FilterList filterList) {
        List<Object> objects = new ArrayList<>();

        for (int i = 0; i < filterList.size(); i++) {
            Map<String, Object> item = filterList.get(i);
            objects.add(item.get("value"));
        }

        return objects.toArray(new Object[objects.size()]);
    }

    public static class FilterList {
        private List<Map<String, Object>> mFilterList;

        FilterList(List<Map<String, Object>> filterList) {
            mFilterList = new ArrayList<>(filterList);
        }

        Object removeFirst() {
            Map<String, Object> item = mFilterList.remove(0);
            return item.get("value");
        }

        Map<String, Object> get(int index) {
            Map<String, Object> item = mFilterList.get(index);

            if (item == null) {
                return null;
            }

            return item;
        }

        String getString(int index) {
            Map<String, Object> item = get(index);

            if (!item.get("type").equals("string")) {
                return "";
            }

            return (String)item.get("value");
        }

        int size() {
            return mFilterList.size();
        }

        boolean isEmpty() {
            return mFilterList.isEmpty();
        }

        FilterList subList(int lastPosition) {
            List<Map<String, Object>> slice = mFilterList.subList(0, lastPosition);
            return new FilterList(slice);
        }

        void removeAll(FilterList itemsToRemove) {
            for (int i = 0; i < itemsToRemove.size(); i++) {
                mFilterList.remove(itemsToRemove.get(i));
            }
        }
    }
}
