package mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.WritableMap;
import com.mapbox.mapboxsdk.geometry.LatLng;

import mapbox.rctmgl.utils.MGLGeoUtils;

/**
 * Created by nickitaliano on 8/23/17.
 */

public class RCTMGLMapClickEvent implements IRCTMGLEvent {
    private int mTagID;
    private LatLng mTouchedLatLng;

    public RCTMGLMapClickEvent(View view) {
        mTagID = view.getId();
    }

    public String getName() {
        return RCTMGLEventNames.MAP_CLICK;
    }

    public int getID() {
        return mTagID;
    }

    public WritableMap toWritableMap() {
        return MGLGeoUtils.latLngToWritableMap(mTouchedLatLng);
    }

    public void setLatLng(LatLng touchedLatLng) {
        if (touchedLatLng == null) {
            return;
        }
        mTouchedLatLng = touchedLatLng;
    }
}
