package mapbox.rctmgl.events;

import android.view.View;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by nickitaliano on 8/27/17.
 */

abstract public class AbstractRCTMGLEvent implements IRCTMGLEvent {
    private int mTagID;
    private String mEventType;

    public AbstractRCTMGLEvent(View view, String eventType) {
        mEventType = eventType;
        mTagID = view.getId();
    }

    public int getID() {
        return mTagID;
    }

    public String getType() {
        return mEventType;
    }

    public WritableMap getPayload() {
        return Arguments.createMap();
    }

    public WritableMap toJSON() {
        WritableMap map = Arguments.createMap();
        map.putString("type", getType());
        map.putMap("payload", getPayload());
        return map;
    }
}
