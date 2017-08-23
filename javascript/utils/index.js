import {
  NativeModules,
  findNodeHandle,
  Platform,
  requireNativeComponent,
} from 'react-native';

const LOG_TAG = '[ReactNativeMapboxNavigationUtils]';

export const IS_ANDROID = Platform.OS === 'android';

export function runNativeCommand(module, name, nativeRef, args = []) {
  // android native command
  const managerInstance = getManagerInstance(module)
  if (!managerInstance) {
    console.log(LOG_TAG, `Could not find ${module}`);
    return;
  }

  // get react tag so we can find, this component on the otherside
  const handle = findNodeHandle(nativeRef);

  // android native command
  if (IS_ANDROID) {
    NativeModules.UIManager.dispatchViewManagerCommand(
      handle,
      managerInstance.Commands[name],
      args,
    );
    return;
  }

  // ios native command
  const method = managerInstance[name]
  if (!method) {
    console.log(LOG_TAG, `Could not find method ${name} on module ${module}`);
    return;
  }

  method(handle, ...args);
}

function getManagerInstance(module) {
  const obj = IS_ANDROID ? NativeModules.UIManager : NativeModules;
  return obj[module];
}
