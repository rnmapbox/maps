import type { HostComponent, ViewProps, CodegenTypes } from 'react-native';
import { codegenNativeComponent } from 'react-native';

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

  onMapboxPointAnnotationDeselected: CodegenTypes.DirectEventHandler<OnMapboxPointAnnotationDeselectedEventType>;
  onMapboxPointAnnotationDrag: CodegenTypes.DirectEventHandler<OnMapboxPointAnnotationDragEventType>;
  onMapboxPointAnnotationDragEnd: CodegenTypes.DirectEventHandler<OnMapboxPointAnnotationDragEndEventType>;
  onMapboxPointAnnotationDragStart: CodegenTypes.DirectEventHandler<OnMapboxPointAnnotationDragStartEventType>;
  onMapboxPointAnnotationSelected: CodegenTypes.DirectEventHandler<OnMapboxPointAnnotationSelectedEventType>;
}

export default codegenNativeComponent<NativeProps>(
  'RNMBXPointAnnotation',
) as HostComponent<NativeProps>;
