export function makePoint(coordinates: any, properties: any, options: any): import("@turf/helpers").Feature<import("@turf/helpers").Point, any>;
export function makeLineString(coordinates: any, properties: any, options: any): import("@turf/helpers").Feature<import("@turf/helpers").LineString, any>;
export function makeLatLngBounds(northEastCoordinates: any, southWestCoordinates: any): import("@turf/helpers").FeatureCollection<import("@turf/helpers").Point, import("@turf/helpers").Properties>;
export function makeFeature(geometry: any, properties: any): import("@turf/helpers").Feature<any, any>;
export function makeFeatureCollection(features: any[] | undefined, options: any): import("@turf/helpers").FeatureCollection<import("@turf/helpers").Geometry, import("@turf/helpers").Properties>;
export function addToFeatureCollection(newFeatureCollection: any, newFeature: any): any;
export function calculateDistance(origin: any, dest: any, options: any): number;
export function pointAlongLine(newLineString: any, distAlong: any, options: any): import("@turf/helpers").Feature<import("@turf/helpers").Point, import("@turf/helpers").Properties>;
export function getOrCalculateVisibleRegion(coord: any, zoomLevel: any, width: any, height: any, nativeRegion: any): {
    ne: number[];
    sw: number[];
};
//# sourceMappingURL=geoUtils.d.ts.map