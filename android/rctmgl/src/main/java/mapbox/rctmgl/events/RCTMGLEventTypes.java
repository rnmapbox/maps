package mapbox.rctmgl.events;

/**
 * Created by nickitaliano on 8/24/17.
 */

public class RCTMGLEventTypes {
    public static final String MAP_CLICK = "press";
    public static final String MAP_LONG_CLICK = "longpress";

    public static final String REGION_WILL_CHANGE = "regionwillchange";
    public static final String REGION_IS_CHANGING = "regionischanging";
    public static final String REGION_DID_CHANGE  = "regiondidchange";

    public static final String WILL_START_LOADING_MAP = "willstartloadingmap";
    public static final String DID_FINISH_LOADING_MAP = "didfinishloadingmap";
    public static final String DID_FAIL_LOADING_MAP = "didfailloadingmap";

    public static final String WILL_START_RENDERING_FRAME = "willstartrenderingframe";
    public static final String DID_FINISH_RENDERING_FRAME = "didfinishrenderingframe";
    public static final String DID_FINISH_RENDERING_FRAME_FULLY = "didfinishrenderingframefully";

    public static final String WILL_START_RENDERING_MAP = "willstartrenderingmap";
    public static final String DID_FINISH_RENDERING_MAP = "didfinishrenderingmap";
    public static final String DID_FINISH_RENDERING_MAP_FULLY = "didfinishrenderingmapfully";

    public static final String DID_FINISH_LOADING_STYLE = "didfinishloadingstyle";
}
