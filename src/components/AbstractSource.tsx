import React from 'react';
import { type HostInstance } from 'react-native';

import type { BaseProps } from '../types/BaseProps';

class AbstractSource<
  PropsType,
  NativePropsType extends object,
> extends React.PureComponent<PropsType & BaseProps> {
  _nativeRef?: HostInstance;

  setNativeProps(props: NativePropsType) {
    if (this._nativeRef) {
      this._nativeRef.setNativeProps(props);
    }
  }

  setNativeRef: (instance: HostInstance) => void = (instance) => {
    this._nativeRef = instance;
  };
}

export default AbstractSource;
