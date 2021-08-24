package com.mapbox.rctmgl.components.mapview.helpers;

import android.util.Log;

public class CameraChangeTracker {
    public static final int USER_GESTURE = 1;
    public static final int DEVELOPER_ANIMATION = 2;
    public static final int SDK_ANIMATION = 3;
    public static final int EMPTY = -1;

    private int reason = EMPTY;
    private boolean isAnimating;

    public void setReason(int reason) {
        this.reason = reason;
    }

    public void setIsAnimating(boolean isAnimating) {
        this.isAnimating = isAnimating;
    }

    public boolean isUserInteraction() {
        return reason == USER_GESTURE || reason == DEVELOPER_ANIMATION;
    }

    public boolean isAnimated() {
        return reason == DEVELOPER_ANIMATION || reason == SDK_ANIMATION;
    }

    public boolean isAnimating() {
        return this.isAnimating;
    }

    public boolean isEmpty() {
        return reason == EMPTY;
    }
}
