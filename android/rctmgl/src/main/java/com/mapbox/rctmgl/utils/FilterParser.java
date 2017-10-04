package com.mapbox.rctmgl.utils;

import com.mapbox.mapboxsdk.style.layers.Filter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
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

    public static Filter.Statement parse(List<String> filter) {
        Filter.Statement completeStatement = null;

        int compound = 0;

        if (filter == null) {
            return null;
        }

        // we are going to be popping items of the list, we want to treat the react prop as immutable
        List<String> filterList = new ArrayList<>(filter);

        // no filter
        if (filterList.size() < 2) {
            return null;
        }

        // peak ahead to see if this is a compound filter or not
        switch (filterList.get(0)) {
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
            filterList.remove(0);
        }

        while (!filterList.isEmpty()) {

            int posPointer = 1;

            while (posPointer < filterList.size()) {
                if (FILTER_OPS.contains(filterList.get(posPointer))) {
                    break;
                }
                posPointer++;
            }

            // TODO: throw useful exceptions here when popping from list fails due to an invalid filter

            List<String> currentFilters = new ArrayList<>(filterList.subList(0, posPointer));
            filterList.removeAll(currentFilters);

            String op = currentFilters.remove(0);
            Filter.Statement statement = null;
            String key = currentFilters.remove(0);
            List<Object> values = getObjectValues(currentFilters);

            switch (op) {
                case "in":
                    statement = Filter.in(key, values);
                    break;
                case "!in":
                    statement = Filter.notIn(key, values);
                    break;
                case "<=":
                    statement = Filter.lte(key, values.get(0));
                    break;
                case "<":
                    statement = Filter.lt(key, values.get(0));
                    break;
                case ">=":
                    statement = Filter.gte(key, values.get(0));
                    break;
                case ">":
                    statement = Filter.gt(key, values.get(0));
                    break;
                case "!=":
                    statement = Filter.neq(key, values.get(0));
                    break;
                case "==":
                    statement = Filter.eq(key, values.get(0));
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

    private static List<Object> getObjectValues(List<String> filter) {
        List<Object> objects = new ArrayList<>();

        for (String value : filter) {
            objects.add(ConvertUtils.getObjectFromString(value));
        }

        return objects;
    }
}
