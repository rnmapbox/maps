declare module 'react-native-mapbox-gl__maps';

import { Component, FC, ReactNode } from 'react';
import { ViewProps, ViewStyle, StyleProp, TextStyle } from 'react-native';
import ReactNative from 'react-native';
import {
  Geometry,
  Properties,
  Position,
  Feature,
  LineString,
  Coord,
  Units,
  BBox,
  Id,
  FeatureCollection,
} from '@turf/helpers';

import type {
  SymbolLayerStyleProps,
  CircleLayerStyleProps,
  FillExtrusionLayerStyleProps,
  SkyLayerStyleProps,
  RasterLayerStyleProps,
  HeatmapLayerStyleProps,
  FillLayerStyleProps,
  LineLayerStyleProps,
  BackgroundLayerStyleProps,
} from './javascript/utils/MapboxStyles';
import { getAnnotationsLayerID as _getAnnotationsLayerID } from './javascript/utils/getAnnotationsLayerID';
import {
  Camera as _Camera,
  CameraStop as _CameraStop,
  CameraFollowConfig as _CameraFollowConfig,
  CameraMinMaxConfig as _CameraMinMaxConfig,
  CameraBounds as _CameraBounds,
  CameraPadding as _CameraPadding,
  CameraBoundsWithPadding as _CameraBoundsWithPadding,
  CameraStops as _CameraStops,
  CameraAnimationMode as _CameraAnimationMode,
  type UserTrackingMode as _UserTrackingMode,
  type UserTrackingModeChangeCallback as _UserTrackingModeChangeCallback,
} from './javascript/components/Camera';
import _Images from './javascript/components/Images';
import _Image from './javascript/components/Image';
import _MapView, { _MapState } from './javascript/components/MapView';
import { MarkerView as _MarkerView } from './javascript/components/MarkerView';
import { PointAnnotation as _PointAnnotation } from './javascript/components/PointAnnotation';
import { Atmosphere as _Atmosphere } from './javascript/components/Atmosphere';
import {
  SymbolLayer as _SymbolLayer,
  Props as _SymbolLayerProps,
} from './javascript/components/SymbolLayer';
import _LineLayer, {
  Props as _LineLayerProps,
} from './javascript/components/LineLayer';
import { Props as _BackgroundLayerProps } from './javascript/components/BackgroundLayer';
import { Props as _CircleLayerProps } from './javascript/components/CircleLayer';
import { Props as _FillLayerProps } from './javascript/components/FillLayer';
import { Props as _FillExtrusionLayerProps } from './javascript/components/FillExtrusionLayer';
import { Props as _RasterLayerProps } from './javascript/components/RasterLayer';
import { Props as _HeatmapLayerProps } from './javascript/components/HeatmapLayer';
import _SkyLayer, {
  Props as _SkyLayerProps,
} from './javascript/components/SkyLayer';
import {
  ShapeSource as _ShapeSource,
  Props as _ShapeSourceProps,
} from './javascript/components/ShapeSource';
import _VectorSource from './javascript/components/VectorSource';
import _Light from './javascript/components/Light';
import type {
  MapboxGLEvent as _MapboxGLEvent,
  AnimatedPoint as _AnimatedPoint,
  AnimatedShape as _AnimatedShape,
} from './javascript/types/index';
import type { requestAndroidLocationPermissions as _requestAndroidLocationPermissions } from './javascript/requestAndroidLocationPermissions';
import type {
  Location as _Location,
  LocationManager,
} from './javascript/modules/location/locationManager';
import type { OnPressEvent as _OnPressEvent } from './javascript/types/OnPressEvent';
import {
  type LogLevel,
  type LogObject,
  type LogCallback,
  Logger as _Logger,
} from './javascript/utils/Logger';

type Anchor =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
type Visibility = 'visible' | 'none';
type Alignment = 'map' | 'viewport';
type AutoAlignment = Alignment | 'auto';

export type OnPressEvent = _OnPressEvent;

declare namespace MapboxGL {
  function removeCustomHeader(headerName: string): void;
  function addCustomHeader(headerName: string, headerValue: string): void;
  function setAccessToken(accessToken: string | null): Promise<string | null>;
  function setWellKnownTileServer(tileServer: string): void;
  function getAccessToken(): Promise<string>;
  function setTelemetryEnabled(telemetryEnabled: boolean): void;
  function setConnected(connected: boolean): void;

  const requestAndroidLocationPermissions = _requestAndroidLocationPermissions;

  const getAnnotationsLayerID = _getAnnotationsLayerID;
  type getAnnotationsLayerID = _getAnnotationsLayerID;

  const Logger = _Logger;
  type Logger = _Logger;
  const Camera = _Camera;
  type Camera = _Camera;
  type CameraStop = _CameraStop;
  type CameraFollowConfig = _CameraFollowConfig;
  type CameraMinMaxConfig = _CameraMinMaxConfig;
  type CameraBounds = _CameraBounds;
  type CameraPadding = _CameraPadding;
  type CameraBoundsWithPadding = _CameraBoundsWithPadding;
  type CameraStops = _CameraStops;
  type CameraAnimationMode = _CameraAnimationMode;

  const Atmosphere = _Atmosphere;
  const MarkerView = _MarkerView;
  const PointAnnotation = _PointAnnotation;
  const SymbolLayer = _SymbolLayer;
  const LineLayer = _LineLayer;
  const ShapeSource = _ShapeSource;
  type ShapeSource = _ShapeSource;

  const MapView = _MapView;
  type MapView = _MapView;

  type MapboxGLEvent = _MapboxGLEvent;
  type UserTrackingMode = _UserTrackingMode;
  type UserTrackingModeChangeCallback = _UserTrackingModeChangeCallback;
  type Location = _Location;

  /** @deprecated This will be removed in a future release. Use `Location['coords']` instead. */
  type Coordinates = Location['coords'];

  const offlineManager: OfflineManager;
  const snapshotManager: SnapshotManager;
  const locationManager: LocationManager;

  /**
   * Classes
   */
  class AnimatedPoint {
    constructor(point?: _AnimatedPoint);
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
  class AnimatedShape {
    constructor(shape: _AnimatedShape);
  }

  class _TileServers {
    Mapbox: string;
    MapLibre?: string;
    MapTiler?: string;
  }
  const TileServers: _TileServers;

  class _OfflinePackDownloadState {
    Inactive: string | number;
    Active: string | number;
    Complete: string | number;
    Unknown?: string | number;
  }
  const OfflinePackDownloadState: _OfflinePackDownloadState;

  /**
   * GeoUtils
   */
  interface UnitsOptions {
    units?: Units;
  }

  interface PositionsOptions {
    bbox?: BBox;
    id?: Id;
  }

  namespace geoUtils {
    function makePoint<P = Properties>(
      coordinates: Position,
      properties?: P,
      options?: PositionsOptions,
    ): Feature<GeoJSON.Point, P>;
    function makeLineString<P = Properties>(
      coordinates: Position[],
      properties?: P,
      options?: PositionsOptions,
    ): Feature<LineString, P>;
    function makeLatLngBounds<G = Geometry, P = Properties>(
      northEastCoordinates: Position[],
      southWestCoordinates: Position[],
    ): FeatureCollection<G, P>;
    function makeFeature<G = Geometry, P = Properties>(
      geometry: G,
      properties?: P,
    ): Feature<G, P>;
    function makeFeatureCollection<G = Geometry, P = Properties>(
      features: Array<Feature<G, P>>,
      options?: PositionsOptions,
    ): FeatureCollection<G, P>;
    function addToFeatureCollection<G = Geometry, P = Properties>(
      newFeatureCollection: Array<FeatureCollection<G, P>>,
      newFeature: Feature<G, P>,
    ): FeatureCollection<G, P>;
    function calculateDistance(
      origin: Coord,
      dest: Coord,
      options?: UnitsOptions,
    ): number;
    function pointAlongLine(
      newLineString: Feature<LineString> | LineString,
      distAlong: number,
      options?: UnitsOptions,
    ): Feature<GeoJSON.Point>;
    function getOrCalculateVisibleRegion(
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

  namespace Animated {
    // sources
    class ShapeSource extends Component<_ShapeSourceProps> {}
    class ImageSource extends Component<ImageSourceProps> {}

    // layers
    class FillLayer extends Component<_FillLayerProps> {}
    class FillExtrusionLayer extends Component<_FillExtrusionLayerProps> {}
    class LineLayer extends Component<_LineLayerProps> {}
    class CircleLayer extends Component<_CircleLayerProps> {}
    class SymbolLayer extends Component<_SymbolLayerProps> {}
    class RasterLayer extends Component<_RasterLayerProps> {}
    class BackgroundLayer extends Component<_BackgroundLayerProps> {}
  }

  type Padding = number | [number, number] | [number, number, number, number];

  class UserLocation extends Component<UserLocationProps> {}

  const Light = _Light;

  class Callout extends Component<CalloutProps> {}
  type Style = FC<StyleProps>;

  /**
   * Sources
   */
  type VectorSource = typeof _VectorSource;
  const VectorSource = _VectorSource;
  class RasterSource extends Component<RasterSourceProps> {}
  class RasterDemSource extends Component<RasterSourceProps> {}

  /**
   * Layers
   */
  class BackgroundLayer extends Component<_BackgroundLayerProps> {}
  class CircleLayer extends Component<_CircleLayerProps> {}
  class FillExtrusionLayer extends Component<_FillExtrusionLayerProps> {}
  class FillLayer extends Component<_FillLayerProps> {}
  class LineLayer extends Component<_LineLayerProps> {}
  class RasterLayer extends Component<_RasterLayerProps> {}
  class HeatmapLayer extends Component<_HeatmapLayerProps> {}
  class ImageSource extends Component<ImageSourceProps> {}
  type SkyLayer = _SkyLayer;
  const SkyLayer = _SkyLayer;

  type Images = _Images;
  const Images = _Images;
  type Image = _Image;
  const Image = _Image;

  /**
   * Offline
   */
  class OfflineManager extends Component {
    clearAmbientCache(): Promise<void>;
    createPack(
      options: OfflineCreatePackOptions,
      progressListener?: (
        pack: OfflinePack,
        status: OfflineProgressStatus,
      ) => void,
      errorListener?: (pack: OfflinePack, err: OfflineProgressError) => void,
    ): Promise<void>;
    deletePack(name: string): Promise<void>;
    getPack(name: string): Promise<OfflinePack | undefined>;
    getPacks(): Promise<Array<OfflinePack>>;
    invalidateAmbientCache(): Promise<void>;
    invalidatePack(name: string): Promise<void>;
    migrateOfflineCache(): Promise<void>;
    resetDatabase(): Promise<void>;
    setMaximumAmbientCacheSize(size: number): Promise<void>;
    setProgressEventThrottle(throttleValue: number): void;
    setTileCountLimit(limit: number): void;
    subscribe(
      packName: string,
      progressListener: (pack: OfflinePack, status: object) => void,
      errorListener?: (pack: OfflinePack, err: object) => void,
    ): void;
    unsubscribe(packName: string): void;
  }

  class SnapshotManager {
    static takeSnap(options: SnapshotOptions): Promise<string>;
  }

  interface OfflineProgressStatus {
    name: string;
    state: number;
    percentage: number;
    completedResourceSize: number;
    completedTileCount: number;
    completedResourceCount: number;
    requiredResourceCount: number;
    completedTileSize: number;
  }

  interface OfflineProgressError {
    message: string;
    name: string;
  }

  interface OfflinePack {
    name: string;
    bounds: [GeoJSON.Position, GeoJSON.Position];
    metadata: any;
    status: () => Promise<OfflinePackStatus>;
    resume: () => Promise<void>;
    pause: () => Promise<void>;
  }

  interface OfflinePackStatus {
    name: string;
    state: number;
    percentage: number;
    completedResourceCount: number;
    completedResourceSize: number;
    completedTileSize: number;
    completedTileCount: number;
    requiredResourceCount: number;
  }

  /**
   * Constants
   */

  enum InterpolationMode {
    Exponential = 0,
    Categorical = 1,
    Interval = 2,
    Identity = 3,
  }

  enum StyleURL {
    Street = 'mapbox://styles/mapbox/streets-v11',
    Dark = 'mapbox://styles/mapbox/dark-v10',
    Light = 'mapbox://styles/mapbox/light-v10',
    Outdoors = 'mapbox://styles/mapbox/outdoors-v11',
    Satellite = 'mapbox://styles/mapbox/satellite-v9',
    SatelliteStreet = 'mapbox://styles/mapbox/satellite-streets-v11',
    TrafficDay = 'mapbox://styles/mapbox/navigation-preview-day-v4',
    TrafficNight = 'mapbox://styles/mapbox/navigation-preview-night-v4',
  }
}

export interface UserLocationProps {
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  animated?: boolean;
  children?: ReactNode;
  minDisplacement?: number;
  requestsAlwaysUse?: boolean;
  onPress?: () => void;
  onUpdate?: (location: Location) => void;
  renderMode?: 'normal' | 'native';
  showsUserHeadingIndicator?: boolean;
  visible?: boolean;
}

export interface Transition {
  duration: number;
  delay: number;
}

export type BackgroundLayerStyle = BackgroundLayerStyleProps;

export type CircleLayerStyle = CircleLayerStyleProps;

export type FillExtrusionLayerStyle = FillExtrusionLayerStyleProps;

export type FillLayerStyle = FillLayerStyleProps;

export type SkyLayerStyle = SkyLayerStyleProps;

export type LineLayerStyle = LineLayerStyleProps;

export type RasterLayerStyle = RasterLayerStyleProps;

export type TextVariableAnchorValues =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type SymbolLayerStyle = SymbolLayerStyleProps;
export type LineLayerStyle = LineLayerStyleProps;

export type HeatmapLayerStyle = HeatmapLayerStyleProps;

export interface Point {
  x: number;
  y: number;
}

export interface StyleProps {
  json: any;
}

export interface CalloutProps extends Omit<ViewProps, 'style'> {
  title?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  tipStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface TileSourceProps extends ViewProps {
  id: string;
  url?: string;
  tileUrlTemplates?: Array<string>;
  minZoomLevel?: number;
  maxZoomLevel?: number;
}

export interface RasterSourceProps extends TileSourceProps {
  tileSize?: number;
}

export interface ImageSourceProps extends ViewProps {
  id: string;
  url?: number | string;
  coordinates: [
    GeoJSON.Position,
    GeoJSON.Position,
    GeoJSON.Position,
    GeoJSON.Position,
  ];
}

export interface OfflineCreatePackOptions {
  name?: string;
  styleURL?: string;
  bounds?: [GeoJSON.Position, GeoJSON.Position];
  minZoom?: number;
  maxZoom?: number;
  metadata?: any;
}

export interface SnapshotOptions {
  centerCoordinate?: GeoJSON.Position;
  width?: number;
  height?: number;
  zoomLevel?: number;
  pitch?: number;
  heading?: number;
  styleURL?: string;
  writeToDisk?: boolean;
}

export interface SkyLayerProps extends LayerBaseProps {
  id: string;
  style?: StyleProp<SkyLayerStyle>;
}

export import Logger = MapboxGL.Logger;

export import MapView = MapboxGL.MapView;

export import Camera = MapboxGL.Camera;
export import CameraStop = MapboxGL.CameraStop;
export import CameraFollowConfig = MapboxGL.CameraFollowConfig;
export import CameraMinMaxConfig = MapboxGL.CameraMinMaxConfig;
export import CameraBounds = MapboxGL.CameraBounds;
export import CameraPadding = MapboxGL.CameraPadding;
export import CameraBoundsWithPadding = MapboxGL.CameraBoundsWithPadding;
export import CameraStops = MapboxGL.CameraStops;
export import CameraAnimationMode = MapboxGL.CameraAnimationMode;

export import Atmosphere = MapboxGL.Atmosphere;
export import Terrain = MapboxGL.Terrain;
export import RasterDemSource = MapboxGL.RasterDemSource;
export import ShapeSource = MapboxGL.ShapeSource;
export import FillLayer = MapboxGL.FillLayer;
export import FillExtrusionLayer = MapboxGL.FillExtrusionLayer;
export import HeatmapLayer = MapboxGL.HeatmapLayer;
export import LineLayer = MapboxGL.LineLayer;
export import CircleLayer = MapboxGL.CircleLayer;
export import SkyLayer = MapboxGL.SkyLayer;
export import SymbolLayer = MapboxGL.SymbolLayer;
export import RasterLayer = MapboxGL.RasterLayer;
export import BackgroundLayer = MapboxGL.BackgroundLayer;
export import MarkerView = MapboxGL.MarkerView;
export import PointAnnotation = MapboxGL.PointAnnotation;
export import Callout = MapboxGL.Callout;

export import Location = MapboxGL.Location;
/** @deprecated This will be removed in a future release. Use `Location['coords']` instead. */
export import Coordinates = MapboxGL.Coordinates;

export import MapboxGLEvent = MapboxGL.MapboxGLEvent;
export import UserTrackingMode = MapboxGL.UserTrackingMode;
export import UserTrackingModeChangeCallback = MapboxGL.UserTrackingModeChangeCallback;
export import AnimatedPoint = MapboxGL.AnimatedPoint;
/** @deprecated This will be removed in a future release. Use `AnimatedPoint` instead. */
export import AnimatedMapPoint = MapboxGL.AnimatedPoint;
export import AnimatedShape = MapboxGL.AnimatedShape;
export import Images = MapboxGL.Images;
export import Image = MapboxGL.Image;
export import Light = MapboxGL.Light;
export import VectorSource = MapboxGL.VectorSource;
export import MapView = MapboxGL.MapView;
export import SkyLayer = MapboxGL.SkyLayer;
export import MapState = _MapState;

export const { offlineManager } = MapboxGL;

export const { getAnnotationsLayerID } = MapboxGL;

export default MapboxGL;
