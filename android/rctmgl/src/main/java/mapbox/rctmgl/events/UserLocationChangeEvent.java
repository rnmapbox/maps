package mapbox.rctmgl.events;

import android.location.Location;
import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.mapboxsdk.geometry.LatLng;

import mapbox.rctmgl.events.constants.EventKeys;
import mapbox.rctmgl.events.constants.EventTypes;
import mapbox.rctmgl.utils.ConvertUtils;

/**
 * Created by nickitaliano on 8/31/17.
 */

public class UserLocationChangeEvent extends AbstractEvent {
    private Location mLocation;

    public UserLocationChangeEvent(View view, Location location) {
        super(view, EventTypes.USER_LOCATION_CHANGE);
        mLocation = location;
    }

    @Override
    public String getKey() {
        return EventKeys.USER_LOCATION_CHANGE;
    }

    @Override
    public WritableMap getPayload() {
        WritableMap properties = new WritableNativeMap();

        LatLng latLng = new LatLng(mLocation.getLatitude(), mLocation.getLongitude());
        properties.putDouble("heading", mLocation.getBearing());
        properties.putDouble("speed", mLocation.getSpeed());
        properties.putDouble("accuracy", mLocation.getAccuracy());
        properties.putDouble("altitude", mLocation.getAltitude());
        properties.putString("timestamp", Long.toString(mLocation.getTime()));

        return ConvertUtils.toPointFeature(latLng, properties);
    }
}
