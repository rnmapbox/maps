import React from 'react';

import { runNativeCommand, isAndroid } from '../utils';

let callbackIncrement = 0;

export type RNMBEvent<PayloadType = { [key: string]: string }> = {
  payload: PayloadType;
  type: string;
};

const NativeBridgeComponent = <T,>(B: React.ComponentClass<T>) =>
  class extends B {
    _nativeModuleName: string;
    _onAndroidCallback: (e: any) => void;
    _callbackMap: Map<string, any>;
    _preRefMapMethodQueue: Array<{
      method: { name: string; args: Array<string> };
      resolver: (value: unknown) => void;
    }>;

    constructor(props: T, nativeModuleName: string) {
      super(props);

      this._nativeModuleName = nativeModuleName;
      this._onAndroidCallback = this._onAndroidCallbackO.bind(this);
      this._callbackMap = new Map();
      this._preRefMapMethodQueue = [];
    }

    _addAddAndroidCallback(
      id: string,
      resolve: (value: string) => void,
      reject: (error: Error) => void,
    ) {
      this._callbackMap.set(id, { resolve, reject });
    }

    _removeAndroidCallback(id: string) {
      this._callbackMap.delete(id);
    }

    _onAndroidCallbackO(e: React.SyntheticEvent<Element, RNMBEvent>) {
      const callbackID = e.nativeEvent.type;
      const callback = this._callbackMap.get(callbackID);

      if (!callback) {
        return;
      }

      this._callbackMap.delete(callbackID);
      const { payload } = e.nativeEvent;
      if (payload.error) {
        callback.reject.call(null, new Error(payload.error));
      } else {
        callback.resolve.call(null, payload);
      }
    }

    async _runPendingNativeCommands<RefType>(nativeRef: RefType) {
      if (nativeRef) {
        while (this._preRefMapMethodQueue.length > 0) {
          const item = this._preRefMapMethodQueue.pop();

          if (item && item.method && item.resolver) {
            const res = await this._runNativeCommand(
              item.method.name,
              nativeRef,
              item.method.args,
            );
            item.resolver(res);
          }
        }
      }
    }

    _runNativeCommand<RefType>(
      methodName: string,
      nativeRef: RefType,
      args: string[] = [],
    ) {
      if (!nativeRef) {
        return new Promise((resolve) => {
          this._preRefMapMethodQueue.push({
            method: { name: methodName, args },
            resolver: resolve,
          });
        });
      }

      if (isAndroid()) {
        return new Promise((resolve, reject) => {
          callbackIncrement += 1;
          const callbackID = `${methodName}_${callbackIncrement}`;
          this._addAddAndroidCallback(callbackID, resolve, reject);
          args.unshift(callbackID);
          runNativeCommand(this._nativeModuleName, methodName, nativeRef, args);
        });
      }
      return runNativeCommand(
        this._nativeModuleName,
        methodName,
        nativeRef,
        args,
      );
    }
  };

export default NativeBridgeComponent;
