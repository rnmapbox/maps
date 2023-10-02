// codegen will generate folly::dynamic in place of this type, but it's not exported by RN
// since codegen doesn't really follow imports, this way we can trick it into generating the correct type
// while keeping typescript happy
export type UnsafeMixed<T> = T;
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export type Point = {
  x: Int32;
  y: Int32;
};

export type LocalizeLabels = {
  locale: string;
  layerIds?: string[];
};

export type NativeCameraStop = {
  centerCoordinate?: string;
  bounds?: string;
  heading?: Double;
  pitch?: Double;
  zoom?: Double;
  paddingLeft?: Double;
  paddingRight?: Double;
  paddingTop?: Double;
  paddingBottom?: Double;
  duration?: Double;
  mode?: string;
} | null;
