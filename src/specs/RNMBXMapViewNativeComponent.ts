import type { HostComponent, ViewProps } from 'react-native';
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

export default codegenNativeComponent<NativeProps>(
  'RNMBXMapView',
) as HostComponent<NativeProps>;
