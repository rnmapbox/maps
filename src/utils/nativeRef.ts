import { RefObject, type MutableRefObject } from 'react';
import { type HostInstance } from 'react-native';

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RNMBXCamera = requireNativeComponent<NativeProps>('RNMBXCamera');
 * const ref = useRef<typeof RNMBXCamera)(null) as NativeRefType<NativeProps>;
 * ...
 * <RNMBXCamera ref={ref} ... />
 */
export type NativeRefType<P> = MutableRefObject<
  (HostInstance & { readonly __nativeProps?: P }) | null
>;

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RNMBXCamera = requireNativeComponent<NativeProps>('RNMBXCamera');
 * const ref = nativeRef(useRef<typeof RNMBXCamera)(null));
 * ...
 * <RNMBXCamera ref={ref} ... />
 */
export default function nativeRef<P extends {}>(
  c: RefObject<unknown>,
): NativeRefType<P> {
  return c as NativeRefType<P>;
}
