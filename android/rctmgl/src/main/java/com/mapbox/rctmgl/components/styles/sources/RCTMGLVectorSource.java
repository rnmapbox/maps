package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.mapboxsdk.style.sources.VectorSource;
import com.mapbox.rctmgl.events.FeatureClickEvent;
import com.mapbox.services.commons.geojson.Feature;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSource extends RCTSource<VectorSource> {
    private String mURL;
    private RCTMGLVectorSourceManager mManager;

    public RCTMGLVectorSource(Context context, RCTMGLVectorSourceManager manager) {
        super(context);
        mManager = manager;
    }

    public void setURL(String url) {
        mURL = url;
    }

    public void onPress(Feature feature) {
        mManager.handleEvent(FeatureClickEvent.makeVectorSourceEvent(this, feature));
    }

    @Override
    public VectorSource makeSource() {
        if (isDefaultSource(mID)) {
            return (VectorSource)mMap.getSource(DEFAULT_ID);
        }
        return new VectorSource(mID, mURL);
    }
}
