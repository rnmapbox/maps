package com.rnmapbox.rnmbx.v11compat.snapshot;

import android.graphics.Bitmap
import com.mapbox.maps.Image
import com.mapbox.maps.MapSnapshotOptions
import com.mapbox.maps.Snapshotter
import com.mapbox.maps.toMapboxImage as _toMapboxImage

fun MapSnapshotOptions.Builder.accessToken(accessToken: String?) {
  // blank on v11
}


fun Snapshotter.startV11(callback: (Bitmap?, String?)-> Unit) {
    this.start(null, callback)
}

// toMapboxImage

fun Bitmap.toMapboxImage(): Image {
    return this._toMapboxImage()
}