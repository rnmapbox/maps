package mapbox.rctmgl.events;

import android.view.View;

/**
 * Created by nickitaliano on 8/24/17.
 */

public class RCTMGLMapLongClickEvent extends RCTMGLMapClickEvent {
    public RCTMGLMapLongClickEvent(View view) {
        super(view);
    }

    @Override
    public String getName() {
        return RCTMGLEventNames.MAP_LONG_CLICK;
    }
}
