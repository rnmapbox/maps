package com.mapbox.rctmgl.impl;

import com.mapbox.mapboxsdk.maps.TelemetryDefinition;
import com.mapbox.mapboxsdk.Mapbox;

public class TelemetryImpl {
  static public void setUserTelemetryRequestState(final boolean telemetryEnabled) {
    TelemetryDefinition telemetry = Mapbox.getTelemetry();
    telemetry.setUserTelemetryRequestState(telemetryEnabled);
  }
}
