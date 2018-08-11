package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Movie;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;
import android.util.Log;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper;
import com.mapbox.mapboxsdk.geometry.LatLngQuad;
import com.mapbox.mapboxsdk.style.sources.ImageSource;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.services.commons.geojson.Feature;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 11/29/17.
 */

public class RCTMGLImageSource extends RCTSource<ImageSource> {
    public static final String LOG_TAG = RCTMGLImageSource.class.getSimpleName();

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
    public void onPress(Feature feature) {
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
                    mSource.setUrl(mURL);
                }
            }

        } catch (MalformedURLException e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }


    public void setCoordinates(LatLngQuad coordQuad) {
        mCoordQuad = coordQuad;
    }
}
