package com.mapbox.reactnativemapboxgl;


/**
 * Prefix all the internal event names with mapbox so that they don't clobber or get clobbered
 * by events with the same name in other libraries. None of this will be visible to the user.
 * The callback names will remain normal.
 */
public class ReactNativeMapboxGLEventTypes {
    public static String ON_REGION_DID_CHANGE = "mapbox.onRegionDidChange";
    public static String ON_REGION_WILL_CHANGE = "mapbox.onRegionWillChange";
    public static String ON_OPEN_ANNOTATION = "mapbox.onOpenAnnotation";
    public static String ON_RIGHT_ANNOTATION_TAPPED = "mapbox.onRightAnnotationTapped";
    public static String ON_CHANGE_USER_TRACKING_MODE = "mapbox.onChangeUserTrackingMode";
    public static String ON_UPDATE_USER_LOCATION = "mapbox.onUpdateUserLocation";
    public static String ON_LONG_PRESS = "mapbox.onLongPress";
    public static String ON_TAP = "mapbox.onTap";
    public static String ON_FINISH_LOADING_MAP = "mapbox.onFinishLoadingMap";
    public static String ON_START_LOADING_MAP = "mapbox.onStartLoadingMap";
    public static String ON_LOCATE_USER_FAILED = "mapbox.onLocateUserFailed";

    private ReactNativeMapboxGLEventTypes() {}
}
