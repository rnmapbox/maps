import React from 'react';

import {runNativeCommand, isAndroid} from '../utils';

class NativeBridgeComponent extends React.Component {
  constructor(props) {
    super(props);

    this._onAndroidCallback = this._onAndroidCallback.bind(this);
    this._callbackMap = new Map();
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

  _runNativeCommand(nativeModuleName, nativeRef, methodName, args = []) {
    if (isAndroid()) {
      return new Promise(resolve => {
        const callbackID = `${Date.now()}`;
        this._addAddAndroidCallback(callbackID, resolve);
        args.unshift(callbackID);
        runNativeCommand(nativeModuleName, methodName, this._nativeRef, args);
      });
    }

    return runNativeCommand(nativeModuleName, methodName, nativeRef, args);
  }
}

export default NativeBridgeComponent;
