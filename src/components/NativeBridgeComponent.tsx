import React from 'react';
import { type TurboModule } from 'react-native';

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

    /**
     * Reports a native method that failed with no caller left to handle it.
     *
     * Rethrowing is not an option here: every caller of the methods below
     * discards the promise, so a rethrow would only recreate the unhandled
     * rejection this is meant to remove.
     */
    _warnNativeMethodFailed(methodName: string, error: unknown) {
      console.warn(
        `rnmapbox/maps: native method ${methodName} failed - this is expected if the view was detached while the call was in flight:`,
        error,
      );
    }

    async _runPendingNativeMethods<RefType>(nativeRef: RefType) {
      if (nativeRef) {
        while (this._preRefMapMethodQueue.length > 0) {
          const item = this._preRefMapMethodQueue.pop();

          if (item && item.method && item.resolver) {
            // Every caller invokes this fire-and-forget, so a rejection here
            // would escape as an unhandled rejection. Catching per item also
            // keeps one failure from abandoning the rest of the queue.
            try {
              const res = await this._runNativeMethod(
                item.method.name,
                nativeRef,
                item.method.args,
              );
              item.resolver(res);
            } catch (error) {
              this._warnNativeMethodFailed(item.method.name, error);
            }
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

    /**
     * Runs a native method whose result is intentionally discarded.
     *
     * Callers that drop the promise on the floor leak an unhandled rejection
     * whenever the native view goes away while the call is in flight - a tab
     * switch, or any unmount - because the bridge then rejects with
     * `Unknown reactTag: <n>`.
     */
    _runNativeMethodDetached<RefType>(
      methodName: string,
      nativeRef: RefType | undefined,
      args: NativeArg[] = [],
    ): void {
      const onError = (error: unknown) =>
        this._warnNativeMethodFailed(methodName, error);

      try {
        // `runNativeMethod` throws synchronously when the view handle is
        // already gone, so the try/catch is not redundant with `.catch`.
        this._runNativeMethod(methodName, nativeRef, args).catch(onError);
      } catch (error) {
        onError(error);
      }
    }
  };

export default NativeBridgeComponent;
