declare module 'rnmapbox__maps';

import { Component } from 'react';
import ReactNative from 'react-native';
import {
  Geometry,
  Properties,
  Position,
  Feature,
  LineString,
  Coord,
  FeatureCollection,
} from '@turf/helpers';
import {
  ShapeSourceProps,
  ImageSourceProps,
  FillLayerProps,
  FillExtrusionLayerProps,
  LineLayerProps,
  CircleLayerProps,
  RasterLayerProps,
  BackgroundLayerProps,
  MapViewProps,
  Expression,
  UserLocationProps,
  LightProps,
  PointAnnotationProps,
  MarkerViewProps,
  CalloutProps,
  StyleProps,
  VectorSourceProps,
  RasterSourceProps,
  HeatmapLayerProps,
  ImagesProps,
  OfflineCreatePackOptions,
  SnapshotOptions,
  PositionsOptions,
  InterpolationMode,
  LogCallback,
  LogLevel,
  NamedStyles,
  OfflineProgressError,
  OfflineProgressStatus,
  SymbolLayerProps,
  UnitsOptions,
} from '@rnmapbox/maps';

export namespace MapboxGLDefinitions {
  export function removeCustomHeader(headerName: string): void;
  export function addCustomHeader(
    headerName: string,
    headerValue: string,
  ): void;
  export function setAccessToken(accessToken: string | null): void;
  export function getAccessToken(): Promise<string>;
  export function setTelemetryEnabled(telemetryEnabled: boolean): void;
  export function setConnected(connected: boolean): void;
  export function requestAndroidLocationPermissions(): Promise<boolean>;

  export const offlineManager: OfflineManager;
  export const snapshotManager: SnapshotManager;
  export const locationManager: LocationManager;

  export class geoUtils {
    makePoint<P = Properties>(
      coordinates: Position,
      properties?: P,
      options?: PositionsOptions,
    ): Feature<GeoJSON.Point, P>;
    makeLineString<P = Properties>(
      coordinates: Position[],
      properties?: P,
      options?: PositionsOptions,
    ): Feature<LineString, P>;
    makeLatLngBounds<G = Geometry, P = Properties>(
      northEastCoordinates: Position[],
      southWestCoordinates: Position[],
    ): FeatureCollection<G, P>;
    makeFeature<G = Geometry, P = Properties>(
      geometry: G,
      properties?: P,
    ): Feature<G, P>;
    makeFeatureCollection<G = Geometry, P = Properties>(
      features: Array<Feature<G, P>>,
      options?: PositionsOptions,
    ): FeatureCollection<G, P>;
    addToFeatureCollection<G = Geometry, P = Properties>(
      newFeatureCollection: Array<FeatureCollection<G, P>>,
      newFeature: Feature<G, P>,
    ): FeatureCollection<G, P>;
    calculateDistance(
      origin: Coord,
      dest: Coord,
      options?: UnitsOptions,
    ): number;
    pointAlongLine(
      newLineString: Feature<LineString> | LineString,
      distAlong: number,
      options?: UnitsOptions,
    ): Feature<GeoJSON.Point>;
    getOrCalculateVisibleRegion(
      coord: { lon: number; lat: number },
      zoomLevel: number,
      width: number,
      height: number,
      nativeRegion: {
        properties: { visibleBounds: number[] };
        visibleBounds: number[];
      },
    ): void;
  }

  export namespace Animated {
    // sources
    class ShapeSource extends Component<ShapeSourceProps> {}
    class ImageSource extends Component<ImageSourceProps> {}

    // layers
    class FillLayer extends Component<FillLayerProps> {}
    class FillExtrusionLayer extends Component<FillExtrusionLayerProps> {}
    class LineLayer extends Component<LineLayerProps> {}
    class CircleLayer extends Component<CircleLayerProps> {}
    class SymbolLayer extends Component<SymbolLayerProps> {}
    class RasterLayer extends Component<RasterLayerProps> {}
    class BackgroundLayer extends Component<BackgroundLayerProps> {}
  }

  export class AnimatedPoint {
    constructor(point?: GeoJSON.Point);
    longitude: ReactNative.Animated.Value;
    latitude: ReactNative.Animated.Value;
    setValue: (point: GeoJSON.Point) => void;
    setOffset: (point: GeoJSON.Point) => void;
    flattenOffset: () => void;
    stopAnimation: (cb?: () => GeoJSON.Point) => void;
    addListener: (cb?: () => GeoJSON.Point) => void;
    removeListener: (id: string) => void;
    spring: (
      config: Record<string, any>,
    ) => ReactNative.Animated.CompositeAnimation;
    timing: (
      config: Record<string, any>,
    ) => ReactNative.Animated.CompositeAnimation;
  }

  export class MapView extends Component<MapViewProps> {
    longitude: number;
    getPointInView(coordinate: GeoJSON.Position): Promise<GeoJSON.Position>;
    getCoordinateFromView(point: GeoJSON.Position): Promise<GeoJSON.Position>;
    getVisibleBounds(): Promise<GeoJSON.Position[]>;
    queryRenderedFeaturesAtPoint(
      coordinate: GeoJSON.Position,
      filter?: Expression,
      layerIds?: Array<string>,
    ): Promise<GeoJSON.FeatureCollection | undefined>;
    queryRenderedFeaturesInRect(
      coordinate: GeoJSON.Position,
      filter?: Expression,
      layerIds?: Array<string>,
    ): Promise<GeoJSON.FeatureCollection | undefined>;
    takeSnap(writeToDisk?: boolean): Promise<string>;
    getZoom(): Promise<number>;
    getCenter(): Promise<GeoJSON.Position>;
    showAttribution(): void;
    setSourceVisibility(
      visible: boolean,
      sourceId: string,
      sourceLayerId?: string,
    ): void;
  }

  export class UserLocation extends Component<UserLocationProps> {}

  export class Light extends Component<LightProps> {}

  export class StyleSheet extends Component {
    static create<T extends NamedStyles<T> | NamedStyles<any>>(styles: T): T;
    camera(
      stops: { [key: number]: string },
      interpolationMode?: InterpolationMode,
    ): void;
    source(
      stops: { [key: number]: string },
      attributeName: string,
      interpolationMode?: InterpolationMode,
    ): void;
    composite(
      stops: { [key: number]: string },
      attributeName: string,
      interpolationMode?: InterpolationMode,
    ): void;

    identity(attributeName: string): number;
  }

  export class PointAnnotation extends Component<PointAnnotationProps> {
    refresh(): void;
  }
  export class MarkerView extends Component<MarkerViewProps> {}
  export class Callout extends Component<CalloutProps> {}
  export class Style extends Component<StyleProps> {}

  export class VectorSource extends Component<VectorSourceProps> {}
  export class ShapeSource extends Component<ShapeSourceProps> {
    features(
      filter?: Expression,
    ): Promise<FeatureCollection<Geometry, Properties>>;

    getClusterExpansionZoom(
      feature: Feature<Geometry, Properties> | number,
    ): Promise<number>;
    /**
     * Returns all the leaves of a cluster with pagination support.
     * @param cluster feature cluster
     * @param limit the number of leaves to return
     * @param offset the amount of points to skip (for pagination)
     */
    getClusterLeaves: (
      feature: Feature<Geometry, Properties> | number,
      limit: number,
      offset: number,
    ) => Promise<FeatureCollection<Geometry, Properties>>;
    /**
     * Returns the children of a cluster (on the next zoom level).
     * @param cluster feature cluster
     */
    getClusterChildren: (
      feature: Feature<Geometry, Properties> | number,
    ) => Promise<FeatureCollection<Geometry, Properties>>;
  }
  export class RasterSource extends Component<RasterSourceProps> {}

  /**
   * Layers
   */
  export class BackgroundLayer extends Component<BackgroundLayerProps> {}
  export class CircleLayer extends Component<CircleLayerProps> {}
  export class FillExtrusionLayer extends Component<FillExtrusionLayerProps> {}
  export class FillLayer extends Component<FillLayerProps> {}
  export class LineLayer extends Component<LineLayerProps> {}
  export class RasterLayer extends Component<RasterLayerProps> {}
  export class SymbolLayer extends Component<SymbolLayerProps> {}
  export class HeatmapLayer extends Component<HeatmapLayerProps> {}
  export class Images extends Component<ImagesProps> {}
  export class ImageSource extends Component<ImageSourceProps> {}

  export class LocationManager extends Component {
    start(displacement?: number): void;
    stop(): void;
  }

  /**
   * Offline
   */
  export class OfflineManager extends Component {
    createPack(
      options: OfflineCreatePackOptions,
      progressListener?: (
        pack: OfflinePack,
        status: OfflineProgressStatus,
      ) => void,
      errorListener?: (pack: OfflinePack, err: OfflineProgressError) => void,
    ): Promise<void>;
    deletePack(name: string): Promise<void>;
    invalidatePack(name: string): Promise<void>;
    getPacks(): Promise<Array<OfflinePack>>;
    getPack(name: string): Promise<OfflinePack | undefined>;
    invalidateAmbientCache(): Promise<void>;
    clearAmbientCache(): Promise<void>;
    setMaximumAmbientCacheSize(size: number): Promise<void>;
    resetDatabase(): Promise<void>;
    setTileCountLimit(limit: number): void;
    setProgressEventThrottle(throttleValue: number): void;
    subscribe(
      packName: string,
      progressListener: (pack: OfflinePack, status: object) => void,
      errorListener?: (pack: OfflinePack, err: object) => void,
    ): void;
    unsubscribe(packName: string): void;
  }
  export class OfflinePack extends Component {
    status(): void;
    resume(): void;
    pause(): void;
  }

  export class SnapshotManager {
    static takeSnap(options: SnapshotOptions): Promise<string>;
  }

  export class Logger {
    public static setLogCallback: (cb: LogCallback) => boolean;
    public static setLogLevel: (level: LogLevel) => void;
  }
}

// export as namespace MapboxGL;
