package mapbox.rctmgl.modules;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.mapbox.mapboxsdk.Mapbox;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLModule extends ReactContextBaseJavaModule {
    public static final String REACT_CLASS = RCTMGLModule.class.getSimpleName();

    private Handler mUiThreadHandler;

    public RCTMGLModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        mUiThreadHandler = new Handler(Looper.getMainLooper());
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void setAccessToken(final String accessToken) {
        mUiThreadHandler.post(new Runnable() {
            @Override
            public void run() {
                Mapbox.getInstance(getReactApplicationContext(), accessToken);
            }
        });
    }

    @ReactMethod
    public void getAccessToken(Promise promise) {
        WritableMap map = Arguments.createMap();
        map.putString("accessToken", Mapbox.getAccessToken());
        promise.resolve(map);
    }

    @ReactMethod
    public void requestPermissions(Promise promise) {
        if (Build.VERSION.SDK_INT < 23) {
            return;
        }

        requestPermissionsIfNeeded(new String[]{
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
        });
    }

    private void requestPermissionsIfNeeded(final String[] permissions) {
        Activity curActivity = getCurrentActivity();
        if (curActivity == null) {
            return;
        }

        List<String> permissionsToCheck = new ArrayList<>();
        for (String permission: permissions) {
            int permissionCheck = ContextCompat.checkSelfPermission(curActivity, permission);

            if (permissionCheck != PackageManager.PERMISSION_GRANTED) {
                permissionsToCheck.add(permission);
            }
        }

        int checkCount = permissionsToCheck.size();
        if (checkCount > 0) {
            ActivityCompat.requestPermissions(
                    curActivity, permissionsToCheck.toArray(new String[checkCount]), 0);
        }
    }
}
