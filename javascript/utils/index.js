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
  const handle = findNodeHandle(nativeRef);
  if (!handle) {
    throw new Error(`Could not find handle for native ref ${module}.${name}`);
  }

  const managerInstance = IS_ANDROID ? NativeModules.UIManager[module] : NativeModules[getIOSModuleName(module)];
  if (!managerInstance) {
    throw new Error(`Could not find ${module}`);
  }

  if (IS_ANDROID) {
    return NativeModules.UIManager.dispatchViewManagerCommand(
      handle,
      managerInstance.Commands[name],
      args,
    );
  }

  return managerInstance[name](handle, ...args);
}

export function cloneReactChildrenWithProps (children, propsToAdd = {}) {
  if (!children) {
    return null;
  }
  const filteredChildren = children.filter((child) => !!child); // filter out falsy children, since some can be null
  return React.Children.map(filteredChildren, (child) => React.cloneElement(child, propsToAdd));
}

export function getIOSModuleName (moduleName) {
  if (moduleName.startsWith('RCT')) {
    return moduleName.substring(3);
  }
  return moduleName;
}

export function toJSONString (json = '') {
  return JSON.stringify(json);
}

export function getFilter (filter) {
  if (!filter) {
    return '';
  }

  let flattenedFilter = [];
  for (let i = 0; i < filter.length; i++) {
    const item = filter[i];

    if (Array.isArray(item)) {
      flattenedFilter = flattenedFilter.concat(item);
    } else {
      flattenedFilter.push(item);
    }
  }

  return flattenedFilter.join(';');
}
