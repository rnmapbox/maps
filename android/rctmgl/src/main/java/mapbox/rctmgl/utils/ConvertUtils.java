package mapbox.rctmgl.utils;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.LatLngBounds;
import com.mapbox.services.commons.geojson.Feature;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;
import com.mapbox.services.commons.models.Position;

import java.util.List;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class ConvertUtils {
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

    public static Point toPointGemetry(String featureJSONString) {
        Feature feature = Feature.fromJson(featureJSONString);
        if (feature == null) {
            return null;
        }
        return (Point)feature.getGeometry();
    }

    public static LatLngBounds toLatLngBounds(FeatureCollection featureCollection) {
        List<Feature> features = featureCollection.getFeatures();

        if (features.size() != 2) {
            return null;
        }

        LatLng neLatLng = ConvertUtils.toLatLng((Point)features.get(0).getGeometry());
        LatLng swLatLng = ConvertUtils.toLatLng((Point)features.get(1).getGeometry());

        return LatLngBounds.from(neLatLng.getLatitude(), neLatLng.getLongitude(),
                swLatLng.getLatitude(), swLatLng.getLongitude());
    }
}
