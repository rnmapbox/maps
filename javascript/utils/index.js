import React from 'react';

import {
  NativeModules,
  findNodeHandle,
  Platform,
} from 'react-native';

export const IS_ANDROID = Platform.OS === 'android';

export function isFunction (fn) {
  return typeof fn === 'function';
}

export function isNumber (num) {
  return typeof num === 'number' && !Number.isNaN(num);
}

export function isUndefined (obj) {
  return typeof obj === 'undefined';
}

export function isString (str) {
  return typeof str === 'string';
}

export function isBoolean (bool) {
  return typeof bool === 'boolean';
}

export function isPrimitive (value) {
  return isString(value) || isNumber(value) || isBoolean(value);
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

export function cloneReactChildrenWithProps (children, propsToAdd = {}) {
  return React.Children.map(children, (child) => React.cloneElement(child, propsToAdd));
}

export function toJSONString (json = '') {
  return JSON.stringify(json);
}
