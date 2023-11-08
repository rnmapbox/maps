import { RefObject, type Component, type MutableRefObject } from 'react';
import { type NativeMethods, type HostComponent } from 'react-native';

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RNMBXCamera = requireNativeComponent<NativeProps>('RNMBXCamera');
 * const ref = useRef<typeof RNMBXCamera)(null) as NativeRefType<NativeProps>;
 * ...
 * <RNMBXCamera ref={ref} ... />
 */
export type NativeRefType<P> = MutableRefObject<
  (Component<P> & Readonly<NativeMethods>) | null
>;

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RNMBXCamera = requireNativeComponent<NativeProps>('RNMBXCamera');
 * const ref = nativeRef(useRef<typeof RNMBXCamera)(null));
 * ...
 * <RNMBXCamera ref={ref} ... />
 */
export default function nativeRef<P>(
  c: RefObject<HostComponent<P> | null>,
): MutableRefObject<(Component<P> & Readonly<NativeMethods>) | null> {
  return c as NativeRefType<P>;
}
