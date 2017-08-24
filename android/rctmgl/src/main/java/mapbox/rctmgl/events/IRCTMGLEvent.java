package mapbox.rctmgl.events;

import com.facebook.react.bridge.WritableMap;

/**
 * Created by nickitaliano on 8/23/17.
 */

public interface IRCTMGLEvent {
    int getID();
    String getName();
    WritableMap toWritableMap();
}
