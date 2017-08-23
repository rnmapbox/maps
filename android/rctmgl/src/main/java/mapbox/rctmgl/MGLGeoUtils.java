package mapbox.rctmgl;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
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

class MGLGeoUtils {
    static LatLng pointToLatLng(Point point) {
        if (point == null) {
            return null;
        }

        Position position = point.getCoordinates();
        if (position == null) {
            return null;
        }

        return new LatLng(position.getLatitude(), position.getLongitude());
    }

    static Point readableMapToPoint(ReadableMap map) {
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
