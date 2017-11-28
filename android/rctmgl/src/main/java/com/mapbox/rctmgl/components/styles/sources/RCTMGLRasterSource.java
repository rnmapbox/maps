package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.mapboxsdk.style.sources.RasterSource;
import com.mapbox.mapboxsdk.style.sources.TileSet;
import com.mapbox.services.commons.geojson.Feature;

/**
 * Created by nickitaliano on 9/25/17.
 */

public class RCTMGLRasterSource extends RCTSource<RasterSource> {
    public static final String TILE_SPEC_VERSION = "2.1.0";

    private String mURL;
    private String mAttribution;

    private Integer mTileSize;
    private Integer mMinZoomLevel;
    private Integer mMaxZoomLevel;

    private boolean mIsTmsSource;

    public RCTMGLRasterSource(Context context) {
        super(context);
    }

    @Override
    public RasterSource makeSource() {
        return new RasterSource(mID, buildTileset(), mTileSize);
    }

    public void setURL(String url) {
        mURL = url;
    }

    public void setTileSize(int tileSize) {
        mTileSize = tileSize;
    }

    public void setMinZoomLevel(int minZoomLevel) {
        mMinZoomLevel = minZoomLevel;
    }

    public void setMaxZoomLevel(int maxZoomLevel) {
        mMaxZoomLevel = maxZoomLevel;
    }

    public void setTMS(boolean tms) {
        mIsTmsSource = tms;
    }

    public void setAttribution(String attribution) {
        mAttribution = attribution;
    }

    private TileSet buildTileset() {
        TileSet tileSet = new TileSet(TILE_SPEC_VERSION, mURL);

        if (mMinZoomLevel != null) {
            tileSet.setMinZoom(mMinZoomLevel.floatValue());
        }

        if (mMaxZoomLevel != null) {
            tileSet.setMaxZoom(mMaxZoomLevel.floatValue());
        }

        if (mIsTmsSource) {
            tileSet.setScheme("tms");
        }

        if (mAttribution != null) {
            tileSet.setAttribution(mAttribution);
        }

        return tileSet;
    }

    @Override
    public boolean hasPressListener() {
        return false;
    }

    @Override
    public void onPress(Feature feature) {
        // ignore, cannot query raster layers
    }
}
