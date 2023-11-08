import React, { SyntheticEvent, type Component } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import { Feature, GeoJsonProperties, Geometry, Point } from 'geojson';

import { toJSONString, isFunction } from '../utils';
import checkRequiredProps from '../utils/checkRequiredProps';
import { makePoint } from '../utils/geoUtils';
import { type BaseProps } from '../types/BaseProps';
import { Position } from '../types/Position';
import RNMBXPointAnnotationNativeComponent from '../specs/RNMBXPointAnnotationNativeComponent';
import NativeRNMBXPointAnnotationModule from '../specs/NativeRNMBXPointAnnotationModule';

import NativeBridgeComponent, { type RNMBEvent } from './NativeBridgeComponent';

export const NATIVE_MODULE_NAME = 'RNMBXPointAnnotation';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});

type FeaturePayload = Feature<
  Point,
  {
    screenPointX: number;
    screenPointY: number;
  }
>;

type Props = BaseProps & {
  /**
   * A string that uniquely identifies the annotation
   */
  id: string;

  /**
   * The string containing the annotation’s title. Note this is required to be set if you want to see a callout appear on iOS.
   */
  title?: string;

  /**
   * The string containing the annotation’s snippet(subtitle). Not displayed in the default callout.
   */
  snippet?: string;

  /**
   * Manually selects/deselects annotation
   */
  selected?: boolean;

  /**
   * Enable or disable dragging. Defaults to false.
   */
  draggable?: boolean;

  /**
   * The center point (specified as a map coordinate) of the annotation.
   */
  coordinate: Position;

  /**
   * Specifies the anchor being set on a particular point of the annotation.
   * The anchor point is specified in the continuous space [0.0, 1.0] x [0.0, 1.0],
   * where (0, 0) is the top-left corner of the image, and (1, 1) is the bottom-right corner.
   * Note this is only for custom annotations not the default pin view.
   * Defaults to the center of the view.
   */
  anchor?: {
    /**
     * See anchor
     */
    x: number;
    /**
     * See anchor
     */
    y: number;
  };

  /**
   * This callback is fired once this annotation is selected. Returns a Feature as the first param.
   */
  onSelected?: (payload: FeaturePayload) => void;

  /**
   * This callback is fired once this annotation is deselected.
   */
  onDeselected?: (payload: FeaturePayload) => void;

  /**
   * This callback is fired once this annotation has started being dragged.
   */
  onDragStart?: (payload: FeaturePayload) => void;

  /**
   * This callback is fired once this annotation has stopped being dragged.
   */
  onDragEnd?: (payload: FeaturePayload) => void;

  /**
   * This callback is fired while this annotation is being dragged.
   */
  onDrag?: (payload: FeaturePayload) => void;

  /**
   * Expects one child, and an optional callout can be added as well
   */
  children: React.ReactElement | [React.ReactElement, React.ReactElement];

  style?: ViewProps['style'];
};

/**
 * PointAnnotation represents a one-dimensional shape located at a single geographical coordinate.
 *
 * Consider using ShapeSource and SymbolLayer instead, if you have many points and static images,
 * they'll offer much better performance.
 *
 * If you need interactive views please use MarkerView because PointAnnotation will render children onto a bitmap.
 * Also disable any kind of animations like `fadeDuration` of `Image`.
 * Otherwise, the bitmap might be rendered at an unknown state of the animation.
 */
class PointAnnotation extends NativeBridgeComponent(
  React.PureComponent<Props>,
  NativeRNMBXPointAnnotationModule,
) {
  static defaultProps = {
    anchor: { x: 0.5, y: 0.5 },
    draggable: false,
  };

  _nativeRef: NativePointAnnotationRef | null = null;

  constructor(props: Props) {
    super(props);
    checkRequiredProps('PointAnnotation', props, ['id', 'coordinate']);
    this._onSelected = this._onSelected.bind(this);
    this._onDeselected = this._onDeselected.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
  }

  _decodePayload<G extends Geometry | null = Geometry, P = GeoJsonProperties>(
    payload: GeoJSON.Feature<G, P> | string,
  ): GeoJSON.Feature<G, P> {
    // we check whether the payload is a string, since the strict type safety is enforced only on iOS on the new arch
    // on Android, on both archs, the payload is an object
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    } else {
      return payload;
    }
  }

  _onSelected(e: SyntheticEvent<Element, RNMBEvent<FeaturePayload>>) {
    if (isFunction(this.props.onSelected)) {
      const payload = this._decodePayload(e.nativeEvent.payload);
      this.props.onSelected(payload);
    }
  }

  _onDeselected(e: SyntheticEvent<Element, RNMBEvent<FeaturePayload>>) {
    if (isFunction(this.props.onDeselected)) {
      const payload = this._decodePayload(e.nativeEvent.payload);
      this.props.onDeselected(payload);
    }
  }

  _onDragStart(e: SyntheticEvent<Element, RNMBEvent<FeaturePayload>>) {
    if (isFunction(this.props.onDragStart)) {
      const payload = this._decodePayload(e.nativeEvent.payload);
      this.props.onDragStart(payload);
    }
  }

  _onDrag(e: SyntheticEvent<Element, RNMBEvent<FeaturePayload>>) {
    if (isFunction(this.props.onDrag)) {
      const payload = this._decodePayload(e.nativeEvent.payload);
      this.props.onDrag(payload);
    }
  }

  _onDragEnd(e: SyntheticEvent<Element, RNMBEvent<FeaturePayload>>) {
    if (isFunction(this.props.onDragEnd)) {
      const payload = this._decodePayload(e.nativeEvent.payload);
      this.props.onDragEnd(payload);
    }
  }

  _getCoordinate(): string | undefined {
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
    this._runNativeMethod('refresh', this._nativeRef, []);
  }

  _setNativeRef(nativeRef: NativePointAnnotationRef | null) {
    this._nativeRef = nativeRef;
    super._runPendingNativeMethods(nativeRef);
  }

  render() {
    const props = {
      ...this.props,
      ref: (nativeRef: NativePointAnnotationRef | null) =>
        this._setNativeRef(nativeRef),
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
      // @ts-expect-error just codegen stuff
      <RNMBXPointAnnotationNativeComponent {...props}>
        {this.props.children}
      </RNMBXPointAnnotationNativeComponent>
    );
  }
}

type NativeProps = Omit<Props, 'coordinate'> & {
  coordinate: string | undefined;
};

type NativePointAnnotationRef = Component<NativeProps>;

export default PointAnnotation;
