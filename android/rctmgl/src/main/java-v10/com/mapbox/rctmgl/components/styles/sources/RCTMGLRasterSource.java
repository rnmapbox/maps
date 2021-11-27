package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.geojson.Feature;
import com.mapbox.maps.extension.style.sources.generated.RasterSource;


public class RCTMGLRasterSource extends RCTMGLTileSource<RasterSource> {
    private Integer mTileSize;
    public static final int DEFAULT_TILE_SIZE = 512;

    public RCTMGLRasterSource(Context context) {
        super(context);
    }

    @Override
    public RasterSource makeSource() {
        String configurationUrl = getURL();

        int tileSize = mTileSize == null ? DEFAULT_TILE_SIZE : mTileSize;
        if (configurationUrl != null) {
            return new RasterSource.Builder(mID).url(configurationUrl).tileSize(tileSize).build();
        }
        return new RasterSource.Builder(mID).tileSet(buildTileset()).
                tileSize(tileSize).build();
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
