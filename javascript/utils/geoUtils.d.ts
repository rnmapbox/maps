export function makeLatLngBounds<G = Geometry, P = Properties>(
  northEastCoordinates: Position[],
  southWestCoordinates: Position[],
): FeatureCollection<G, P>;

export function makePoint<P = Properties>(
  coordinates: Position,
  properties?: P,
  options?: PositionsOptions,
): Feature<GeoJSON.Point, P>;
