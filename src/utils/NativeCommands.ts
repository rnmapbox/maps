import { NodeHandle, findNodeHandle } from 'react-native';

export type NativeArg =
  | string
  | number
  | boolean
  | null
  | { [k: string]: NativeArg }
  | NativeArg[]
  // eslint-disable-next-line @typescript-eslint/ban-types
  | Function
  | GeoJSON.Geometry
  | undefined;

type FunctionKeys<T> = keyof {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

type RefType = React.Component;

export class NativeCommands<Spec extends object> {
  module: Spec;

  preRefMethodQueue: Array<{
    method: { name: FunctionKeys<Spec>; args: NativeArg[] };
    resolver: (value: unknown) => void;
  }>;

  nativeRef: RefType | undefined;

  constructor(module: Spec) {
    this.module = module;
    this.preRefMethodQueue = [];
  }

  async setNativeRef(nativeRef: RefType) {
    if (nativeRef) {
      this.nativeRef = nativeRef;
      while (this.preRefMethodQueue.length > 0) {
        const item = this.preRefMethodQueue.pop();

        if (item && item.method && item.resolver) {
          const res = await this._call(
            item.method.name,
            nativeRef,
            item.method.args,
          );
          item.resolver(res);
        }
      }
    }
  }

  call<T>(name: FunctionKeys<Spec>, args: NativeArg[]): Promise<T> {
    if (this.nativeRef) {
      return this._call(name, this.nativeRef, args);
    } else {
      return new Promise((resolve) => {
        this.preRefMethodQueue.push({
          method: { name, args },
          resolver: resolve as (args: unknown) => void,
        });
      });
    }
  }

  _call<T>(
    name: FunctionKeys<Spec>,
    nativeRef: RefType,
    args: NativeArg[],
  ): Promise<T> {
    const handle = findNodeHandle(nativeRef);
    if (handle) {
      return (
        this.module[name] as (
          arg0: NodeHandle,
          ...args: NativeArg[]
        ) => Promise<T>
      )(handle, ...args);
    } else {
      throw new Error(
        `Could not find handle for native ref ${module} when trying to invoke ${String(
          name,
        )}`,
      );
    }
  }
}
