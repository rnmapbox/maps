package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;

import com.mapbox.rctmgl.components.AbstractMapFeature;

public abstract class AbstractSourceConsumer extends AbstractMapFeature {
    public AbstractSourceConsumer(Context context) {
        super(context);
    }

    abstract public String getID();
}
