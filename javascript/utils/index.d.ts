import React from 'react';

export type NativeArg =
  | string
  | number
  | { [k: string]: NativeArg }
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
