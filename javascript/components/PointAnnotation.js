import React from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent, StyleSheet, Platform} from 'react-native';

import {toJSONString, isFunction, viewPropTypes} from '../utils';
import {makePoint} from '../utils/geoUtils';

import NativeBridgeComponent from './NativeBridgeComponent';

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
 *
 * Consider using ShapeSource and SymbolLayer instead, if you have many points and you have static images,
 * they'll offer much better performance
 *
 * .
 * If you need interctive views please use MarkerView,
 * as with PointAnnotation on Android child views are rendered onto a bitmap for better performance.
 */
class PointAnnotation extends NativeBridgeComponent(React.PureComponent) {
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
     * Enable or disable dragging. Defaults to false.
     */
    draggable: PropTypes.bool,

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
      /**
       * See anchor
       */
      x: PropTypes.number.isRequired,
      /**
       * See anchor
       */
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

    /**
     * This callback is fired once this annotation has started being dragged.
     */
    onDragStart: PropTypes.func,

    /**
     * This callback is fired once this annotation has stopped being dragged.
     */
    onDragEnd: PropTypes.func,

    /**
     * This callback is fired while this annotation is being dragged.
     */
    onDrag: PropTypes.func,
  };

  static defaultProps = {
    anchor: {x: 0.5, y: 0.5},
    draggable: false,
  };

  constructor(props) {
    super(props, NATIVE_MODULE_NAME);
    this._onSelected = this._onSelected.bind(this);
    this._onDeselected = this._onDeselected.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
  }

  _onSelected(e) {
    if (isFunction(this.props.onSelected)) {
      this.props.onSelected(e.nativeEvent.payload);
    }
  }

  _onDeselected(e) {
    if (isFunction(this.props.onDeselected)) {
      this.props.onDeselected(e.nativeEvent.payload);
    }
  }

  _onDragStart(e) {
    if (isFunction(this.props.onDragStart)) {
      this.props.onDragStart(e.nativeEvent.payload);
    }
  }

  _onDrag(e) {
    if (isFunction(this.props.onDrag)) {
      this.props.onDrag(e.nativeEvent.payload);
    }
  }

  _onDragEnd(e) {
    if (isFunction(this.props.onDragEnd)) {
      this.props.onDragEnd(e.nativeEvent.payload);
    }
  }

  _getCoordinate() {
    if (!this.props.coordinate) {
      return undefined;
    }
    return toJSONString(makePoint(this.props.coordinate));
  }

  /**
   * On v10 and pre v10 android point annotation is rendered offscreen with a canvas into an image.
   * To rerender the image from the current state of the view call refresh.
   * Call this for example from Image#onLoad.
   */
  refresh() {
    if (Platform.OS === 'android') {
      this._runNativeCommand('refresh', this._nativeRef, []);
    } else {
      this._runNativeCommand('refresh', this._nativeRef, []);
    }
  }

  _setNativeRef(nativeRef) {
    this._nativeRef = nativeRef;
    super._runPendingNativeCommands(nativeRef);
  }

  render() {
    const props = {
      ...this.props,
      ref: nativeRef => this._setNativeRef(nativeRef),
      id: this.props.id,
      title: this.props.title,
      snippet: this.props.snippet,
      anchor: this.props.anchor,
      selected: this.props.selected,
      draggable: this.props.draggable,
      style: [this.props.style, styles.container],
      onMapboxPointAnnotationSelected: this._onSelected,
      onMapboxPointAnnotationDeselected: this._onDeselected,
      onMapboxPointAnnotationDragStart: this._onDragStart,
      onMapboxPointAnnotationDrag: this._onDrag,
      onMapboxPointAnnotationDragEnd: this._onDragEnd,
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
      onMapboxPointAnnotationDragStart: true,
      onMapboxPointAnnotationDrag: true,
      onMapboxPointAnnotationDragEnd: true,
    },
  },
);

export default PointAnnotation;
