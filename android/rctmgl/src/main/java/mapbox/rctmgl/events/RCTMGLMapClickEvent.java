package mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.mapbox.mapboxsdk.geometry.LatLng;

import mapbox.rctmgl.utils.MGLGeoUtils;

/**
 * Created by nickitaliano on 8/23/17.
 */

public class RCTMGLMapClickEvent extends AbstractRCTMGLEvent {
    private LatLng mTouchedLatLng;

    public RCTMGLMapClickEvent(View view) {
        this(view, RCTMGLEventTypes.MAP_CLICK);
    }

    public RCTMGLMapClickEvent(View view, String eventType) {
        super(view, eventType);
    }

    @Override
    public String getKey() {
        String eventType = getType();

        if (eventType.equals(RCTMGLEventTypes.MAP_LONG_CLICK)) {
            return RCTMGLEventKeys.MAP_LONG_CLICK;
        }

        return RCTMGLEventKeys.MAP_CLICK;
    }

    @Override
    public WritableMap getPayload() {
        return MGLGeoUtils.latLngToWritableMap(mTouchedLatLng);
    }

    public void setLatLng(LatLng touchedLatLng) {
        if (touchedLatLng == null) {
            return;
        }
        mTouchedLatLng = touchedLatLng;
    }
}
