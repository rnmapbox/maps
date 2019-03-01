import React from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent, StyleSheet} from 'react-native';

import {toJSONString, isFunction, viewPropTypes} from '../utils';
import {makePoint} from '../utils/geoUtils';

export const NATIVE_MODULE_NAME = 'RCTMGLPointAnnotation';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});

/**
 * PointAnnotation represents a one-dimensional shape located at a single geographical coordinate.
 */
class PointAnnotation extends React.PureComponent {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the annotation
     */
    id: PropTypes.string.isRequired,

    /**
     * The string containing the annotation’s title. Note this is required to be set if you want to see a callout appear on iOS.
     */
    title: PropTypes.string,

    /**
     * The string containing the annotation’s snippet(subtitle). Not displayed in the default callout.
     */
    snippet: PropTypes.string,

    /**
     * Manually selects/deselects annotation
     * @type {[type]}
     */
    selected: PropTypes.bool,

    /**
     * The center point (specified as a map coordinate) of the annotation.
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

    /**
     * This callback is fired once this annotation is selected. Returns a Feature as the first param.
     */
    onSelected: PropTypes.func,

    /**
     * This callback is fired once this annotation is deselected.
     */
    onDeselected: PropTypes.func,
  };

  static defaultProps = {
    anchor: {x: 0.5, y: 0.5},
  };

  constructor(props) {
    super(props);
    this._onSelected = this._onSelected.bind(this);
  }

  _onSelected(e) {
    if (isFunction(this.props.onSelected)) {
      this.props.onSelected(e.nativeEvent.payload);
    }
  }

  _getCoordinate() {
    if (!this.props.coordinate) {
      return;
    }
    return toJSONString(makePoint(this.props.coordinate));
  }

  render() {
    const props = {
      ...this.props,
      id: this.props.id,
      title: this.props.title,
      snippet: this.props.snippet,
      anchor: this.props.anchor,
      selected: this.props.selected,
      style: [this.props.style, styles.container],
      hasOnPress: typeof this.props.onPress === 'function',
      onMapboxPointAnnotationSelected: this._onSelected,
      onMapboxPointAnnotationDeselected: this.props.onDeselected,
      coordinate: this._getCoordinate(),
    };
    return (
      <RCTMGLPointAnnotation {...props}>
        {this.props.children}
      </RCTMGLPointAnnotation>
    );
  }
}

const RCTMGLPointAnnotation = requireNativeComponent(
  NATIVE_MODULE_NAME,
  PointAnnotation,
  {
    nativeOnly: {
      onMapboxPointAnnotationSelected: true,
      onMapboxPointAnnotationDeselected: true,
    },
  },
);

export default PointAnnotation;
