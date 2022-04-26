import React from 'react';
import {
  ViewPropTypes,
  View,
  NativeModules,
  findNodeHandle,
  Platform,
} from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import PropTypes from 'prop-types';

function getAndroidManagerInstance(module) {
  const haveViewManagerConfig =
    NativeModules.UIManager && NativeModules.UIManager.getViewManagerConfig;
  return haveViewManagerConfig
    ? NativeModules.UIManager.getViewManagerConfig(module)
    : NativeModules.UIManager[module];
}

function getIosManagerInstance(module) {
  return NativeModules[getIOSModuleName(module)];
}

export const viewPropTypes = ViewPropTypes || View.props;

export const ornamentPositionPropType = PropTypes.oneOfType([
  PropTypes.shape({ top: PropTypes.number, left: PropTypes.number }),
  PropTypes.shape({ top: PropTypes.number, right: PropTypes.number }),
  PropTypes.shape({ bottom: PropTypes.number, left: PropTypes.number }),
  PropTypes.shape({ bottom: PropTypes.number, right: PropTypes.number }),
]);

export function isAndroid() {
  return Platform.OS === 'android';
}

export function existenceChange(cur, next) {
  if (!cur && !next) {
    return false;
  }
  return (!cur && next) || (cur && !next);
}

export function isFunction(fn) {
  return typeof fn === 'function';
}

export function isNumber(num) {
  return typeof num === 'number' && !Number.isNaN(num);
}

export function isUndefined(obj) {
  return typeof obj === 'undefined';
}

export function isString(str) {
  return typeof str === 'string';
}

export function isBoolean(bool) {
  return typeof bool === 'boolean';
}

export function isPrimitive(value) {
  return isString(value) || isNumber(value) || isBoolean(value);
}

export function runNativeCommand(module, name, nativeRef, args = []) {
  const handle = findNodeHandle(nativeRef);
  if (!handle) {
    throw new Error(`Could not find handle for native ref ${module}.${name}`);
  }

  const managerInstance = isAndroid()
    ? getAndroidManagerInstance(module)
    : getIosManagerInstance(module);

  if (!managerInstance) {
    throw new Error(`Could not find ${module}`);
  }

  if (isAndroid()) {
    return NativeModules.UIManager.dispatchViewManagerCommand(
      handle,
      managerInstance.Commands[name],
      args,
    );
  }

  if (!managerInstance[name]) {
    throw new Error(`Could not find ${name} for ${module}`);
  }
  return managerInstance[name](handle, ...args);
}

export function cloneReactChildrenWithProps(children, propsToAdd = {}) {
  if (!children) {
    return null;
  }

  let foundChildren = null;

  if (!Array.isArray(children)) {
    foundChildren = [children];
  } else {
    foundChildren = children;
  }

  const filteredChildren = foundChildren.filter((child) => !!child); // filter out falsy children, since some can be null
  return React.Children.map(filteredChildren, (child) =>
    React.cloneElement(child, propsToAdd),
  );
}

export function resolveImagePath(imageRef) {
  const res = resolveAssetSource(imageRef);
  return res.uri;
}

export function getIOSModuleName(moduleName) {
  if (moduleName.startsWith('RCT')) {
    return moduleName.substring(3);
  }
  return moduleName;
}

export function toJSONString(json = '') {
  return JSON.stringify(json);
}
