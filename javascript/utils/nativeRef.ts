import { RefObject, type Component, type MutableRefObject } from 'react';
import { type NativeMethods, type HostComponent } from 'react-native';

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RCTMGLCamera = requireNativeComponent<NativeProps>('RCTMGLCamera');
 * const ref = useRef<typeof RCTMGLCamera)(null) as NativeRefType<NativeProps>;
 * ...
 * <RCTMGLCamera ref={ref} ... />
 */
export type NativeRefType<P> = MutableRefObject<
  (Component<P> & Readonly<NativeMethods>) | null
>;

/**
 * Helper for useRef and requireNativeComponent:
 * @example
 * RCTMGLCamera = requireNativeComponent<NativeProps>('RCTMGLCamera');
 * const ref = nativeRef(useRef<typeof RCTMGLCamera)(null));
 * ...
 * <RCTMGLCamera ref={ref} ... />
 */
export default function nativeRef<P>(
  c: RefObject<HostComponent<P> | null>,
): MutableRefObject<(Component<P> & Readonly<NativeMethods>) | null> {
  return c as NativeRefType<P>;
}
