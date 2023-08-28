import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  WithDefault,
  DirectEventHandler,
  BubblingEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

type OnCameraChangedEventType = { payload: string };
type OnPressEventType = { payload: string };
type OnMapChangeEventType = { payload: boolean };

// UnsafeObject is exported from CodegenTypes but parser expects UnsafeMixed?
type UnsafeObject = UnsafeMixed;

type Point = {
  x: Int32;
  y: Int32;
};

type LocalizeLabels = {
  locale: string;
  layerIds?: string[];
};

export interface NativeProps extends ViewProps {
  onCameraChanged?: DirectEventHandler<OnCameraChangedEventType>;

  attributionEnabled?: boolean;
  attributionPosition?: UnsafeObject;

  logoEnabled?: boolean;
  logoPosition?: UnsafeObject;

  compassEnabled?: boolean;
  compassFadeWhenNorth?: boolean;
  compassPosition?: UnsafeObject;
  compassViewPosition?: Int32;
  compassViewMargins?: Point;
  compassImage?: string;

  scaleBarEnabled?: boolean;
  scaleBarPosition?: UnsafeObject;

  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;

  requestDisallowInterceptTouchEvent?: boolean;

  projection?: WithDefault<'mercator' | 'globe', 'mercator'>;
  localizeLabels?: LocalizeLabels;

  styleURL?: string;

  onPress?: BubblingEventHandler<OnPressEventType>;
  onLongPress?: BubblingEventHandler<OnPressEventType>;
  onMapChange?: BubblingEventHandler<OnMapChangeEventType>;
}

// TODO: figure out how to please the 3 different parsers and native at once

// type MapViewViewType = HostComponent<NativeProps>;

// export interface NativeCommands {
//   takeSnap: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     writeToDisk: boolean,
//   ) => Promise<UnsafeObject>;
//   queryTerrainElevation: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     coordinates: ReadonlyArray<number>,
//   ) => Promise<UnsafeObject>;
//   setSourceVisibility: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     visible: boolean,
//     sourceId: string,
//     sourceLayerId: string,
//   ) => Promise<UnsafeObject>;
//   getCenter: (
//     viewRef: React.ElementRef<MapViewViewType>,
//   ) => Promise<UnsafeObject>;
//   getCoordinateFromView: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     atPoint: ReadonlyArray<number>,
//   ) => Promise<UnsafeObject>;
//   getPointInView: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     atCoordinate: ReadonlyArray<number>,
//   ) => Promise<UnsafeObject>;
//   getZoom: (
//     viewRef: React.ElementRef<MapViewViewType>,
//   ) => Promise<UnsafeObject>;
//   getVisibleBounds: (
//     viewRef: React.ElementRef<MapViewViewType>,
//   ) => Promise<UnsafeObject>;
//   queryRenderedFeaturesAtPoint: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     atPoint: ReadonlyArray<number>,
//     withFilter: ReadonlyArray<UnsafeObject>,
//     withLayerIDs: ReadonlyArray<string>,
//   ) => Promise<UnsafeObject>;
//   queryRenderedFeaturesInRect: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     withBBox: ReadonlyArray<number>,
//     withFilter: ReadonlyArray<UnsafeObject>,
//     withLayerIDs: ReadonlyArray<string>,
//   ) => Promise<UnsafeObject>;
//   setHandledMapChangedEvents: (
//     viewRef: React.ElementRef<MapViewViewType>,
//     events: ReadonlyArray<string>,
//   ) => void;
//   clearData: (viewRef: React.ElementRef<MapViewViewType>) => void;
// }

// export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
//   supportedCommands: [
//     'takeSnap',
//     'queryTerrainElevation',
//     'setSourceVisibility',
//     'getCenter',
//     'getCoordinateFromView',
//     'getPointInView',
//     'getZoom',
//     'getVisibleBounds',
//     'queryRenderedFeaturesAtPoint',
//     'queryRenderedFeaturesInRect',
//     'setHandledMapChangedEvents',
//     'clearData',
//   ],
// });

export default codegenNativeComponent<NativeProps>(
  'MBXMapView',
) as HostComponent<NativeProps>;
