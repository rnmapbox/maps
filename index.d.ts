declare module 'react-native-mapbox-gl__maps';

import {
  Component,
  ReactNode,
  SyntheticEvent,
} from 'react';

import {
  ViewProps,
  ViewStyle,
  StyleProp,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';
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

// prettier-ignore
type ExpressionName =
  // Types
  | 'array' | 'boolean' | 'collator' | 'format' | 'literal' | 'number' | 'object' | 'string'
  | 'to-boolean' | 'to-color' | 'to-number' | 'to-string' | 'typeof'
  // Feature data
  | 'feature-state' | 'geometry-type' | 'id' | 'line-progress' | 'properties'
  // Lookup
  | 'at' | 'get' | 'has' | 'length'
  // Decision
  | '!' | '!=' | '<' | '<=' | '==' | '>' | '>=' | 'all' | 'any' | 'case' | 'match' | 'coalesce'
  // Ramps, scales, curves
  | 'interpolate' | 'interpolate-hcl' | 'interpolate-lab' | 'step'
  // Variable binding
  | 'let' | 'var'
  // String
  | 'concat' | 'downcase' | 'is-supported-script' | 'resolved-locale' | 'upcase'
  // Color
  | 'rgb' | 'rgba'
  // Math
  | '-' | '*' | '/' | '%' | '^' | '+' | 'abs' | 'acos' | 'asin' | 'atan' | 'ceil' | 'cos' | 'e'
  | 'floor' | 'ln' | 'ln2' | 'log10' | 'log2' | 'max' | 'min' | 'pi' | 'round' | 'sin' | 'sqrt' | 'tan'
  // Zoom, Heatmap
  | 'zoom' | 'heatmap-density';

type ExpressionField =
  | string
  | number
  | boolean
  | Expression
  | ExpressionField[]
  | {[key: string]: ExpressionField};

export type Expression = [ExpressionName, ...ExpressionField[]];

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

export type MapboxGLEvent<
  T extends string,
  P = GeoJSON.Feature,
  V = Element
  > = SyntheticEvent<V, { type: T; payload: P }>;

export type OnPressEvent = {
  features: Array<GeoJSON.Feature>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  point: {
    x: number;
    y: number;
  }
};

declare namespace MapboxGL {
  function removeCustomHeader(headerName: string): void;
  function addCustomHeader(headerName: string, headerValue: string): void;
  function setAccessToken(accessToken: string | null): void;
  function getAccessToken(): Promise<string>;
  function setTelemetryEnabled(telemetryEnabled: boolean): void;
  function setConnected(connected: boolean): void;
  function requestAndroidLocationPermissions(): Promise<boolean>;

  const offlineManager: OfflineManager;
  const snapshotManager: SnapshotManager;
  const locationManager: LocationManager;

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
    function makePoint<P = Properties>(coordinates: Position, properties?: P, options?: PositionsOptions): Feature<GeoJSON.Point, P>;
    function makeLineString<P = Properties>(coordinates: Position[], properties?: P, options?: PositionsOptions): Feature<LineString, P>;
    function makeLatLngBounds<G = Geometry, P = Properties>(northEastCoordinates: Position[], southWestCoordinates: Position[]): FeatureCollection<G, P>;
    function makeFeature<G = Geometry, P = Properties>(geometry: G, properties?: P): Feature<G, P>;
    function makeFeatureCollection<G = Geometry, P = Properties>(features: Array<Feature<G, P>>, options?: PositionsOptions): FeatureCollection<G, P>;
    function addToFeatureCollection<G = Geometry, P = Properties>(newFeatureCollection: Array<FeatureCollection<G, P>>, newFeature: Feature<G, P>): FeatureCollection<G, P>;
    function calculateDistance(origin: Coord, dest: Coord, options?: UnitsOptions): number;
    function pointAlongLine(newLineString: Feature<LineString> | LineString, distAlong: number, options?: UnitsOptions): Feature<GeoJSON.Point>;
    function getOrCalculateVisibleRegion(coord: { lon: number; lat: number }, zoomLevel: number, width: number, height: number, nativeRegion: { properties: { visibleBounds: number[] }; visibleBounds: number[] }): void;
  }

  namespace Animated {
    // sources
    class ShapeSource extends Component<ShapeSourceProps> { }
    class ImageSource extends Component<ImageSourceProps> { }

    // layers
    class FillLayer extends Component<FillLayerProps> { }
    class FillExtrusionLayer extends Component<FillExtrusionLayerProps> { }
    class LineLayer extends Component<LineLayerProps> { }
    class CircleLayer extends Component<CircleLayerProps> { }
    class SymbolLayer extends Component<SymbolLayerProps> { }
    class RasterLayer extends Component<RasterLayerProps> { }
    class BackgroundLayer extends Component<BackgroundLayerProps> { }
  }

  /**
   * Classes
   */

   class AnimatedPoint {
    constructor(point?: GeoJSON.Point);
    longitude: ReactNative.Animated.Value<number>;
    latitude: ReactNative.Animated.Value<number>;
    setValue: (point: GeoJSON.Point) => void;
    setOffset: (point: GeoJSON.Point) => void;
    flattenOffset: () => void;
    stopAnimation: (cb?: () => GeoJSON.Point) => void;
    addListener: (cb?: () => GeoJSON.Point) => void;
    removeListener: (id: string) => void;
    spring: (config: Record<string, any>) => ReactNative.Animated.CompositeAnimation;
    timing: (config: Record<string, any>) => ReactNative.Animated.CompositeAnimation;
  }

  /**
   * Components
   */
  class MapView extends Component<MapViewProps> {
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
    setSourceVisibility(visible: Boolean, sourceId: string, sourceLayerId?: string): void;
  }

  type Padding = number | [number, number] | [number, number, number, number];
  class Camera extends Component<CameraProps> {
    fitBounds(
      northEastCoordinates: GeoJSON.Position,
      southWestCoordinates: GeoJSON.Position,
      padding?: Padding,
      duration?: number,
    ): void;
    flyTo(coordinates: GeoJSON.Position, duration?: number): void;
    moveTo(coordinates: GeoJSON.Position, duration?: number): void;
    zoomTo(zoomLevel: number, duration?: number): void;
    setCamera(config: CameraSettings): void;
  }

  class UserLocation extends Component<UserLocationProps> { }

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

  class Light extends Component<LightProps> { }

  class StyleSheet extends Component {
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

  class PointAnnotation extends Component<PointAnnotationProps> {
    refresh(): void;
  }
  class MarkerView extends Component<MarkerViewProps> { }
  class Callout extends Component<CalloutProps> { }
  interface Style extends React.FC<StyleProps> { }

  /**
   * Sources
   */
  class VectorSource extends Component<VectorSourceProps> { }
  class ShapeSource extends Component<ShapeSourceProps> {
    features(filter?: Expression): Promise<FeatureCollection<Geometry, Properties>>

    getClusterExpansionZoom(feature: Feature<Geometry, Properties> | number): Promise<number>
        /**
    * Returns all the leaves of a cluster with pagination support.
    * @param cluster feature cluster
    * @param limit the number of leaves to return
    * @param offset the amount of points to skip (for pagination)
    */
     getClusterLeaves: (feature: Feature<Geometry, Properties> | number, limit: number, offset: number ) => Promise<FeatureCollection<Geometry, Properties>>
             /**
    * Returns the children of a cluster (on the next zoom level).
    * @param cluster feature cluster
    */
      getClusterChildren: (feature: Feature<Geometry, Properties> | number) => Promise<FeatureCollection<Geometry, Properties>>
  }
  class RasterSource extends Component<RasterSourceProps> { }

  /**
   * Layers
   */
  class BackgroundLayer extends Component<BackgroundLayerProps> { }
  class CircleLayer extends Component<CircleLayerProps> { }
  class FillExtrusionLayer extends Component<FillExtrusionLayerProps> { }
  class FillLayer extends Component<FillLayerProps> { }
  class LineLayer extends Component<LineLayerProps> { }
  class RasterLayer extends Component<RasterLayerProps> { }
  class SymbolLayer extends Component<SymbolLayerProps> { }
  class HeatmapLayer extends Component<HeatmapLayerProps> { }
  class Images extends Component<ImagesProps> { }
  class ImageSource extends Component<ImageSourceProps> { }

  class LocationManager extends Component {
    start(displacement?: number): void;
    stop(): void;
  }

  /**
   * Offline
   */
  class OfflineManager extends Component {
    createPack(
      options: OfflineCreatePackOptions,
      progressListener?: (pack: OfflinePack, status: OfflineProgressStatus) => void,
      errorListener?: (pack: OfflinePack, err: OfflineProgressError) => void
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
      errorListener?: (pack: OfflinePack, err: object) => void
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
    name: string,
    bounds: [GeoJSON.Position, GeoJSON.Position];
    metadata: any;
    status: () => Promise<OfflinePackStatus>,
    resume: () => Promise<void>,
    pause: () => Promise<void>,
  }

  interface OfflinePackStatus {
    name: string,
    state: number,
    percentage: number,
    completedResourceCount: number,
    completedResourceSize: number,
    completedTileSize: number,
    completedTileCount: number,
    requiredResourceCount: number,
  }

  /**
   * Constants
   */
  enum UserTrackingModes {
    Follow = 'normal',
    FollowWithHeading = 'compass',
    FollowWithCourse = 'course',
  }

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

export type AttributionPosition =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };

export type LogoPosition =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };

export interface RegionPayload {
  zoomLevel: number;
  heading: number;
  animated: boolean;
  isUserInteraction: boolean;
  visibleBounds: GeoJSON.Position[];
  pitch: number;
}

export interface MapViewProps extends ViewProps {
  animated?: boolean;
  userTrackingMode?: MapboxGL.UserTrackingModes;
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
  attributionPosition?: AttributionPosition;
  logoEnabled?: boolean;
  logoPosition?: LogoPosition;
  compassEnabled?: boolean;
  compassViewPosition?: number;
  compassViewMargins?: Point;
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
  onUserLocationUpdate?: (feature: MapboxGL.Location) => void;
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

export interface CameraProps extends CameraSettings, ViewProps {
  allowUpdates?: boolean;
  animationDuration?: number;
  animationMode?: 'flyTo' | 'easeTo' | 'linearTo' | 'moveTo';
  defaultSettings?: CameraSettings;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  maxBounds?: { ne: [number, number]; sw: [number, number] };
  followUserLocation?: boolean;
  followUserMode?: 'normal' | 'compass' | 'course';
  followZoomLevel?: number;
  followPitch?: number;
  followHeading?: number;
  triggerKey?: any;
  alignment?: number[];
  onUserTrackingModeChange?: (
    event: MapboxGLEvent<
      'usertrackingmodechange',
      {
        followUserLocation: boolean;
        followUserMode: 'normal' | 'compass' | 'course' | null;
      }
    >,
  ) => void;
}

export interface CameraPadding {
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

export interface CameraSettings {
  centerCoordinate?: GeoJSON.Position;
  heading?: number;
  pitch?: number;
  padding?: CameraPadding;
  bounds?: CameraPadding & {
    ne: GeoJSON.Position;
    sw: GeoJSON.Position;
  };
  zoomLevel?: number;
  animationDuration?: number;
  animationMode?: 'flyTo' | 'easeTo' | 'linearTo' | 'moveTo';
  stops?: CameraSettings[];
}

export interface UserLocationProps {
  androidRenderMode?: 'normal' | 'compass' | 'gps'
  animated?: boolean;
  children?: ReactNode;
  minDisplacement?: number;
  onPress?: () => void;
  onUpdate?: (location: MapboxGL.Location) => void;
  renderMode?: 'normal' | 'native';
  showsUserHeadingIndicator?: boolean,
  visible?: boolean;
}

export type WithExpression<T> = {
  [P in keyof T]: T[P] | Expression;
};

export interface LightStyle {
  anchor?: Alignment | Expression;
  position?: GeoJSON.Position | Expression;
  positionTransition?: Transition | Expression;
  color?: string | Expression;
  colorTransition?: Transition | Expression;
  intensity?: number | Expression;
  intensityTransition?: Transition | Expression;
}

export interface Transition {
  duration: number;
  delay: number;
}

export interface BackgroundLayerStyle {
  visibility?: Visibility | Expression;
  backgroundColor?: string | Expression;
  backgroundColorTransition?: Transition | Expression;
  backgroundPattern?: string | Expression;
  backgroundPatternTransition?: Transition | Expression;
  backgroundOpacity?: number | Expression;
  backgroundOpacityTransition?: Transition | Expression;
}

export interface CircleLayerStyle {
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

export interface FillExtrusionLayerStyle {
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

export interface FillLayerStyle {
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

export interface LineLayerStyle {
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

export interface RasterLayerStyle {
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

export type TextVariableAnchorValues = "center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface SymbolLayerStyle {
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

export interface HeatmapLayerStyle {
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

export interface Point {
  x: number;
  y: number;
}

export interface LightProps extends Omit<ViewProps, 'style'> {
  style?: LightStyle;
}

export interface PointAnnotationProps {
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

export interface MarkerViewProps extends PointAnnotationProps {
}

export interface StyleProps {
  json: any
}

export interface CalloutProps extends Omit<ViewProps, 'style'> {
  title?: string;
  style?: StyleProp<WithExpression<ViewStyle>>;
  containerStyle?: StyleProp<WithExpression<ViewStyle>>;
  contentStyle?: StyleProp<WithExpression<ViewStyle>>;
  tipStyle?: StyleProp<WithExpression<ViewStyle>>;
  textStyle?: StyleProp<WithExpression<TextStyle>>;
}

export interface TileSourceProps extends ViewProps {
  id: string;
  url?: string;
  tileUrlTemplates?: Array<string>;
  minZoomLevel?: number;
  maxZoomLevel?: number;
}

export interface VectorSourceProps extends TileSourceProps {
  onPress?: (event: OnPressEvent) => void;
  hitbox?: {
    width: number;
    height: number;
  };
}

export interface ShapeSourceProps extends ViewProps {
  id: string;
  url?: string;
  shape?: GeoJSON.GeometryCollection | GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoomLevel?: number;
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

export interface RasterSourceProps extends TileSourceProps {
  tileSize?: number;
}

export interface LayerBaseProps<T = {}> extends Omit<ViewProps, 'style'> {
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

export interface BackgroundLayerProps extends LayerBaseProps {
  style?: StyleProp<BackgroundLayerStyle>;
}

export interface CircleLayerProps extends LayerBaseProps {
  style?: StyleProp<CircleLayerStyle>;
}

export interface FillExtrusionLayerProps extends Omit<LayerBaseProps, 'id'> {
  id: string;
  style?: StyleProp<FillExtrusionLayerStyle>;
}

export interface FillLayerProps extends LayerBaseProps {
  style?: StyleProp<FillLayerStyle>;
}

export interface LineLayerProps extends LayerBaseProps {
  style?: StyleProp<LineLayerStyle>;
}

export interface RasterLayerProps extends LayerBaseProps {
  style?: StyleProp<RasterLayerStyle>;
}

export interface SymbolLayerProps extends LayerBaseProps {
  style?: StyleProp<SymbolLayerStyle>;
}

export interface HeatmapLayerProps extends LayerBaseProps {
  style?: StyleProp<HeatmapLayerStyle>;
}

export interface ImagesProps extends ViewProps {
  images?: { assets?: string[] } & { [key: string]: ImageSourcePropType };
  nativeAssetImages?: string[]
  onImageMissing?: (imageKey: string) => void
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

// Logger class
type LogLevel = "error" | "warning" | "info" | "debug" | "verbose";

interface LogObject {
  level: LogLevel;
  message: string;
  tag: string;
}

type LogCallback = (object: LogObject) => void;

export class Logger {
  public static setLogCallback: (cb: LogCallback) => boolean;
  public static setLogLevel: (level: LogLevel) => void;
}

export default MapboxGL;
