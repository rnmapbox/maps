package mapbox.rctmgl.utils;

import com.mapbox.mapboxsdk.constants.Style;

/**
 * Created by nickitaliano on 8/21/17.
 */


public enum RCTMGLMapStyleURL {
    Streets("mapbox-streets", Style.MAPBOX_STREETS),
    Dark("mapbox-dark", Style.DARK),
    Light("mapbox-light", Style.LIGHT),
    Outdoors("mapbox-outdoors", Style.OUTDOORS),
    Satellite("mapbox-satellite", Style.SATELLITE);

    private String mKey;
    private String mURL;

    RCTMGLMapStyleURL(String key, String url) {
        mKey = key;
        mURL = url;
    }

    private String getKey() {
        return mKey;
    }

    public String getURL() {
        return mURL;
    }

    public static RCTMGLMapStyleURL fromKey(String key) {
        for (RCTMGLMapStyleURL mapStyle: RCTMGLMapStyleURL.values()) {
            if (mapStyle.getKey().equals(key)) {
                return mapStyle;
            }
        }
        return null;
    }
}
