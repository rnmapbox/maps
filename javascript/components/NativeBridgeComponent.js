import {runNativeCommand, isAndroid} from '../utils';

let callbackIncrement = 0;

const NativeBridgeComponent = B =>
  class extends B {
    constructor(props, nativeModuleName) {
      super(props);

      this._nativeModuleName = nativeModuleName;
      this._onAndroidCallback = this._onAndroidCallback.bind(this);
      this._callbackMap = new Map();
      this._preRefMapMethodQueue = [];
    }

    _addAddAndroidCallback(id, resolve, reject) {
      this._callbackMap.set(id, {resolve, reject});
    }

    _removeAndroidCallback(id) {
      this._callbackMap.remove(id);
    }

    _onAndroidCallback(e) {
      const callbackID = e.nativeEvent.type;
      const callback = this._callbackMap.get(callbackID);

      if (!callback) {
        return;
      }

      this._callbackMap.delete(callbackID);
      let {payload} = e.nativeEvent;
      if (payload.error) {
        callback.reject.call(null, new Error(payload.error));
      } else {
        callback.resolve.call(null, payload);
      }
    }

    async _runPendingNativeCommands(nativeRef) {
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

    _runNativeCommand(methodName, nativeRef, args = []) {
      if (!nativeRef) {
        return new Promise(resolve => {
          this._preRefMapMethodQueue.push({
            method: {name: methodName, args},
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
