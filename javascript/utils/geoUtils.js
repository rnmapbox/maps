import turfHelpers from '@turf/helpers';

export function makePoint (coordinates) {
  return turfHelpers.point(coordinates);
}

export function makeLatLngBounds (northEastCoordinates, southWestCoordinates) {
  return turfHelpers.featureCollection([
    turfHelpers.point(northEastCoordinates),
    turfHelpers.point(southWestCoordinates),
  ]);
}
