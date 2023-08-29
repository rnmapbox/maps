import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import {
  WithDefault,
  DirectEventHandler,
  Int32,
} from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnCameraChangedEventType = { type: string; payload: string };
type OnPressEventType = { type: string; payload: string };
type OnMapChangeEventType = { type: string; payload: string };

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
  attributionPosition?: UnsafeMixed;

  logoEnabled?: boolean;
  logoPosition?: UnsafeMixed;

  compassEnabled?: boolean;
  compassFadeWhenNorth?: boolean;
  compassPosition?: UnsafeMixed;
  compassViewPosition?: Int32;
  compassViewMargins?: Point;
  compassImage?: string;

  scaleBarEnabled?: boolean;
  scaleBarPosition?: UnsafeMixed;

  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;

  requestDisallowInterceptTouchEvent?: boolean;

  projection?: WithDefault<'mercator' | 'globe', 'mercator'>;
  localizeLabels?: LocalizeLabels;

  styleURL?: string;

  onPress?: DirectEventHandler<OnPressEventType>;
  onLongPress?: DirectEventHandler<OnPressEventType>;
  onMapChange?: DirectEventHandler<OnMapChangeEventType>;
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
