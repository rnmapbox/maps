import { ReactNode, SyntheticEvent } from 'react';
import {
  ViewProps,
  ViewStyle,
  StyleProp,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
import { NativeModules, PermissionsAndroid } from 'react-native';
import { Units, BBox, Id } from '@turf/helpers';

import MapView from './javascript/components/MapView';
import Light from './javascript/components/Light';
import PointAnnotation from './javascript/components/PointAnnotation';
import Annotation from './javascript/components/annotations/Annotation';
import Callout from './javascript/components/Callout';
import UserLocation from './javascript/components/UserLocation';
import Camera, {
  CameraProps,
  CameraRef,
  UserTrackingMode,
  AnimationMode,
} from './javascript/components/Camera';
import VectorSource from './javascript/components/VectorSource';
import ShapeSource from './javascript/components/ShapeSource';
import RasterSource from './javascript/components/RasterSource';
import RasterDemSource from './javascript/components/RasterDemSource';
import ImageSource from './javascript/components/ImageSource';
import Images from './javascript/components/Images';
import FillLayer from './javascript/components/FillLayer';
import FillExtrusionLayer from './javascript/components/FillExtrusionLayer';
import HeatmapLayer from './javascript/components/HeatmapLayer';
import LineLayer from './javascript/components/LineLayer';
import CircleLayer from './javascript/components/CircleLayer';
import SkyLayer from './javascript/components/SkyLayer';
import SymbolLayer from './javascript/components/SymbolLayer';
import RasterLayer from './javascript/components/RasterLayer';
import BackgroundLayer from './javascript/components/BackgroundLayer';
import Terrain from './javascript/components/Terrain';
import locationManager from './javascript/modules/location/locationManager';
import offlineManager from './javascript/modules/offline/offlineManager';
import snapshotManager from './javascript/modules/snapshot/snapshotManager';
import MarkerView from './javascript/components/MarkerView';
import Animated from './javascript/utils/animated/Animated';
import AnimatedPoint from './javascript/utils/animated/AnimatedPoint';
import AnimatedShape from './javascript/utils/animated/AnimatedShape';
import AnimatedCoordinatesArray from './javascript/utils/animated/AnimatedCoordinatesArray';
import AnimatedExtractCoordinateFromArray from './javascript/utils/animated/AnimatedExtractCoordinateFromArray';
import AnimatedRouteCoordinatesArray from './javascript/utils/animated/AnimatedRouteCoordinatesArray';
import Style from './javascript/components/Style';
import Logger from './javascript/utils/Logger';
import { isAndroid } from './javascript/utils';
import { MapboxGLDefinitions } from './definitions';

// Types

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

type OrnamentPosition =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };

/**
 * <v10.
 */
interface RegionPayload {
  zoomLevel: number;
  heading: number;
  animated: boolean;
  isUserInteraction: boolean;
  visibleBounds: GeoJSON.Position[];
  pitch: number;
}

/**
 * v10 only.
 */
interface MapState {
  properties: {
    center: GeoJSON.Position;
    bounds: {
      ne: GeoJSON.Position;
      sw: GeoJSON.Position;
    };
    zoom: number;
    heading: number;
    pitch: number;
  };
  gestures: {
    isGestureActive: boolean;
    isAnimatingFromGesture: boolean;
  };
}

interface MapViewProps extends ViewProps {
  animated?: boolean;
  userTrackingMode?: UserTrackingMode;
  userLocationVerticalAlignment?: number;
  contentInset?: Array<number>;
  style?: StyleProp<ViewStyle>;
  styleURL?: string;
  styleJSON?: string;
  preferredFramesPerSecond?: number;
  localizeLabels?: boolean;
  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  pitchEnabled?: boolean;
  rotateEnabled?: boolean;
  attributionEnabled?: boolean;
  attributionPosition?: OrnamentPosition;
  logoEnabled?: boolean;
  logoPosition?: OrnamentPosition;
  compassEnabled?: boolean;
  compassPosition?: OrnamentPosition;
  compassViewPosition?: number;
  compassViewMargins?: Point;
  scaleBarEnabled?: boolean;
  scaleBarPosition?: OrnamentPosition;
  surfaceView?: boolean;
  regionWillChangeDebounceTime?: number;
  regionDidChangeDebounceTime?: number;
  tintColor?: string;

  onPress?: (feature: GeoJSON.Feature) => void;
  onLongPress?: (feature: GeoJSON.Feature) => void;
  onRegionWillChange?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;
  onRegionIsChanging?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;
  onRegionDidChange?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;
  onCameraChanged?: (state: MapState) => void;
  onMapIdle?: (state: MapState) => void;
  onUserLocationUpdate?: (feature: Location) => void;
  onWillStartLoadingMap?: () => void;
  onDidFinishLoadingMap?: () => void;
  onDidFailLoadingMap?: () => void;
  onWillStartRenderingFrame?: () => void;
  onDidFinishRenderingFrame?: () => void;
  onDidFinishRenderingFrameFully?: () => void;
  onWillStartRenderingMap?: () => void;
  onDidFinishRenderingMap?: () => void;
  onDidFinishRenderingMapFully?: () => void;
  onDidFinishLoadingStyle?: () => void;
  onUserTrackingModeChange?: () => void;
}

interface UserLocationProps {
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  animated?: boolean;
  children?: ReactNode;
  minDisplacement?: number;
  onPress?: () => void;
  onUpdate?: (location: Location) => void;
  renderMode?: 'normal' | 'native';
  showsUserHeadingIndicator?: boolean;
  visible?: boolean;
}

type WithExpression<T> = {
  [P in keyof T]: T[P] | Expression;
};

interface LightStyle {
  anchor?: Alignment | Expression;
  position?: GeoJSON.Position | Expression;
  positionTransition?: Transition | Expression;
  color?: string | Expression;
  colorTransition?: Transition | Expression;
  intensity?: number | Expression;
  intensityTransition?: Transition | Expression;
}

interface Transition {
  duration: number;
  delay: number;
}

interface BackgroundLayerStyle {
  visibility?: Visibility | Expression;
  backgroundColor?: string | Expression;
  backgroundColorTransition?: Transition | Expression;
  backgroundPattern?: string | Expression;
  backgroundPatternTransition?: Transition | Expression;
  backgroundOpacity?: number | Expression;
  backgroundOpacityTransition?: Transition | Expression;
}

interface CircleLayerStyle {
  visibility?: Visibility | Expression;
  circleRadius?: number | Expression;
  circleRadiusTransition?: Transition | Expression;
  circleColor?: string | Expression;
  circleColorTransition?: Transition | Expression;
  circleBlur?: number | Expression;
  circleBlurTransition?: Transition | Expression;
  circleOpacity?: number | Expression;
  circleOpacityTransition?: Transition | Expression;
  circleTranslate?: Array<number> | Expression;
  circleTranslateTransition?: Transition | Expression;
  circleTranslateAnchor?: Alignment | Expression;
  circlePitchScale?: Alignment | Expression;
  circlePitchAlignment?: Alignment | Expression;
  circleStrokeWidth?: number | Expression;
  circleStrokeWidthTransition?: Transition | Expression;
  circleStrokeColor?: string | Expression;
  circleStrokeColorTransition?: Transition | Expression;
  circleStrokeOpacity?: number | Expression;
  circleStrokeOpacityTransition?: Transition | Expression;
}

interface FillExtrusionLayerStyle {
  visibility?: Visibility | Expression;
  fillExtrusionOpacity?: number | Expression;
  fillExtrusionOpacityTransition?: Transition | Expression;
  fillExtrusionColor?: string | Expression;
  fillExtrusionColorTransition?: Transition | Expression;
  fillExtrusionTranslate?: Array<number> | Expression;
  fillExtrusionTranslateTransition?: Transition | Expression;
  fillExtrusionTranslateAnchor?: Alignment | Expression;
  fillExtrusionPattern?: string | Expression;
  fillExtrusionPatternTransition?: Transition | Expression;
  fillExtrusionHeight?: number | Expression;
  fillExtrusionHeightTransition?: Transition | Expression;
  fillExtrusionBase?: number | Expression;
  fillExtrusionBaseTransition?: Transition | Expression;
}

interface FillLayerStyle {
  visibility?: Visibility | Expression;
  fillAntialias?: boolean | Expression;
  fillOpacity?: number | Expression;
  fillExtrusionOpacityTransition?: Transition | Expression;
  fillColor?: string | Expression;
  fillColorTransition?: Transition | Expression;
  fillOutlineColor?: string | Expression;
  fillOutlineColorTransition?: Transition | Expression;
  fillTranslate?: Array<number> | Expression;
  fillTranslateTransition?: Transition | Expression;
  fillTranslateAnchor?: Alignment | Expression;
  fillPattern?: string | Expression;
  fillPatternTransition?: Transition | Expression;
}

interface LineLayerStyle {
  lineCap?: 'butt' | 'round' | 'square' | Expression;
  lineJoin?: 'bevel' | 'round' | 'miter' | Expression;
  lineMiterLimit?: number | Expression;
  lineRoundLimit?: number | Expression;
  visibility?: Visibility | Expression;
  lineOpacity?: number | Expression;
  lineOpacityTransition?: Transition | Expression;
  lineColor?: string | Expression;
  lineColorTransition?: Transition | Expression;
  lineTranslate?: Array<number> | Expression;
  lineTranslateTransition?: Transition | Expression;
  lineTranslateAnchor?: Alignment | Expression;
  lineWidth?: number | Expression;
  lineWidthTransition?: Transition | Expression;
  lineGapWidth?: number | Expression;
  lineGapWidthTransition?: Transition | Expression;
  lineOffset?: number | Expression;
  lineOffsetTransition?: Transition | Expression;
  lineBlur?: number | Expression;
  lineBlurTransition?: Transition | Expression;
  lineDasharray?: Array<number> | Expression;
  lineDasharrayTransition?: Transition | Expression;
  linePattern?: string | Expression;
  linePatternTransition?: Transition | Expression;
}

interface RasterLayerStyle {
  visibility?: Visibility | Expression;
  rasterOpacity?: number | Expression;
  rasterOpacityTransition?: Transition | Expression;
  rasterHueRotate?: Expression;
  rasterHueRotateTransition?: Transition | Expression;
  rasterBrightnessMin?: number | Expression;
  rasterBrightnessMinTransition?: Transition | Expression;
  rasterBrightnessMax?: number | Expression;
  rasterBrightnessMaxTransition?: Transition | Expression;
  rasterSaturation?: number | Expression;
  rasterSaturationTransition?: Transition | Expression;
  rasterContrast?: number | Expression;
  rasterContrastTransition?: Transition | Expression;
  rasterFadeDuration?: number | Expression;
}

type TextVariableAnchorValues =
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface SymbolLayerStyle {
  symbolPlacement?: 'point' | 'line' | Expression;
  symbolSpacing?: number | Expression;
  symbolAvoidEdges?: boolean | Expression;
  symbolSortKey?: number | Expression;
  symbolZOrder?: 'auto' | 'viewport-y' | 'source' | Expression;
  iconAllowOverlap?: boolean | Expression;
  iconIgnorePlacement?: boolean | Expression;
  iconOptional?: boolean | Expression;
  iconRotationAlignment?: AutoAlignment | Expression;
  iconSize?: number | Expression;
  iconTextFit?: 'none' | 'width' | 'height' | 'both' | Expression;
  iconTextFitPadding?: Array<number> | Expression;
  iconImage?: string | Expression;
  iconRotate?: number | Expression;
  iconPadding?: number | Expression;
  iconKeepUpright?: boolean | Expression;
  iconOffset?: Array<number> | Expression;
  iconAnchor?: Anchor | Expression;
  iconPitchAlignment?: AutoAlignment | Expression;
  textPitchAlignment?: AutoAlignment | Expression;
  textRotationAlignment?: AutoAlignment | Expression;
  textField?: string | Expression;
  textFont?: Array<string> | Expression;
  textSize?: number | Expression;
  textMaxWidth?: number | Expression;
  textLineHeight?: number | Expression;
  textLetterSpacing?: number | Expression;
  textJustify?: 'left' | 'center' | 'right' | Expression;
  textAnchor?: Anchor | Expression;
  textMaxAngle?: number | Expression;
  textRotate?: number | Expression;
  textPadding?: number | Expression;
  textKeepUpright?: boolean | Expression;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | Expression;
  textOffset?: Array<number> | Expression;
  textAllowOverlap?: boolean | Expression;
  textIgnorePlacement?: boolean | Expression;
  textOptional?: boolean | Expression;
  textVariableAnchor?: Array<TextVariableAnchorValues>;
  textRadialOffset?: number | Expression;
  visibility?: Visibility | Expression;
  iconOpacity?: number | Expression;
  iconOpacityTransition?: Transition | Expression;
  iconColor?: string | Expression;
  iconColorTransition?: Transition | Expression;
  iconHaloColor?: string | Expression;
  iconHaloColorTransition?: Transition | Expression;
  iconHaloWidth?: number | Expression;
  iconHaloWidthTransition?: Transition | Expression;
  iconHaloBlur?: number | Expression;
  iconHaloBlurTransition?: Transition | Expression;
  iconTranslate?: Array<number> | Expression;
  iconTranslateTransition?: Transition | Expression;
  iconTranslateAnchor?: Alignment | Expression;
  textOpacity?: number | Expression;
  textOpacityTransition?: Transition | Expression;
  textColor?: string | Expression;
  textColorTransition?: Transition | Expression;
  textHaloColor?: string | Expression;
  textHaloColorTransition?: Transition | Expression;
  textHaloWidth?: number | Expression;
  textHaloWidthTransition?: Transition | Expression;
  textHaloBlur?: number | Expression;
  textHaloBlurTransition?: Transition | Expression;
  textTranslate?: Array<number> | Expression;
  textTranslateTransition?: Transition | Expression;
  textTranslateAnchor?: Alignment | Expression;
}

interface HeatmapLayerStyle {
  visibility?: Visibility | Expression;
  heatmapRadius?: number | Expression;
  heatmapRadiusTransition?: Transition | Expression;
  heatmapWeight?: number | Expression;
  heatmapIntensity?: number | Expression;
  heatmapIntensityTransition?: Transition | Expression;
  heatmapColor?: string | Expression;
  heatmapOpacity?: number | Expression;
  heatmapOpacityTransition?: Transition | Expression;
}

interface Point {
  x: number;
  y: number;
}

interface LightProps extends Omit<ViewProps, 'style'> {
  style?: LightStyle;
}

interface PointAnnotationProps {
  id: string;
  title?: string;
  snippet?: string;
  selected?: boolean;
  draggable?: boolean;
  coordinate: GeoJSON.Position;
  anchor?: Point;
  onSelected?: () => void;
  onDeselected?: () => void;
  onDragStart?: () => void;
  onDrag?: () => void;
  onDragEnd?: () => void;
}

type MarkerViewProps = PointAnnotationProps;

interface StyleProps {
  json: any;
}

interface CalloutProps extends Omit<ViewProps, 'style'> {
  title?: string;
  style?: StyleProp<WithExpression<ViewStyle>>;
  containerStyle?: StyleProp<WithExpression<ViewStyle>>;
  contentStyle?: StyleProp<WithExpression<ViewStyle>>;
  tipStyle?: StyleProp<WithExpression<ViewStyle>>;
  textStyle?: StyleProp<WithExpression<TextStyle>>;
}

interface TileSourceProps extends ViewProps {
  id: string;
  url?: string;
  tileUrlTemplates?: Array<string>;
  minZoomLevel?: number;
  maxZoomLevel?: number;
}

interface VectorSourceProps extends TileSourceProps {
  onPress?: (event: OnPressEvent) => void;
  hitbox?: {
    width: number;
    height: number;
  };
}

interface ShapeSourceProps extends ViewProps {
  id: string;
  url?: string;
  shape?:
    | GeoJSON.GeometryCollection
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
    | GeoJSON.Geometry;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoomLevel?: number;
  clusterProperties?: object;
  maxZoomLevel?: number;
  buffer?: number;
  tolerance?: number;
  lineMetrics?: boolean;
  images?: { assets?: string[] } & { [key: string]: ImageSourcePropType };
  onPress?: (event: OnPressEvent) => void;
  hitbox?: {
    width: number;
    height: number;
  };
}

interface RasterSourceProps extends TileSourceProps {
  tileSize?: number;
}

interface LayerBaseProps<T = object> extends Omit<ViewProps, 'style'> {
  id: string;
  sourceID?: string;
  sourceLayerID?: string;
  aboveLayerID?: string;
  belowLayerID?: string;
  layerIndex?: number;
  filter?: Expression;
  minZoomLevel?: number;
  maxZoomLevel?: number;
}

interface BackgroundLayerProps extends LayerBaseProps {
  style?: StyleProp<BackgroundLayerStyle>;
}

interface CircleLayerProps extends LayerBaseProps {
  style?: StyleProp<CircleLayerStyle>;
}

interface FillExtrusionLayerProps extends Omit<LayerBaseProps, 'id'> {
  id: string;
  style?: StyleProp<FillExtrusionLayerStyle>;
}

interface FillLayerProps extends LayerBaseProps {
  style?: StyleProp<FillLayerStyle>;
}

interface LineLayerProps extends LayerBaseProps {
  style?: StyleProp<LineLayerStyle>;
}

interface RasterLayerProps extends LayerBaseProps {
  style?: StyleProp<RasterLayerStyle>;
}

interface SymbolLayerProps extends LayerBaseProps {
  style?: StyleProp<SymbolLayerStyle>;
}

interface HeatmapLayerProps extends LayerBaseProps {
  style?: StyleProp<HeatmapLayerStyle>;
}

interface ImagesProps extends ViewProps {
  images?: { assets?: string[] } & { [key: string]: ImageSourcePropType };
  nativeAssetImages?: string[];
  onImageMissing?: (imageKey: string) => void;
}

interface ImageSourceProps extends ViewProps {
  id: string;
  url?: number | string;
  coordinates: [
    GeoJSON.Position,
    GeoJSON.Position,
    GeoJSON.Position,
    GeoJSON.Position,
  ];
}

interface OfflineCreatePackOptions {
  name?: string;
  styleURL?: string;
  bounds?: [GeoJSON.Position, GeoJSON.Position];
  minZoom?: number;
  maxZoom?: number;
  metadata?: any;
}

interface SnapshotOptions {
  centerCoordinate?: GeoJSON.Position;
  width?: number;
  height?: number;
  zoomLevel?: number;
  pitch?: number;
  heading?: number;
  styleURL?: string;
  writeToDisk?: boolean;
}

type LogLevel = 'error' | 'warning' | 'info' | 'debug' | 'verbose';

interface LogObject {
  level: LogLevel;
  message: string;
  tag: string;
}

type LogCallback = (object: LogObject) => void;

interface Location {
  coords: Coordinates;
  timestamp?: number;
}

interface Coordinates {
  /**
   * The heading (measured in degrees) relative to true north.
   * Heading is used to describe the direction the device is pointing to (the value of the compass).
   * Note that on Android this is incorrectly reporting the course value as mentioned in issue https://github.com/rnmapbox/maps/issues/1213
   * and will be corrected in a future update.
   */
  heading?: number;

  /**
   * The direction in which the device is traveling, measured in degrees and relative to due north.
   * The course refers to the direction the device is actually moving (not the same as heading).
   */
  course?: number;

  /**
   * The instantaneous speed of the device, measured in meters per second.
   */
  speed?: number;

  /**
   * The latitude in degrees.
   */
  latitude: number;

  /**
   * The longitude in degrees.
   */
  longitude: number;

  /**
   * The radius of uncertainty for the location, measured in meters.
   */
  accuracy?: number;

  /**
   * The altitude, measured in meters.
   */
  altitude?: number;
}

type Padding = number | [number, number] | [number, number, number, number];

// prettier-ignore
type ExpressionName =
  // Types
  | 'array' | 'boolean' | 'collator' | 'format' | 'image' | 'literal' | 'number' | 'number-format' | 'object' | 'string'
  | 'to-boolean' | 'to-color' | 'to-number' | 'to-string' | 'typeof'
  // Feature data
  | 'accumulated' | 'feature-state' | 'geometry-type' | 'id' | 'line-progress' | 'properties'
  // Lookup
  | 'at' | 'get' | 'has' | 'in' | 'index-of' | 'length' | 'slice'
  // Decision
  | '!' | '!=' | '<' | '<=' | '==' | '>' | '>=' | 'all' | 'any' | 'case' | 'match' | 'coalesce' | 'within'
  // Ramps, scales, curves
  | 'interpolate' | 'interpolate-hcl' | 'interpolate-lab' | 'step'
  // Variable binding
  | 'let' | 'var'
  // String
  | 'concat' | 'downcase' | 'is-supported-script' | 'resolved-locale' | 'upcase'
  // Color
  | 'rgb' | 'rgba' | 'to-rgba'
  // Math
  | '-' | '*' | '/' | '%' | '^' | '+' | 'abs' | 'acos' | 'asin' | 'atan' | 'ceil' | 'cos' | 'distance' | 'e'
  | 'floor' | 'ln' | 'ln2' | 'log10' | 'log2' | 'max' | 'min' | 'pi' | 'round' | 'sin' | 'sqrt' | 'tan'
  // Zoom, Heatmap
  | 'zoom' | 'heatmap-density';

type ExpressionField =
  | string
  | number
  | boolean
  | Expression
  | ExpressionField[]
  | { [key: string]: ExpressionField };

type Expression = [ExpressionName, ...ExpressionField[]];

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

type NamedStyles<T> = {
  [P in keyof T]:
    | SymbolLayerStyle
    | RasterLayerStyle
    | LineLayerStyle
    | FillLayerStyle
    | FillExtrusionLayerStyle
    | CircleLayerStyle
    | BackgroundLayerStyle;
};

type MapboxGLEvent<
  T extends string,
  P = GeoJSON.Feature,
  V = Element,
> = SyntheticEvent<V, { type: T; payload: P }>;

type OnPressEvent = {
  features: Array<GeoJSON.Feature>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  point: {
    x: number;
    y: number;
  };
};

interface UnitsOptions {
  units?: Units;
}

interface PositionsOptions {
  bbox?: BBox;
  id?: Id;
}

type StyleURLKey =
  | 'Street'
  | 'Dark'
  | 'Light'
  | 'Outdoors'
  | 'Satellite'
  | 'SatelliteStreet'
  | 'TrafficDay'
  | 'TrafficNight';

// Enums

enum InterpolationMode {
  Exponential = 0,
  Categorical = 1,
  Interval = 2,
  Identity = 3,
}

const StyleURL: Record<StyleURLKey, string> = {
  Street: 'mapbox://styles/mapbox/streets-v11',
  Dark: 'mapbox://styles/mapbox/dark-v10',
  Light: 'mapbox://styles/mapbox/light-v10',
  Outdoors: 'mapbox://styles/mapbox/outdoors-v11',
  Satellite: 'mapbox://styles/mapbox/satellite-v9',
  SatelliteStreet: 'mapbox://styles/mapbox/satellite-streets-v11',
  TrafficDay: 'mapbox://styles/mapbox/navigation-preview-day-v4',
  TrafficNight: 'mapbox://styles/mapbox/navigation-preview-night-v4',
};

// Methods

const requestAndroidLocationPermissions = async function () {
  if (isAndroid()) {
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    if (!res) {
      return false;
    }

    const permissions = Object.keys(res);
    for (const permission of permissions) {
      // @ts-expect-error TODO: Use Android permissions type.
      if (res[permission] === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
    }

    return false;
  }

  throw new Error('You should only call this method on Android!');
};

// Export

export {
  // Components
  MapView,
  Light,
  PointAnnotation,
  Annotation,
  Callout,
  UserLocation,
  Camera,
  VectorSource,
  ShapeSource,
  RasterSource,
  RasterDemSource,
  ImageSource,
  Images,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  SymbolLayer,
  RasterLayer,
  BackgroundLayer,
  Terrain,
  locationManager,
  offlineManager,
  snapshotManager,
  MarkerView,
  Animated,
  AnimatedPoint,
  AnimatedShape,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  Style,
  Logger,
  // Enums
  InterpolationMode,
  StyleURL,
  // Methods
  requestAndroidLocationPermissions,
};

export type {
  // Types
  CameraProps,
  CameraRef,
  AnimationMode,
  OfflineProgressStatus,
  OfflineProgressError,
  OfflinePack,
  OfflinePackStatus,
  OrnamentPosition,
  RegionPayload,
  MapState,
  MapViewProps,
  UserLocationProps,
  WithExpression,
  LightStyle,
  Transition,
  BackgroundLayerStyle,
  CircleLayerStyle,
  FillExtrusionLayerStyle,
  FillLayerStyle,
  LineLayerStyle,
  RasterLayerStyle,
  TextVariableAnchorValues,
  SymbolLayerStyle,
  HeatmapLayerStyle,
  Point,
  LightProps,
  PointAnnotationProps,
  MarkerViewProps,
  StyleProps,
  CalloutProps,
  TileSourceProps,
  VectorSourceProps,
  ShapeSourceProps,
  RasterSourceProps,
  LayerBaseProps,
  BackgroundLayerProps,
  CircleLayerProps,
  FillExtrusionLayerProps,
  FillLayerProps,
  LineLayerProps,
  RasterLayerProps,
  SymbolLayerProps,
  HeatmapLayerProps,
  ImagesProps,
  ImageSourceProps,
  OfflineCreatePackOptions,
  SnapshotOptions,
  LogLevel,
  LogObject,
  LogCallback,
  Location,
  Coordinates,
  Padding,
  ExpressionName,
  ExpressionField,
  Expression,
  Anchor,
  Visibility,
  Alignment,
  AutoAlignment,
  NamedStyles,
  MapboxGLEvent,
  OnPressEvent,
  UnitsOptions,
  PositionsOptions,
  StyleURLKey,
};

interface MapboxGLType {
  // Components
  MapView: typeof MapboxGLDefinitions.MapView;
  Light: typeof MapboxGLDefinitions.Light;
  PointAnnotation: typeof MapboxGLDefinitions.PointAnnotation;
  Annotation: any; // typeof MapboxGLDefinitions.Annotation; // TODO: Define in .d.ts file.
  Callout: typeof MapboxGLDefinitions.Callout;
  UserLocation: typeof MapboxGLDefinitions.UserLocation;
  Camera: typeof Camera;
  VectorSource: typeof MapboxGLDefinitions.VectorSource;
  ShapeSource: typeof MapboxGLDefinitions.ShapeSource;
  RasterSource: typeof MapboxGLDefinitions.RasterSource;
  RasterDemSource: any; // typeof MapboxGLDefinitions.RasterDemSource; // TODO: Define in .d.ts file.
  ImageSource: typeof MapboxGLDefinitions.ImageSource;
  Images: typeof MapboxGLDefinitions.Images;
  FillLayer: typeof MapboxGLDefinitions.FillLayer;
  FillExtrusionLayer: typeof MapboxGLDefinitions.FillExtrusionLayer;
  HeatmapLayer: typeof MapboxGLDefinitions.HeatmapLayer;
  LineLayer: typeof MapboxGLDefinitions.LineLayer;
  CircleLayer: typeof MapboxGLDefinitions.CircleLayer;
  SkyLayer: any; // typeof MapboxGLDefinitions.SkyLayer; // TODO: Define in .d.ts file.
  SymbolLayer: typeof MapboxGLDefinitions.SymbolLayer;
  RasterLayer: typeof MapboxGLDefinitions.RasterLayer;
  BackgroundLayer: typeof MapboxGLDefinitions.BackgroundLayer;
  Terrain: any; // typeof MapboxGLDefinitions.Terrain; // TODO: Define in .d.ts file.
  locationManager: typeof MapboxGLDefinitions.locationManager;
  offlineManager: typeof MapboxGLDefinitions.offlineManager;
  snapshotManager: typeof MapboxGLDefinitions.snapshotManager;
  MarkerView: typeof MapboxGLDefinitions.MarkerView;
  Animated: typeof MapboxGLDefinitions.Animated;
  AnimatedPoint: typeof MapboxGLDefinitions.AnimatedPoint;
  AnimatedShape: any; // typeof MapboxGLDefinitions.AnimatedShape; // TODO: Define in .d.ts file.
  AnimatedCoordinatesArray: any; // typeof MapboxGLDefinitions.AnimatedCoordinatesArray; // TODO: Define in .d.ts file.
  AnimatedExtractCoordinateFromArray: any; // typeof MapboxGLDefinitions.AnimatedExtractCoordinateFromArray; // TODO: Define in .d.ts file.
  AnimatedRouteCoordinatesArray: any; // typeof MapboxGLDefinitions.AnimatedRouteCoordinatesArray; // TODO: Define in .d.ts file.
  Style: typeof MapboxGLDefinitions.Style;
  Logger: typeof MapboxGLDefinitions.Logger;
  // Enums
  InterpolationMode: typeof InterpolationMode;
  StyleURL: typeof StyleURL;
  // Methods
  requestAndroidLocationPermissions: typeof MapboxGLDefinitions.requestAndroidLocationPermissions;
}

const MapboxGL: MapboxGLType = {
  ...NativeModules.MGLModule,
  // Components
  MapView,
  Light,
  PointAnnotation,
  Annotation,
  Callout,
  UserLocation,
  Camera,
  VectorSource,
  ShapeSource,
  RasterSource,
  RasterDemSource,
  ImageSource,
  Images,
  FillLayer,
  FillExtrusionLayer,
  HeatmapLayer,
  LineLayer,
  CircleLayer,
  SkyLayer,
  SymbolLayer,
  RasterLayer,
  BackgroundLayer,
  Terrain,
  locationManager,
  offlineManager,
  snapshotManager,
  MarkerView,
  Animated,
  AnimatedPoint,
  AnimatedShape,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  Style,
  Logger,
  // Enums
  InterpolationMode,
  StyleURL,
  // Methods
  requestAndroidLocationPermissions,
};

export default MapboxGL;
