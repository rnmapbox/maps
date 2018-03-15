import turfHelpers from '@turf/helpers';

export function makePoint(coordinates, properties) {
  return turfHelpers.point(coordinates, properties);
}

export function makeLatLngBounds(northEastCoordinates, southWestCoordinates) {
  return turfHelpers.featureCollection([
    turfHelpers.point(northEastCoordinates),
    turfHelpers.point(southWestCoordinates),
  ]);
}

export function makeFeature(geometry, properties) {
  return turfHelpers.feature(geometry, properties);
}

export function makeFeatureCollection(features = []) {
  return turfHelpers.featureCollection(features);
}

export function addToFeatureCollection(featureCollection, feature) {
  let shallowFeatureCollection = Object.assign({}, featureCollection);
  shallowFeatureCollection.features.push(feature);
  return featureCollection;
}
