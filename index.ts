import { NativeModules, PermissionsAndroid } from 'react-native';

import {
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
  SkyLayerProps,
  SkyLayerStyle,
  InterpolationMode,
  StyleURL,
  CameraAnimationMode,
} from './javascript/types';
import {
  MapView,
  Light,
  PointAnnotation,
  Annotation,
  Callout,
  UserLocation,
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
  MarkerView,
  Style,
} from './javascript/components';
import Camera, { CameraProps, CameraRef } from './javascript/components/Camera';
import locationManager, {
  LocationManager,
} from './javascript/modules/location/locationManager';
import offlineManager, {
  OfflineManager,
} from './javascript/modules/offline/offlineManager';
import snapshotManager, {
  SnapshotManager,
} from './javascript/modules/snapshot/snapshotManager';
import {
  Animated,
  AnimatedPoint,
  AnimatedShape,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
} from './javascript/utils/animated';
import Logger from './javascript/utils/Logger';
import { isAndroid } from './javascript/utils';
import geoUtils from './javascript/utils/geoUtils';

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

export type {
  /** Types */
  CameraProps,
  CameraRef,
  CameraAnimationMode,
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
  SkyLayerProps,
  SkyLayerStyle,
};

type NamedExportsType = {
  /** Components */
  MapView: typeof MapView;
  Light: typeof Light;
  PointAnnotation: typeof PointAnnotation;
  Annotation: typeof Annotation;
  Callout: typeof Callout;
  UserLocation: typeof UserLocation;
  Camera: typeof Camera;
  VectorSource: typeof VectorSource;
  ShapeSource: typeof ShapeSource;
  RasterSource: typeof RasterSource;
  RasterDemSource: typeof RasterDemSource;
  ImageSource: typeof ImageSource;
  Images: typeof Images;
  FillLayer: typeof FillLayer;
  FillExtrusionLayer: typeof FillExtrusionLayer;
  HeatmapLayer: typeof HeatmapLayer;
  LineLayer: typeof LineLayer;
  CircleLayer: typeof CircleLayer;
  SkyLayer: typeof SkyLayer;
  SymbolLayer: typeof SymbolLayer;
  RasterLayer: typeof RasterLayer;
  BackgroundLayer: typeof BackgroundLayer;
  Terrain: typeof Terrain;
  MarkerView: typeof MarkerView;
  Animated: typeof Animated;
  AnimatedPoint: typeof AnimatedPoint;
  AnimatedShape: typeof AnimatedShape;
  AnimatedCoordinatesArray: typeof AnimatedCoordinatesArray;
  AnimatedExtractCoordinateFromArray: typeof AnimatedExtractCoordinateFromArray;
  AnimatedRouteCoordinatesArray: typeof AnimatedRouteCoordinatesArray;
  Style: typeof Style;
  Logger: typeof Logger;
  locationManager: LocationManager;
  offlineManager: OfflineManager;
  snapshotManager: SnapshotManager;
  /** Enums */
  InterpolationMode: typeof InterpolationMode;
  StyleURL: typeof StyleURL;
  /** Methods */
  requestAndroidLocationPermissions: typeof requestAndroidLocationPermissions;
  /** Native */
  removeCustomHeader(headerName: string): void;
  addCustomHeader(headerName: string, headerValue: string): void;
  setAccessToken(accessToken: string | null): void;
  getAccessToken(): Promise<string>;
  setTelemetryEnabled(telemetryEnabled: boolean): void;
  setConnected(connected: boolean): void;
};

export {
  /** Components */
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
  MarkerView,
  Animated,
  AnimatedPoint,
  AnimatedShape,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  Style,
  Logger,
  locationManager,
  offlineManager,
  snapshotManager,
  /** Enums */
  InterpolationMode,
  StyleURL,
  /** Methods */
  requestAndroidLocationPermissions,
};

const MapboxGL: NamedExportsType = {
  /** Components */
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
  MarkerView,
  Animated,
  AnimatedPoint,
  AnimatedShape,
  AnimatedCoordinatesArray,
  AnimatedExtractCoordinateFromArray,
  AnimatedRouteCoordinatesArray,
  Style,
  Logger,
  locationManager,
  offlineManager,
  snapshotManager,
  /** Classes */
  geoUtils,
  /** Enums */
  InterpolationMode,
  StyleURL,
  /** Methods */
  requestAndroidLocationPermissions,
  /** Native */
  ...NativeModules.MGLModule,
};

export default MapboxGL;
