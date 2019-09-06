import {featureCollection, point, feature, lineString} from '@turf/helpers';
import distance from '@turf/distance';
import along from '@turf/along';
import geoViewport from '@mapbox/geo-viewport';

const VECTOR_TILE_SIZE = 512;

export function makePoint(coordinates, properties) {
  return point(coordinates, properties);
}

export function makeLineString(coordinates, properties) {
  return lineString(coordinates, properties);
}

export function makeLatLngBounds(northEastCoordinates, southWestCoordinates) {
  return featureCollection([
    point(northEastCoordinates),
    point(southWestCoordinates),
  ]);
}

export function makeFeature(geometry, properties) {
  return feature(geometry, properties);
}

export function makeFeatureCollection(features = []) {
  return featureCollection(features);
}

export function addToFeatureCollection(newFeatureCollection, newFeature) {
  return {
    ...newFeatureCollection,
    features: [...newFeatureCollection.features, newFeature],
  };
}

export function calculateDistance(origin, dest) {
  return distance(origin, dest);
}

export function pointAlongLine(newLineString, distAlong) {
  return along(newLineString, distAlong);
}

export function getOrCalculateVisibleRegion(
  coord,
  zoomLevel,
  width,
  height,
  nativeRegion,
) {
  const region = {
    ne: [0, 0],
    sw: [0, 0],
  };

  if (!nativeRegion || !Array.isArray(nativeRegion.visibleBounds)) {
    const bounds = geoViewport.bounds(
      coord,
      zoomLevel,
      [width, height],
      VECTOR_TILE_SIZE,
    );
    region.ne = [bounds[3], bounds[2]];
    region.sw = [bounds[1], bounds[0]];
  } else {
    region.ne = nativeRegion.properties.visibleBounds[0];
    region.sw = nativeRegion.properties.visibleBounds[1];
  }

  return region;
}
