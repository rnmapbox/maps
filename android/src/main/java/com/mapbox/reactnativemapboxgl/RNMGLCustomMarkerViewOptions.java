package com.mapbox.reactnativemapboxgl;

import android.graphics.Bitmap;
import android.os.Parcel;
import android.os.Parcelable;

import com.mapbox.mapboxsdk.annotations.BaseMarkerViewOptions;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import com.mapbox.mapboxsdk.geometry.LatLng;

public class RNMGLCustomMarkerViewOptions extends BaseMarkerViewOptions<RNMGLCustomMarkerView, RNMGLCustomMarkerViewOptions> {
    private String annotationId;

    public RNMGLCustomMarkerViewOptions() {}

    protected RNMGLCustomMarkerViewOptions(Parcel in) {
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
        annotationId(in.readString());
    }

    @Override
    public RNMGLCustomMarkerViewOptions getThis() {
        return this;
    }

    @Override
    public RNMGLCustomMarkerView getMarker() {
        return new RNMGLCustomMarkerView(this, annotationId);
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
        out.writeFloat(getAlpha());
        Icon icon = getIcon();
        out.writeByte((byte) (icon != null ? 1 : 0));
        if (icon != null) {
            out.writeString(getIcon().getId());
            out.writeParcelable(getIcon().getBitmap(), flags);
        }
        out.writeString(annotationId);
    }

    public RNMGLCustomMarkerViewOptions annotationId(String annotationId) {
        this.annotationId = annotationId;
        return getThis();
    }

    public static final Parcelable.Creator<RNMGLCustomMarkerViewOptions> CREATOR
            = new Parcelable.Creator<RNMGLCustomMarkerViewOptions>() {
        public RNMGLCustomMarkerViewOptions createFromParcel(Parcel in) {
            return new RNMGLCustomMarkerViewOptions(in);
        }

        public RNMGLCustomMarkerViewOptions[] newArray(int size) {
            return new RNMGLCustomMarkerViewOptions[size];
        }
    };

}
