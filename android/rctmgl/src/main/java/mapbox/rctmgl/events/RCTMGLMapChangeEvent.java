package mapbox.rctmgl.events;

import android.view.View;

/**
 * Created by nickitaliano on 8/27/17.
 */

public class RCTMGLMapChangeEvent extends AbstractRCTMGLEvent {
    public RCTMGLMapChangeEvent(View view, String eventType) {
        super(view, eventType);
    }

    @Override
    public String getKey() {
       return RCTMGLEventKeys.MAP_ONCHANGE;
    }
}
