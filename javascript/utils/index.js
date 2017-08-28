import {
  NativeModules,
  findNodeHandle,
  Platform,
} from 'react-native';

export const IS_ANDROID = Platform.OS === 'android';

export function isFunction (fn) {
  return typeof fn === 'function';
}

export function runNativeCommand (module, name, nativeRef, args = []) {
  const managerInstance = NativeModules.UIManager[module];
  if (!managerInstance) {
    throw new Error(`Could not find ${module}`);
  }

  const handle = findNodeHandle(nativeRef);
  if (!handle) {
    throw new Error(`Could not find handle for native ref ${module}.${name}`);
  }

  NativeModules.UIManager.dispatchViewManagerCommand(
    handle,
    managerInstance.Commands[name],
    args,
  );
}
