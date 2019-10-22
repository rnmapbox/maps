package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.mapboxsdk.style.sources.Source;
import com.mapbox.mapboxsdk.style.sources.TileSet;

import java.util.Collection;

@SuppressWarnings("unused")
public abstract class RCTMGLTileSource<T extends Source> extends RCTSource<T> {
    static final String TILE_SPEC_VERSION = "2.1.0";

    private String mURL;
    private Collection<String> mTileUrlTemplates;
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
        TileSet tileSet = new TileSet(TILE_SPEC_VERSION, tileUrlTemplates);

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
}
