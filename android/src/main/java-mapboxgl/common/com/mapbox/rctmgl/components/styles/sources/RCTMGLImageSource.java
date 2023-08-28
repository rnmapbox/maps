package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.util.Log;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper;
import com.mapbox.geojson.Feature;
import com.mapbox.mapboxsdk.geometry.LatLngQuad;
import com.mapbox.mapboxsdk.style.sources.ImageSource;

import java.net.MalformedURLException;
import java.net.URL;

import android.net.Uri;

/**
 * Created by nickitaliano on 11/29/17.
 */

public class RCTMGLImageSource extends RCTSource<ImageSource> {
    public static final String LOG_TAG = "RCTMGLImageSource";

    private URL mURL;
    private int mResourceId;
    private LatLngQuad mCoordQuad;

    public RCTMGLImageSource(Context context) {
        super(context);
    }

    @Override
    public ImageSource makeSource() {
        if (this.mURL == null) {
            return new ImageSource(mID, mCoordQuad, this.mResourceId);
        }
        return new ImageSource(mID, mCoordQuad, mURL);
    }

    @Override
    public void onPress(OnPressEvent feature) {
        // ignore, we cannot query raster layers
    }

    public void setURL(String url) {
        try {
            Uri uri = Uri.parse(url);

            if (uri.getScheme() == null) {
                this.mResourceId = ResourceDrawableIdHelper.getInstance().getResourceDrawableId(this.getContext(), url);

                if (mSource != null) {
                    mSource.setImage(this.mResourceId);
                }

            } else {

                mURL = new URL(url);

                if (mSource != null) {
                    mSource.setUri(mURL.toURI());
                }
            }

        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }


    public void setCoordinates(LatLngQuad coordQuad) {
        mCoordQuad = coordQuad;
        try {
            if (mSource != null) {
                mSource.setCoordinates(this.mCoordQuad);
            }
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }
}
