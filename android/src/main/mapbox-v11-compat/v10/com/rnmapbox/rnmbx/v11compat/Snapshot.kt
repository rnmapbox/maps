package com.rnmapbox.rnmbx.v11compat.snapshot;

import com.mapbox.maps.Image
import com.mapbox.maps.MapSnapshotInterface;
import com.mapbox.maps.MapSnapshotOptions
import com.mapbox.maps.ResourceOptions;
import com.mapbox.maps.Snapshotter
import com.mapbox.maps.bitmap


fun MapSnapshotOptions.Builder.accessToken(accessToken: String?) {
  if (accessToken != null) {
    this.resourceOptions(
      ResourceOptions.Builder().accessToken(accessToken).build()
    )
  }
}


fun MapSnapshotInterface.toMapboxImage(): Image {
    return this.image()
}

fun Snapshotter.startV11(callback: (MapSnapshotInterface?, String?) -> Unit) {
   this.start { image ->
      callback(image, if (image == null) "Snapshot error" else null)
   }
}