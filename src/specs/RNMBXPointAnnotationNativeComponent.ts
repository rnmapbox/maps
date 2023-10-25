import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';

import type { UnsafeMixed } from './codegenUtils';

type OnMapboxPointAnnotationDeselectedEventType = {
  type: string;
  payload: string;
};
type OnMapboxPointAnnotationDragEventType = { type: string; payload: string };
type OnMapboxPointAnnotationDragEndEventType = {
  type: string;
  payload: string;
};
type OnMapboxPointAnnotationDragStartEventType = {
  type: string;
  payload: string;
};
type OnMapboxPointAnnotationSelectedEventType = {
  type: string;
  payload: string;
};

export interface NativeProps extends ViewProps {
  coordinate: UnsafeMixed<string>;
  draggable: UnsafeMixed<boolean>;
  id: UnsafeMixed<string>;
  anchor: UnsafeMixed<any>;

  onMapboxPointAnnotationDeselected: DirectEventHandler<OnMapboxPointAnnotationDeselectedEventType>;
  onMapboxPointAnnotationDrag: DirectEventHandler<OnMapboxPointAnnotationDragEventType>;
  onMapboxPointAnnotationDragEnd: DirectEventHandler<OnMapboxPointAnnotationDragEndEventType>;
  onMapboxPointAnnotationDragStart: DirectEventHandler<OnMapboxPointAnnotationDragStartEventType>;
  onMapboxPointAnnotationSelected: DirectEventHandler<OnMapboxPointAnnotationSelectedEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXPointAnnotation',
) as HostComponent<NativeProps>;
