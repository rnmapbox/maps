package com.mapbox.rctmgl.components.annotation;

import android.content.Context;
import android.graphics.Bitmap;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;

/**
 * Created by nickitaliano on 9/27/17.
 */

public class RCTMGLPointAnnotationAdapter extends MapboxMap.MarkerViewAdapter<RCTMGLPointAnnotation.CustomView> {
    private RCTMGLMapView mMapView;
    private LayoutInflater mInflater;

    public RCTMGLPointAnnotationAdapter(RCTMGLMapView mapView, Context context) {
        super(context);
        mMapView = mapView;
        mInflater = LayoutInflater.from(context);
    }

    @Nullable
    @Override
    public View getView(@NonNull RCTMGLPointAnnotation.CustomView customAnnotationView, @Nullable View convertView, @NonNull ViewGroup parent) {
        final RCTMGLPointAnnotation pointAnnotation = mMapView.getPointAnnotationByID(customAnnotationView.getAnnotationID());

        if (pointAnnotation == null) {
            return null;
        }

        int width = pointAnnotation.getWidth();
        int height = pointAnnotation.getHeight();

        ViewHolder viewholder;
        if (convertView == null) {
            viewholder = new ViewHolder();
            convertView = mInflater.inflate(R.layout.annotation, parent, false);
            viewholder.imageView = (ImageView) convertView.findViewById(R.id.annotation_img);
            viewholder.customLayout = (LinearLayout) convertView.findViewById(R.id.annotation_view_container);
            convertView.setTag(viewholder);
        } else {
            viewholder = (ViewHolder) convertView.getTag();
        }

        viewholder.customLayout.removeAllViews();

        if (customAnnotationView.isDefaultIcon()) {
            Bitmap bitmap = IconFactory.getInstance(getContext()).defaultMarkerView().getBitmap();
            viewholder.imageView.setImageBitmap(bitmap);
            viewholder.imageView.setContentDescription(customAnnotationView.getTitle());
            width = bitmap.getWidth();
            height = bitmap.getHeight();
        } else {
            if (pointAnnotation.getParent() != null) {
                ViewGroup reactParent = (ViewGroup) pointAnnotation.getParent();
                reactParent.removeView(pointAnnotation);
            }
            viewholder.imageView.setImageBitmap(null);
            viewholder.customLayout.addView(pointAnnotation);
        }

        ViewGroup.LayoutParams layoutParams = convertView.getLayoutParams();
        if (layoutParams == null) {
            convertView.setLayoutParams(new RelativeLayout.LayoutParams(width, height));
        } else {
            layoutParams.width = width;
            layoutParams.height = height;
        }

        if (Build.VERSION.SDK_INT >= 21) {
            convertView.setZ(getZIndex(pointAnnotation));
        }

        mMapView.reflow();
        return convertView;
    }

    private float getZIndex(RCTMGLPointAnnotation pointAnnotation) {
        float latitudeMax = 90.0f;
        LatLng latLng = pointAnnotation.getLatLng();
        return latitudeMax - (float)latLng.getLatitude();
    }

    private static class ViewHolder {
        ImageView imageView;
        LinearLayout customLayout;
    }
}
