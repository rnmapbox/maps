package com.mapbox.rctmgl.components.annotation;

import android.graphics.Bitmap;
import android.os.Parcel;
import android.os.Parcelable;

import com.mapbox.mapboxsdk.annotations.BaseMarkerViewOptions;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;

/**
 * Created by nickitaliano on 9/27/17.
 */

public class RCTMGLPointAnnotationOptions extends BaseMarkerViewOptions<RCTMGLPointAnnotation.CustomView, RCTMGLPointAnnotationOptions> {
    private String mAnnotationID;
    private boolean mHasChildren;

    public RCTMGLPointAnnotationOptions() {}

    protected RCTMGLPointAnnotationOptions(Parcel in) {
        position((LatLng) in.readParcelable(LatLng.class.getClassLoader()));
        snippet(in.readString());
        title(in.readString());
        flat(in.readByte() != 0);
        anchor(in.readFloat(), in.readFloat());
        infoWindowAnchor(in.readFloat(), in.readFloat());
        rotation(in.readFloat());
        visible(in.readByte() != 0);
        alpha(in.readFloat());
        if (in.readByte() != 0) {
            // this means we have an icon
            String iconId = in.readString();
            Bitmap iconBitmap = in.readParcelable(Bitmap.class.getClassLoader());
            Icon icon = IconFactory.recreate(iconId, iconBitmap);
            icon(icon);
        }
        annotationID(in.readString());
        hasChildren(in.readByte() != 0);
    }

    @Override
    public RCTMGLPointAnnotationOptions getThis() {
        return this;
    }

    @Override
    public RCTMGLPointAnnotation.CustomView getMarker() {
        return new RCTMGLPointAnnotation.CustomView(getAnnotationID(), this);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel out, int flags) {
        out.writeParcelable(getPosition(), flags);
        out.writeString(getSnippet());
        out.writeString(getTitle());
        out.writeByte((byte) (isFlat() ? 1 : 0));
        out.writeFloat(getAnchorU());
        out.writeFloat(getAnchorV());
        out.writeFloat(getInfoWindowAnchorU());
        out.writeFloat(getInfoWindowAnchorV());
        out.writeFloat(getRotation());
        out.writeByte((byte) (isVisible() ? 1 : 0));
        out.writeFloat(alpha);
        Icon icon = getIcon();
        out.writeByte((byte) (icon != null ? 1 : 0));
        if (icon != null) {
            out.writeString(getIcon().getId());
            out.writeParcelable(getIcon().getBitmap(), flags);
        }
        out.writeString(getAnnotationID());
        out.writeByte((byte) (getHasChildren() ? 1 : 0));
    }

    public RCTMGLPointAnnotationOptions annotationID(String id) {
        mAnnotationID = id;
        return getThis();
    }

    public RCTMGLPointAnnotationOptions hasChildren(boolean hasChildren) {
        mHasChildren = hasChildren;
        return getThis();
    }

    public String getAnnotationID() {
        return mAnnotationID;
    }

    public boolean getHasChildren() {
        return mHasChildren;
    }

    public static final Parcelable.Creator<RCTMGLPointAnnotationOptions> CREATOR =
            new Parcelable.Creator<RCTMGLPointAnnotationOptions>() {
                @Override
                public RCTMGLPointAnnotationOptions createFromParcel(Parcel in) {
                    return new RCTMGLPointAnnotationOptions(in);
                }

                @Override
                public RCTMGLPointAnnotationOptions[] newArray(int size) {
                    return new RCTMGLPointAnnotationOptions[size];
                }
            };
}
