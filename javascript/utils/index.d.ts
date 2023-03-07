import React from 'react';

export type NativeArg =
  | string
  | number
  | boolean
  | { [k: string]: NativeArg }
  | null
  | NativeArg[];

export function isAndroid(): boolean;
export function isBoolean(argument: unknown): argument is boolean;
export function isNumber(argument: unknown): argument is number;
export function isString(argument: unknown): argument is string;
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(argument: unknown): argument is Function;

export function toJSONString(_: unknown): string;
export function runNativeCommand<RefType, ReturnType = NativeArg>(
  module: string,
  name: string,
  nativeRef: RefType,
  args: NativeArg[],
): Promise<ReturnType>;

export function cloneReactChildrenWithProps(
  children: React.ReactElement | React.ReactElement[],
  propsToAdd: { [key: string]: string } = {},
): React.ReactElement | React.ReactElement[];

export type OrnamentPositonProp =
  | { top: number; left: number }
  | { top: number; right: number }
  | { bottom: number; left: number }
  | { bottom: number; right: number };
