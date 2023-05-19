import React from 'react';
import {
  NativeMethods,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
} from 'react-native';

import { getFilter } from '../utils/filterUtils';
import {
  toJSONString,
  cloneReactChildrenWithProps,
  isFunction,
  isAndroid,
} from '../utils';
import { copyPropertiesAsDeprecated } from '../utils/deprecation';
import { OnPressEvent } from '../types/OnPressEvent';

import AbstractSource from './AbstractSource';
import NativeBridgeComponent from './NativeBridgeComponent';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLShapeSource';

type OnPressEventDeprecated = OnPressEvent & {
  nativeEvent?: OnPressEvent;
};

export type Props = {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The id refers to en existing source in the style. Does not create a new source.
   */
  existing?: boolean;

  /**
   * An HTTP(S) URL, absolute file URL, or local file URL relative to the current application’s resource bundle.
   */
  url?: string;

  /**
   * The contents of the source. A shape can represent a GeoJSON geometry, a feature, or a feature collection.
   */
  shape?:
    | GeoJSON.GeometryCollection
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection
    | GeoJSON.Geometry;

  /**
   * Enables clustering on the source for point shapes.
   */
  cluster?: boolean;

  /**
   * Specifies the radius of each cluster if clustering is enabled.
   * A value of 512 produces a radius equal to the width of a tile.
   * The default value is 50.
   */
  clusterRadius?: number;

  /**
   * Specifies the maximum zoom level at which to cluster points if clustering is enabled.
   * Defaults to one zoom level less than the value of maxZoomLevel so that, at the maximum zoom level,
   * the shapes are not clustered.
   */
  clusterMaxZoomLevel?: number;

  /**
   * [`mapbox-gl` (v8) implementation only]
   * Specifies custom properties on the generated clusters if clustering
   * is enabled, aggregating values from clustered points.
   *
   * Has the form `{ "property_name": [operator, map_expression]}`, where
   *  `operator` is a custom reduce expression that references a special `["accumulated"]` value -
   *   it accumulates the property value from clusters/points the cluster contains
   *  `map_expression` produces the value of a single point
   *
   * Example: `{ "resultingSum": [["+", ["accumulated"], ["get", "resultingSum"]], ["get", "scalerank"]] }`
   *
   */
  clusterProperties?: object;

  /**
   * Specifies the maximum zoom level at which to create vector tiles.
   * A greater value produces greater detail at high zoom levels.
   * The default value is 18.
   */
  maxZoomLevel?: number;

  /**
   * Specifies the size of the tile buffer on each side.
   * A value of 0 produces no buffer. A value of 512 produces a buffer as wide as the tile itself.
   * Larger values produce fewer rendering artifacts near tile edges and slower performance.
   * The default value is 128.
   */
  buffer?: number;

  /**
   * Specifies the Douglas-Peucker simplification tolerance.
   * A greater value produces simpler geometries and improves performance.
   * The default value is 0.375.
   */
  tolerance?: number;

  /**
   * Whether to calculate line distance metrics.
   * This is required for line layers that specify lineGradient values.
   * The default value is false.
   */
  lineMetrics?: boolean;

  /**
   * Source press listener, gets called when a user presses one of the children layers only
   * if that layer has a higher z-index than another source layers
   *
   * @param {Object} event
   * @param {Object[]} event.features - the geojson features that have hit by the press (might be multiple)
   * @param {Object} event.coordinates - the coordinates of the click
   * @param {Object} event.point - the point of the click
   * @return void
   */
  onPress?: (event: OnPressEvent) => void;

  /**
   * Overrides the default touch hitbox(44x44 pixels) for the source layers
   */
  hitbox?: {
    /**
     * `width` of hitbox
     */
    width: number;
    /**
     * `height` of hitbox
     */
    height: number;
  };

  children?: React.ReactElement | React.ReactElement[];
};

/**
 * ShapeSource is a map content source that supplies vector shapes to be shown on the map.
 * The shape may be an url or a GeoJSON object
 */
export class ShapeSource extends NativeBridgeComponent(
  AbstractSource<Props, NativeProps>,
  NATIVE_MODULE_NAME,
) {
  static NATIVE_ASSETS_KEY = 'assets';

  static defaultProps = {
    id: MapboxGL.StyleSource.DefaultSourceID,
  };

  constructor(props: Props) {
    super(props);
  }

  _setNativeRef(
    nativeRef: React.Component<NativeProps> & Readonly<NativeMethods>,
  ) {
    this.setNativeRef(nativeRef);
    super._runPendingNativeCommands(nativeRef);
  }

  /**
   * Returns all features from the source that match the query parameters whether the feature is currently
   * rendered on the map.
   *
   * @example
   * shapeSource.features()
   *
   * @param  {Array=} filter - an optional filter statement to filter the returned Features.
   * @return {FeatureCollection}
   */
  async features(filter: Array<string> = []) {
    const res: { data: string } = await this._runNativeCommand(
      'features',
      this._nativeRef,
      getFilter(filter),
    );

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  /**
   * Returns the zoom needed to expand the cluster.
   *
   * @example
   * const zoom = await shapeSource.getClusterExpansionZoom(clusterId);
   *
   * @param  {Feature} feature - The feature cluster to expand.
   * @return {number}
   */
  async getClusterExpansionZoom(
    feature: string | GeoJSON.Feature,
  ): Promise<number> {
    if (typeof feature === 'number') {
      console.warn(
        'Using cluster_id is deprecated and will be removed from the future releases. Please use cluster as an argument instead.',
      );
      const res: { data: number } = await this._runNativeCommand(
        'getClusterExpansionZoomById',
        this._nativeRef,
        [feature],
      );
      return res.data;
    }

    const res: { data: number } = await this._runNativeCommand(
      'getClusterExpansionZoom',
      this._nativeRef,
      [JSON.stringify(feature)],
    );
    return res.data;
  }

  /**
   * Returns the FeatureCollection from the cluster.
   *
   * @example
   * const collection = await shapeSource.getClusterLeaves(clusterId, limit, offset);
   *
   * @param  {GeoJSON.Feature} feature - The feature cluster to expand.
   * @param  {number} limit - The number of points to return.
   * @param  {number} offset - The amount of points to skip (for pagination).
   * @return {FeatureCollection}
   */
  async getClusterLeaves(
    feature: number | GeoJSON.Feature,
    limit: number,
    offset: number,
  ) {
    if (typeof feature === 'number') {
      console.warn(
        'Using cluster_id is deprecated and will be removed from the future releases. Please use cluster as an argument instead.',
      );
      const res: { data: string } = await this._runNativeCommand(
        'getClusterLeavesById',
        this._nativeRef,
        [feature, limit, offset],
      );

      if (isAndroid()) {
        return JSON.parse(res.data);
      }

      return res.data;
    }

    const res: { data: string } = await this._runNativeCommand(
      'getClusterLeaves',
      this._nativeRef,
      [JSON.stringify(feature), limit, offset],
    );

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  /**
   * Returns the FeatureCollection from the cluster (on the next zoom level).
   *
   * @example
   * const collection = await shapeSource.getClusterChildren(clusterId);
   *
   * @param  {GeoJSON.Feature} feature - The feature cluster to expand.
   * @return {FeatureCollection}
   */
  async getClusterChildren(feature: number | GeoJSON.Feature) {
    if (typeof feature === 'number') {
      console.warn(
        'Using cluster_id is deprecated and will be removed from the future releases. Please use cluster as an argument instead.',
      );
      const res: { data: string } = await this._runNativeCommand(
        'getClusterChildrenById',
        this._nativeRef,
        [feature],
      );

      if (isAndroid()) {
        return JSON.parse(res.data);
      }

      return res.data;
    }

    const res: { data: string } = await this._runNativeCommand(
      'getClusterChildren',
      this._nativeRef,
      [JSON.stringify(feature)],
    );

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  setNativeProps(props: NativeProps) {
    const shallowProps = Object.assign({}, props);

    // Adds support for Animated
    if (shallowProps.shape && typeof shallowProps.shape !== 'string') {
      shallowProps.shape = JSON.stringify(shallowProps.shape);
    }

    super.setNativeProps(shallowProps);
  }

  _getShape() {
    if (!this.props.shape) {
      return;
    }
    return toJSONString(this.props.shape);
  }

  onPress(
    event: NativeSyntheticEvent<{
      payload: OnPressEvent;
    }>,
  ) {
    const {
      nativeEvent: {
        payload: { features, coordinates, point },
      },
    } = event;
    let newEvent: OnPressEventDeprecated = {
      features,
      coordinates,
      point,
    };

    newEvent = copyPropertiesAsDeprecated(
      event as unknown as Record<string, unknown>,
      newEvent,
      (key) => {
        console.warn(
          `event.${key} is deprecated on ShapeSource#onPress, please use event.features`,
        );
      },
      {
        nativeEvent: (origNativeEvent: unknown) => ({
          ...(origNativeEvent as OnPressEvent),
          payload: features[0],
        }),
      },
    );
    this.props.onPress?.(newEvent);
  }

  render() {
    const props = {
      id: this.props.id,
      existing: this.props.existing,
      url: this.props.url,
      shape: this._getShape(),
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxShapeSourcePress: this.onPress.bind(this),
      cluster: this.props.cluster ? 1 : 0,
      clusterRadius: this.props.clusterRadius,
      clusterMaxZoomLevel: this.props.clusterMaxZoomLevel,
      clusterProperties: this.props.clusterProperties,
      maxZoomLevel: this.props.maxZoomLevel,
      buffer: this.props.buffer,
      tolerance: this.props.tolerance,
      lineMetrics: this.props.lineMetrics,
      onPress: undefined,
      ref: (
        nativeRef: React.Component<NativeProps> & Readonly<NativeMethods>,
      ) => this._setNativeRef(nativeRef),
      onAndroidCallback: isAndroid() ? this._onAndroidCallback : undefined,
    };

    return (
      <RCTMGLShapeSource {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLShapeSource>
    );
  }
}

type NativeProps = {
  id: string;
  shape?: string;
};

const RCTMGLShapeSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);
