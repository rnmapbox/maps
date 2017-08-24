package mapbox.rctmgl.components;

import android.view.ViewGroup;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

import mapbox.rctmgl.events.IRCTMGLEvent;

/**
 * Created by nickitaliano on 8/23/17.
 */

abstract public class RCTAbstractEventEmitter<T extends ViewGroup> extends ViewGroupManager<T> {
    private ReactApplicationContext mRCTAppContext;

    public RCTAbstractEventEmitter(ReactApplicationContext reactApplicationContext) {
        mRCTAppContext = reactApplicationContext;
    }

    public void handleEvent(IRCTMGLEvent event) {
        getEventEmitter().receiveEvent(event.getID(), event.getName(), event.toWritableMap());
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        Map<String, String> events = customEvents();
        Map<String, Object> exportedEvents = new HashMap<>();

        for (Map.Entry<String, String> event : events.entrySet()) {
            exportedEvents.put(event.getKey(), MapBuilder.of("registrationName", event.getValue()));
        }

        return exportedEvents;
    }

    public abstract Map<String, String> customEvents();

    private RCTEventEmitter getEventEmitter() {
        return mRCTAppContext.getJSModule(RCTEventEmitter.class);
    }
}
