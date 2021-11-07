package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.util.Log;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper;
import com.mapbox.geojson.Feature;
import com.mapbox.maps.extension.style.sources.generated.ImageSource;
import com.mapbox.rctmgl.utils.LatLngQuad;

import java.net.MalformedURLException;
import java.net.URL;

import android.net.Uri;

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
            throw new RuntimeException("ImageSource Resource id not supported in v10");
        }
        return new ImageSource.Builder(mID).coordinates(mCoordQuad.getCoordinates()).url(mURL.toString()).build();
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
                    throw new RuntimeException("ImageSource Resource id not supported in v10");
                }

            } else {

                mURL = new URL(url);

                if (mSource != null) {
                    mSource.url(mURL.toString());
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
                mSource.coordinates(this.mCoordQuad.getCoordinates());
            }
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }
}
