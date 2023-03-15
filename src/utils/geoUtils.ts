import {
  featureCollection,
  point,
  feature,
  lineString,
  Position,
  Properties,
  Id,
  BBox,
  FeatureCollection,
  Geometry,
  Point,
  Feature,
} from '@turf/helpers';
import distance from '@turf/distance';
import along from '@turf/along';

export const makePoint = point;

export const makeLineString = lineString;

export function makeLatLngBounds(
  northEastCoordinates: Position,
  southWestCoordinates: Position,
): FeatureCollection<Point> {
  return featureCollection([
    point(northEastCoordinates),
    point(southWestCoordinates),
  ]);
}

export const makeFeature = feature;

export function makeFeatureCollection<G = Geometry, P = Properties>(
  features: Array<Feature<G, P>> = [],
  options?: {
    bbox?: BBox;
    id?: Id;
  },
) {
  return featureCollection(features, options);
}

export function addToFeatureCollection(
  newFeatureCollection: FeatureCollection,
  newFeature: Feature,
): FeatureCollection {
  return {
    ...newFeatureCollection,
    features: [...newFeatureCollection.features, newFeature],
  };
}

export const calculateDistance = distance;

export const pointAlongLine = along;
