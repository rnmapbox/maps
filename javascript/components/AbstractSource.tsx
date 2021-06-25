import React from 'react';

class AbstractSource extends React.PureComponent {
  setNativeProps(props) {
    const that: any = this;

    if (that._nativeRef) {
      that._nativeRef.setNativeProps(props);
    } else {
      if (that.refs.nativeSource) {
        that.refs.nativeSource.setNativeProps(props);
      }
    }
  }
}

export default AbstractSource;
