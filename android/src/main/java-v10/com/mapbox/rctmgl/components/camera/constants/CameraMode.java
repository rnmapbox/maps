package com.mapbox.rctmgl.components.camera.constants;

import androidx.annotation.IntDef;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

public class CameraMode {

    @IntDef({ FLIGHT, EASE, LINEAR, NONE })
    @Retention(RetentionPolicy.SOURCE)
    public @interface Mode {}

    public static final int FLIGHT = 1;
    public static final int EASE = 2;
    public static final int LINEAR = 3;
    public static final int NONE = 4;
}
