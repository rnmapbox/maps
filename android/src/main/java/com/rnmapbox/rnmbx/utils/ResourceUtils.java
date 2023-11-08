package com.rnmapbox.rnmbx.utils;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.drawable.Drawable;
import androidx.core.content.ContextCompat;

public class ResourceUtils {
    public static Drawable getDrawableByName(Context context, String resourceName) {
        if (context == null || resourceName == null || resourceName.isEmpty()) {
            return null;
        }

        Resources resources = context.getResources();
        if (resources == null) {
            return null;
        }

        final int resID = resources.getIdentifier(resourceName, "drawable", context.getPackageName());
        if (resID == 0) {
            return null;
        }
        
        return ContextCompat.getDrawable(context, resID);
    }
}
