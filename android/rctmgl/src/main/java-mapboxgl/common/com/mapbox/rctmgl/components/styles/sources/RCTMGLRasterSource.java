package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.geojson.Feature;
import com.mapbox.mapboxsdk.style.sources.RasterSource;

import static com.mapbox.mapboxsdk.style.sources.RasterSource.DEFAULT_TILE_SIZE;

/**
 * Created by nickitaliano on 9/25/17.
 */

public class RCTMGLRasterSource extends RCTMGLTileSource<RasterSource> {
    private Integer mTileSize;

    public RCTMGLRasterSource(Context context) {
        super(context);
    }

    @Override
    public RasterSource makeSource() {
        String configurationUrl = getURL();
        int tileSize = mTileSize == null ? DEFAULT_TILE_SIZE : mTileSize;
        if (configurationUrl != null) {
            return new RasterSource(mID, configurationUrl, tileSize);
        }
        return new RasterSource(mID, buildTileset(), tileSize);
    }


    public void setTileSize(int tileSize) {
        mTileSize = tileSize;
    }

    @Override
    public boolean hasPressListener() {
        return false;
    }

    @Override
    public void onPress(OnPressEvent feature) {
        // ignore, cannot query raster layers
    }
}
