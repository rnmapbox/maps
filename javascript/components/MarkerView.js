import React from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent} from 'react-native';

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
     * See also #anchor.
     */
    coordinate: PropTypes.arrayOf(PropTypes.number).isRequired,

    /**
     * Specifies the anchor being set on a particular point of the annotation.
     * The anchor point is specified in the continuous space [0.0, 1.0] x [0.0, 1.0],
     * where (0, 0) is the top-left corner of the image, and (1, 1) is the bottom-right corner.
     * Note this is only for custom annotations not the default pin view.
     * Defaults to the center of the view.
     */
    anchor: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  };

  static defaultProps = {
    anchor: {x: 0.5, y: 0.5},
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
      anchor: this.props.anchor,
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
