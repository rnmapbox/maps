package com.mapbox.rctmgl.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.mapboxsdk.geometry.LatLngQuad;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Geometry;
import com.mapbox.services.commons.geojson.LineString;
import com.mapbox.services.commons.geojson.Point;
import com.mapbox.services.commons.geojson.Polygon;
import com.mapbox.services.commons.models.Position;

import java.util.List;

/**
 * Created by nickitaliano on 11/7/17.
 */

public class GeoJSONUtils {
    public static WritableMap fromFeature(Feature feature) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "Feature");

        WritableMap geometry = fromGeometry(feature.getGeometry());
        map.putMap("geometry", geometry);

        WritableMap properties = ConvertUtils.toWritableMap(feature.getProperties());
        map.putMap("properties", properties);

        return map;
    }

    public static WritableMap fromGeometry(Geometry geometry) {
        final String type = geometry.getType();

        switch (type) {
            case "Point":
                return fromPoint((Point) geometry);
            case "LineString":
                return fromLineString((LineString) geometry);
            case "Polygon":
                return fromPolygon((Polygon) geometry);
            default:
                return null;
        }
    }

    public static WritableMap fromPoint(Point point) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "Point");
        map.putArray("coordinates", getCoordinates(point));
        return map;
    }

    public static WritableMap fromLineString(LineString lineString) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "LineString");
        map.putArray("coordinates", getCoordinates(lineString));
        return map;
    }

    public static WritableMap fromPolygon(Polygon polygon) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "Polygon");
        map.putArray("coordinates", getCoordinates(polygon));
        return map;
    }

    public static WritableArray getCoordinates(Point point) {
        double[] coords = point.getCoordinates().getCoordinates();
        return Arguments.fromArray(coords);
    }

    public static WritableArray getCoordinates(LineString lineString) {
        WritableArray array = Arguments.createArray();

        List<Position> positions = lineString.getCoordinates();
        for (Position position : positions) {
            array.pushArray(Arguments.fromArray(position.getCoordinates()));
        }

        return array;
    }

    public static WritableArray getCoordinates(Polygon polygon) {
        WritableArray array = Arguments.createArray();

        List<List<Position>> positions = polygon.getCoordinates();
        for (List<Position> curPositions : positions) {
            WritableArray innerArray = Arguments.createArray();

            for (Position position : curPositions) {
                innerArray.pushArray(Arguments.fromArray(position.getCoordinates()));
            }

            array.pushArray(innerArray);
        }

        return array;
    }

    public static WritableMap toPointFeature(LatLng latLng, WritableMap properties) {
        WritableMap map = new WritableNativeMap();
        map.putString("type", "Feature");
        map.putMap("geometry", toPointGeometry(latLng));
        map.putMap("properties", properties);
        return map;
    }

    public static WritableMap toPointGeometry(LatLng latLng) {
        WritableMap geometry = new WritableNativeMap();
        geometry.putString("type", "Point");
        geometry.putArray("coordinates", fromLatLng(latLng));
        return geometry;
    }

    public static WritableArray fromLatLng(LatLng latLng) {
        double[] coords = new double[]{ latLng.getLongitude(), latLng.getLatitude() };
        WritableArray writableCoords = new WritableNativeArray();
        writableCoords.pushDouble(coords[0]);
        writableCoords.pushDouble(coords[1]);
        return writableCoords;
    }

    public static LatLng toLatLng(Point point) {
        if (point == null) {
            return null;
        }

        Position position = point.getCoordinates();
        if (position == null) {
            return null;
        }

        return new LatLng(position.getLatitude(), position.getLongitude());
    }

    public static LatLng toLatLng(ReadableArray coordinates) {
        if (coordinates == null || coordinates.size() < 2) {
            return null;
        }
        return new LatLng(coordinates.getDouble(1), coordinates.getDouble(0));
    }

    public static Point toPointGeometry(String featureJSONString) {
        Feature feature = Feature.fromJson(featureJSONString);
        if (feature == null) {
            return null;
        }
        return (Point)feature.getGeometry();
    }

    public static WritableArray fromLatLngBounds(LatLngBounds latLngBounds) {
        WritableArray array = Arguments.createArray();

        LatLng[] latLngs = latLngBounds.toLatLngs();
        for (LatLng latLng : latLngs) {
            array.pushArray(fromLatLng(latLng));
        }

        return array;
    }

    public static LatLngBounds toLatLngBounds(FeatureCollection featureCollection) {
        List<Feature> features = featureCollection.getFeatures();

        if (features.size() != 2) {
            return null;
        }

        LatLng neLatLng = toLatLng((Point)features.get(0).getGeometry());
        LatLng swLatLng = toLatLng((Point)features.get(1).getGeometry());

        return LatLngBounds.from(neLatLng.getLatitude(), neLatLng.getLongitude(),
                swLatLng.getLatitude(), swLatLng.getLongitude());
    }

    public static LatLngQuad toLatLngQuad(ReadableArray array) {
        // [top left, top right, bottom right, bottom left]
        if (array == null || array.size() < 4) {
            return null;
        }
        return new LatLngQuad(
                toLatLng(array.getArray(0)),
                toLatLng(array.getArray(1)),
                toLatLng(array.getArray(2)),
                toLatLng(array.getArray(3))
        );
    }
}
