import React from 'react';
import { TurboModule } from 'react-native';

import { type NativeArg, runNativeMethod } from '../utils';

export type RNMBEvent<PayloadType = { [key: string]: string }> = {
  payload: PayloadType;
  type: string;
};

const NativeBridgeComponent = <
  Props extends object,
  RefType,
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
    _nativeRef: RefType | null;

    constructor(...args: any[]) {
      super(...args);

      this._turboModule = turboModule;
      this._preRefMapMethodQueue = [];
      this._nativeRef = null;
    }

    async _runPendingNativeMethods() {
      while (this._nativeRef != null && this._preRefMapMethodQueue.length > 0) {
        const item = this._preRefMapMethodQueue.pop();

        if (item && item.method && item.resolver) {
          const res = await this._runNativeMethod(
            item.method.name,
            this._nativeRef,
            item.method.args,
          );
          item.resolver(res);
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

    _setNativeRef(nativeRef: RefType | null) {
      this._nativeRef = nativeRef
      this._runPendingNativeMethods();
    }

  };

export default NativeBridgeComponent;
