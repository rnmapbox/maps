/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  NativeModules,
  findNodeHandle,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';

function getAndroidManagerInstance(module: string) {
  const haveViewManagerConfig =
    NativeModules.UIManager && NativeModules.UIManager.getViewManagerConfig;
  return haveViewManagerConfig
    ? NativeModules.UIManager.getViewManagerConfig(module)
    : NativeModules.UIManager[module];
}

function getIosManagerInstance(module: string): any {
  return NativeModules[getIOSModuleName(module)];
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function existenceChange(cur: boolean, next: boolean): boolean {
  if (!cur && !next) {
    return false;
  }
  return (!cur && next) || (cur && !next);
}

export function isFunction(fn: unknown): fn is boolean {
  return typeof fn === 'function';
}

export function isNumber(num: unknown): num is number {
  return typeof num === 'number' && !Number.isNaN(num);
}

export function isUndefined(obj: unknown): obj is undefined {
  return typeof obj === 'undefined';
}

export function isString(str: unknown): str is string {
  return typeof str === 'string';
}

export function isBoolean(bool: unknown): bool is boolean {
  return typeof bool === 'boolean';
}

export function isPrimitive(
  value: unknown,
): value is string | number | boolean {
  return isString(value) || isNumber(value) || isBoolean(value);
}

export type NativeArg =
  | string
  | number
  | boolean
  | null
  | { [k: string]: NativeArg }
  | NativeArg[];

export function runNativeCommand<ReturnType = NativeArg>(
  module: string,
  name: string,
  nativeRef: any,
  args: NativeArg[],
): Promise<ReturnType> {
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
    const { Commands } = managerInstance;
    return NativeModules.UIManager.dispatchViewManagerCommand(
      handle,
      Commands._useCommandName ? name : Commands[name],
      args,
    );
  }

  if (!managerInstance[name]) {
    throw new Error(`Could not find ${name} for ${module}`);
  }
  return managerInstance[name](handle, ...args);
}

export function getCommandName(module: string, name: string): string {
  if (!isAndroid()) {
    return ''; // unused on iOS
  }

  const managerInstance = getAndroidManagerInstance(module);

  if (!managerInstance) {
    throw new Error(`Could not find ${module}`);
  }

  const { Commands } = managerInstance;

  return Commands._useCommandName ? name : Commands[name];
}

export function cloneReactChildrenWithProps(
  children: Parameters<typeof React.Children.map>[0],
  propsToAdd: { [key: string]: string } = {},
) {
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

export function resolveImagePath(imageRef: ImageSourcePropType): string {
  const res = Image.resolveAssetSource(imageRef);
  return res.uri;
}

export function getIOSModuleName(moduleName: string): string {
  if (moduleName.startsWith('RCT')) {
    return moduleName.substring(3);
  }
  return moduleName;
}

export function toJSONString(json: any = '') {
  return JSON.stringify(json);
}

export type OrnamentPositonProp =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };
