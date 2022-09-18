export function isAndroid(): boolean;
export function isBoolean(_: unknown): argument is boolean;
export function isNumber(_: unknown): argument is number;
export function isString(_: unknown): argument is string;
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(argument: unknown): argument is Function;

export function toJSONString(_: unknown): string;
export function runNativeCommand<RefType>(
  module: string,
  name: string,
  nativeRef: RefType,
  args: string[],
): void;
