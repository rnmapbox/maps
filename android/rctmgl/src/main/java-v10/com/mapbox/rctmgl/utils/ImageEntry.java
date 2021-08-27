package com.mapbox.rctmgl.utils;

public class ImageEntry {
    public String uri;
    public double scale = 1.0;
    public static final double defaultScale = 0.0;

    public ImageEntry(String _uri, Double _scale) {
        uri = _uri;
        scale = _scale;
    }

    public ImageEntry(String _uri) {
        uri = _uri;
        scale = ImageEntry.defaultScale;
    }

    public double getScaleOr(double v) {
        if (scale == ImageEntry.defaultScale) {
            return v;
        } else {
            return scale;
        }
    }
}
