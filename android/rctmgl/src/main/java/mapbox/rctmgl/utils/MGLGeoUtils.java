package mapbox.rctmgl.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.services.android.telemetry.constants.GeoConstants;
import com.mapbox.services.commons.geojson.GeoJSON;
import com.mapbox.services.commons.geojson.Geometry;
import com.mapbox.services.commons.geojson.Point;
import com.mapbox.services.commons.models.Position;
import com.mapbox.services.commons.geojson.custom.GeometryDeserializer;

import java.util.List;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class MGLGeoUtils {
    public static WritableMap latLngToWritableMap(LatLng point) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "Point");

        WritableArray coordinates = Arguments.createArray();
        coordinates.pushDouble(point.getLongitude());
        coordinates.pushDouble(point.getLatitude());
        map.putArray("coordinates", coordinates);

        return map;
    }

    public static LatLng pointToLatLng(Point point) {
        if (point == null) {
            return null;
        }

        Position position = point.getCoordinates();
        if (position == null) {
            return null;
        }

        return new LatLng(position.getLatitude(), position.getLongitude());
    }

    public static Point readableMapToPoint(ReadableMap map) {
        final String type = map.getString("type");

        if (!type.equals("Point")) {
            return null;
        }

        return Point.fromCoordinates(readableArrayToDoubleArray(map.getArray("coordinates")));
    }

    private static double[] readableArrayToDoubleArray(ReadableArray coordArray) {
        if (coordArray == null && coordArray.size() >= 2) {
            return null;
        }
        return new double[]{ coordArray.getDouble(0), coordArray.getDouble(1) };
    }
}
