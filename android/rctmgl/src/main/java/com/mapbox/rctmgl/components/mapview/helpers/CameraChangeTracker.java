package com.mapbox.rctmgl.components.mapview.helpers;

import android.util.Log;

/**
 * Created by nickitaliano on 12/12/17.
 */

public class CameraChangeTracker {
    public static final int USER_GESTURE = 1;
    public static final int USER_ANIMATION = 2;
    public static final int SDK = 3;
    public static final int EMPTY = -1;

    private int reason;
    private boolean isRegionChangeAnimated;

    public void setReason(int reason) {
        this.reason = reason;
    }

    public void setRegionChangeAnimated(boolean isRegionChangeAnimated) {
        this.isRegionChangeAnimated = isRegionChangeAnimated;
    }

    public boolean isUserInteraction() {
        return reason == USER_GESTURE || reason == USER_ANIMATION;
    }

    public boolean isAnimated() {
        return isRegionChangeAnimated;
    }

    public boolean isEmpty() {
        return reason == EMPTY;
    }
}
