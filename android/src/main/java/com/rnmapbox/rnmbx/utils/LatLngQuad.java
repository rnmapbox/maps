package com.rnmapbox.rnmbx.utils;

import java.util.ArrayList;
import java.util.List;

public class LatLngQuad {
    private final LatLng topLeft;
    private final LatLng topRight;
    private final LatLng bottomRight;
    private final LatLng bottomLeft;

    public LatLngQuad(LatLng topLeft, LatLng topRight, LatLng bottomRight, LatLng bottomLeft) {
        this.topLeft = topLeft;
        this.topRight = topRight;
        this.bottomRight = bottomRight;
        this.bottomLeft = bottomLeft;
    }

    public List<List<Double>> getCoordinates() {
        ArrayList<List<Double>> result = new ArrayList<>();
        result.add(topLeft.getArray());
        result.add(topRight.getArray());
        result.add(bottomRight.getArray());
        result.add(bottomLeft.getArray());
        return result;
    }
}