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
  // android native command
  const managerInstance = NativeModules.UIManager[module];
  if (!managerInstance) {
    throw new Error(`Could not find ${module}`);
  }

  // get react tag so we can find, this component on the otherside
  const handle = findNodeHandle(nativeRef);
  NativeModules.UIManager.dispatchViewManagerCommand(
    handle,
    managerInstance.Commands[name],
    args,
  );
  return;
  // android native command
  if (IS_ANDROID) {
    return;
  }

  // ios native command
  const method = managerInstance[name];
  if (!method) {
    throw new Error(`Could not find method ${name} on module ${module}`);
  }

  method(handle, ...args);
}

function getManagerInstance (module) {
  const obj = IS_ANDROID ? NativeModules.UIManager : NativeModules;
  return obj[module];
}
