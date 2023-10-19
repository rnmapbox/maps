package com.rnmapbox.rnmbx.v11compat.feature;

import com.mapbox.geojson.Feature;

import com.mapbox.maps.QueriedRenderedFeature as _QueriedRenderedFeature;
import com.mapbox.maps.QueriedSourceFeature as _QueriedSourceFeature;

typealias QueriedRenderedFeature = _QueriedRenderedFeature;

val QueriedRenderedFeature.feature: Feature
    get() = this.queriedFeature.feature

typealias QueriedSourceFeature = _QueriedSourceFeature

val QueriedSourceFeature.feature: Feature
    get() = this.queriedFeature.feature
