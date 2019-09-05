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

    _addAddAndroidCallback(id, callback) {
      this._callbackMap.set(id, callback);
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
      callback.call(null, e.nativeEvent.payload);
    }

    async _runPendingNativeCommands(nativeRef) {
      if (nativeRef)
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
        return new Promise(resolve => {
          callbackIncrement += 1;
          const callbackID = `${methodName}_${callbackIncrement}`;
          this._addAddAndroidCallback(callbackID, resolve);
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
