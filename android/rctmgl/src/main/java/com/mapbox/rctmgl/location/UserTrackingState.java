package com.mapbox.rctmgl.location;

/**
 * Created by nickitaliano on 12/13/17.
 */

public class UserTrackingState {
    // The map view not yet tracked the user location
    public static final int POSSIBLE = 0;

    // The map view has begun to move to the first user location
    public static final int BEGAN = 1;

    // The map views begins a significant transition
    public static final int SIGNIFICANT_TRANSITION = 2;

    // The map view has finished moving to the user location
    public static final int CHANGED = 3;
}
