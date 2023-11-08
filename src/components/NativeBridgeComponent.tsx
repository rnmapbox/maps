import React from 'react';
import { TurboModule } from 'react-native';

import { type NativeArg, runNativeMethod } from '../utils';

export type RNMBEvent<PayloadType = { [key: string]: string }> = {
  payload: PayloadType;
  type: string;
};

const NativeBridgeComponent = <
  Props extends object,
  BaseComponent extends new (...ags: any[]) => React.Component<Props>,
>(
  Base: BaseComponent,
  turboModule: TurboModule,
) =>
  class extends Base {
    _turboModule: TurboModule;
    _preRefMapMethodQueue: Array<{
      method: { name: string; args: NativeArg[] };
      resolver: (value: NativeArg) => void;
    }>;

    constructor(...args: any[]) {
      super(...args);

      this._turboModule = turboModule;
      this._preRefMapMethodQueue = [];
    }

    async _runPendingNativeMethods<RefType>(nativeRef: RefType) {
      if (nativeRef) {
        while (this._preRefMapMethodQueue.length > 0) {
          const item = this._preRefMapMethodQueue.pop();

          if (item && item.method && item.resolver) {
            const res = await this._runNativeMethod(
              item.method.name,
              nativeRef,
              item.method.args,
            );
            item.resolver(res);
          }
        }
      }
    }

    _runNativeMethod<RefType, ReturnType = NativeArg>(
      methodName: string,
      nativeRef: RefType | undefined,
      args: NativeArg[] = [],
    ): Promise<ReturnType> {
      if (!nativeRef) {
        return new Promise<ReturnType>((resolve) => {
          this._preRefMapMethodQueue.push({
            method: { name: methodName, args },
            resolver: resolve as (args: NativeArg) => void,
          });
        });
      }

      return runNativeMethod(this._turboModule, methodName, nativeRef, args);
    }
  };

export default NativeBridgeComponent;
