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
  // @ts-expect-error - @turf packages have type resolution issues with package.json exports
} from '@turf/helpers';
// @ts-expect-error - @turf packages have type resolution issues with package.json exports
import distance from '@turf/distance';
// @ts-expect-error - @turf packages have type resolution issues with package.json exports
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
