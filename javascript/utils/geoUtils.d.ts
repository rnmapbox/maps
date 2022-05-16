export function makePoint<P = Properties>(
  coordinates: Position,
  properties?: P,
  options?: PositionsOptions,
): Feature<GeoJSON.Point, P>;
export function makeLineString<P = Properties>(
  coordinates: Position[],
  properties?: P,
  options?: PositionsOptions,
): Feature<LineString, P>;
export function makeLatLngBounds<G = Geometry, P = Properties>(
  northEastCoordinates: Position[],
  southWestCoordinates: Position[],
): FeatureCollection<G, P>;
export function makeFeature<G = Geometry, P = Properties>(
  geometry: G,
  properties?: P,
): Feature<G, P>;
export function makeFeatureCollection<G = Geometry, P = Properties>(
  features: Array<Feature<G, P>>,
  options?: PositionsOptions,
): FeatureCollection<G, P>;
export function addToFeatureCollection<G = Geometry, P = Properties>(
  newFeatureCollection: Array<FeatureCollection<G, P>>,
  newFeature: Feature<G, P>,
): FeatureCollection<G, P>;
export function calculateDistance(
  origin: Coord,
  dest: Coord,
  options?: UnitsOptions,
): number;
export function pointAlongLine(
  newLineString: Feature<LineString> | LineString,
  distAlong: number,
  options?: UnitsOptions,
): Feature<GeoJSON.Point>;
export function getOrCalculateVisibleRegion(
  coord: { lon: number; lat: number },
  zoomLevel: number,
  width: number,
  height: number,
  nativeRegion: {
    properties: { visibleBounds: number[] };
    visibleBounds: number[];
  },
): void;
