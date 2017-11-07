package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.mapboxsdk.style.sources.VectorSource;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSource extends RCTSource<VectorSource> {
    private String mURL;

    public RCTMGLVectorSource(Context context) {
        super(context);
    }

    public void setURL(String url) {
        mURL = url;
    }

    @Override
    public VectorSource makeSource() {
        if (isDefaultSource(mID)) {
            return (VectorSource)mMap.getSource(DEFAULT_ID);
        }
        return new VectorSource(mID, mURL);
    }
}
