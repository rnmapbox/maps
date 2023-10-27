// codegen will generate folly::dynamic in place of this type, but it's not exported by RN
// since codegen doesn't really follow imports, this way we can trick it into generating the correct type
// while keeping typescript happy
export type UnsafeMixed<T> = T;

// Fabric doesn't support optional props, so we need to use UnsafeMixed
// https://github.com/rnmapbox/maps/pull/3082#discussion_r1339858750
export type OptionalProp<T> = UnsafeMixed<T>;

import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export type Point = {
  x: Int32;
  y: Int32;
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
