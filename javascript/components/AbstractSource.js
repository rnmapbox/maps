import React from 'react';

class AbstractSource extends React.PureComponent {
  setNativeProps(props) {
    if (this._nativeRef) {
      this._nativeRef.setNativeProps(props);
    } else {
      if (this.refs.nativeSource) {
        this.refs.nativeSource.setNativeProps(props);
      }
    }
  }
}

export default AbstractSource;
