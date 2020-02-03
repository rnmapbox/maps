import React from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent } from 'react-native';

import {toJSONString, viewPropTypes} from '../utils';
import {makePoint} from '../utils/geoUtils';

export const NATIVE_MODULE_NAME = 'RCTMGLMarkerView';

/**
 * MarkerView allows you to place a react native marker to the map
 */
class MarkerView extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

    /**
     * The center point (specified as a map coordinate) of the marker.
     */
    coordinate: PropTypes.arrayOf(PropTypes.number).isRequired,
  };

  _getCoordinate() {
    if (!this.props.coordinate) {
      return;
    }
    return toJSONString(makePoint(this.props.coordinate));
  }

  render() {
    const props = {
      ...this.props,
      coordinate: this._getCoordinate(),
    };
    return (
      <RCTMGLMarkerView {...props}>{this.props.children}</RCTMGLMarkerView>
    );
  }
}

const RCTMGLMarkerView = requireNativeComponent(
  NATIVE_MODULE_NAME,
  MarkerView,
  {},
);

export default MarkerView;
