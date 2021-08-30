package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.maps.extension.style.sources.Source;
import com.mapbox.maps.extension.style.sources.TileSet;
import com.mapbox.maps.extension.style.sources.generated.Scheme;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;

@SuppressWarnings("unused")
public abstract class RCTMGLTileSource<T extends Source> extends RCTSource<T> {
    static final String TILE_SPEC_VERSION = "2.1.0";

    private String mURL;
    private Collection<String> mTileUrlTemplates = new ArrayList<>();
    private String mAttribution;

    private Integer mMinZoomLevel;
    private Integer mMaxZoomLevel;

    private boolean mIsTmsSource;

    public RCTMGLTileSource(Context context) {
        super(context);
    }

    public String getURL() {
        return mURL;
    }

    public void setURL(String mURL) {
        this.mURL = mURL;
    }

    public String getAttribution() {
        return mAttribution;
    }

    public void setAttribution(String mAttribution) {
        this.mAttribution = mAttribution;
    }

    public Integer getMinZoomLevel() {
        return mMinZoomLevel;
    }

    public void setMinZoomLevel(Integer mMinZoomLevel) {
        this.mMinZoomLevel = mMinZoomLevel;
    }

    public Integer getMaxZoomLevel() {
        return mMaxZoomLevel;
    }

    public void setMaxZoomLevel(Integer mMaxZoomLevel) {
        this.mMaxZoomLevel = mMaxZoomLevel;
    }

    public boolean getTMS() {
        return mIsTmsSource;
    }

    public void setTMS(boolean mIsTmsSource) {
        this.mIsTmsSource = mIsTmsSource;
    }

    public Collection<String> getTileUrlTemplates() {
        return mTileUrlTemplates;
    }

    public void setTileUrlTemplates(Collection<String> tileUrlTemplates) {
        this.mTileUrlTemplates = tileUrlTemplates;
    }

    public TileSet buildTileset() {
        String[] tileUrlTemplates = mTileUrlTemplates.toArray(new String[mTileUrlTemplates.size()]);
        TileSet.Builder builder = new TileSet.Builder(
            TILE_SPEC_VERSION, Arrays.asList(tileUrlTemplates.clone()));

        if (mMinZoomLevel != null) {
            builder.minZoom((int) mMinZoomLevel.floatValue());
        }

        if (mMaxZoomLevel != null) {
            builder.maxZoom((int) mMaxZoomLevel.floatValue());
        }

        if (mIsTmsSource) {
            builder.scheme(Scheme.TMS);
        }

        if (mAttribution != null) {
            builder.attribution(mAttribution);
        }

        TileSet tileSet = builder.build();

        return tileSet;
    }
}
