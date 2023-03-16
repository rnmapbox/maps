import React from 'react';
import { NativeMethods } from 'react-native';

import type { BaseProps } from '../types/BaseProps';

class AbstractSource<
  PropsType,
  NativePropsType extends object,
> extends React.PureComponent<PropsType & BaseProps> {
  _nativeRef?: React.Component<NativePropsType> & Readonly<NativeMethods>;

  setNativeProps(props: NativePropsType) {
    if (this._nativeRef) {
      this._nativeRef.setNativeProps(props);
    }
  }

  setNativeRef: (
    instance: React.Component<NativePropsType> & Readonly<NativeMethods>,
  ) => void = (instance) => {
    this._nativeRef = instance;
  };
}

export default AbstractSource;
