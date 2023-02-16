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
import geoViewport from '@mapbox/geo-viewport';

const VECTOR_TILE_SIZE = 512;

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

export function getOrCalculateVisibleRegion(
  coord: [number, number],
  zoomLevel: number,
  width: number,
  height: number,
  nativeRegion: {
    properties: {
      visibleBounds: number[][];
    };
  },
) {
  const region = {
    ne: [0, 0],
    sw: [0, 0],
  };

  if (!nativeRegion || !Array.isArray(nativeRegion.properties.visibleBounds)) {
    const bounds = geoViewport.bounds(
      coord,
      zoomLevel,
      [width, height],
      VECTOR_TILE_SIZE,
    );
    region.ne = [bounds[3], bounds[2]];
    region.sw = [bounds[1], bounds[0]];
  } else {
    [region.ne, region.sw] = nativeRegion.properties.visibleBounds;
  }

  return region;
}
