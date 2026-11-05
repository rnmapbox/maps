import React from 'react';
import {
  type NativeMethods,
  NativeModules,
  type NativeSyntheticEvent,
} from 'react-native';

import RNMBXShapeSourceNativeComponent from '../specs/RNMBXShapeSourceNativeComponent';
import NativeRNMBXShapeSourceModule from '../specs/NativeRNMBXShapeSourceModule';
import {
  toJSONString,
  cloneReactChildrenWithProps,
  isFunction,
  isAndroid,
} from '../utils';
import { copyPropertiesAsDeprecated } from '../utils/deprecation';
import { type OnPressEvent } from '../types/OnPressEvent';
import { type ShapeAnimatorInterface } from '../shapeAnimators';
import { type Expression } from '../utils/MapboxStyles';

import AbstractSource from './AbstractSource';
import NativeBridgeComponent from './NativeBridgeComponent';

const Mapbox = NativeModules.RNMBXModule;

type OnPressEventDeprecated = OnPressEvent & {
  nativeEvent?: OnPressEvent;
};

export type Props = {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The id refers to an existing source in the style. Does not create a new source.
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
    | GeoJSON.Geometry
    | ShapeAnimatorInterface;

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
   * Specifies the minimum number of points to form a cluster if clustering is enabled.
   * The default value is 2. It is applied when the source is added to the map; changing it
   * later requires remounting the ShapeSource.
   */
  clusterMinPoints?: number;

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
   * A feature property to use as the feature id, for example with `setFeatureState`.
   * Either a property name or an expression that evaluates to the id.
   */
  promoteId?: string | Expression;

  /**
   * Specifies the maximum zoom level at which to create vector tiles.
   * A greater value produces greater detail at high zoom levels.
   * The default value is 18.
   */
  maxZoomLevel?: number;

  /**
   * Specifies the minimum zoom level at which to create vector tiles.
   * The default value is 0.
   */
  minZoomLevel?: number;

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
   * Overrides the default touch hitbox (44x44 points) for the source layers
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
  NativeRNMBXShapeSourceModule,
) {
  static NATIVE_ASSETS_KEY = 'assets';

  static defaultProps = {
    id: Mapbox.StyleSource.DefaultSourceID,
  };

  // Lets native order partial updates after the `shape` they were made on.
  static getDerivedStateFromProps(
    props: Pick<Props, 'shape'>,
    state: State,
  ): State | null {
    if (props.shape === state.source) {
      return null;
    }
    const shape = props.shape ? toJSONString(props.shape) : undefined;
    return {
      source: props.shape,
      shape,
      shapeRevision:
        shape !== undefined && shape !== state.shape
          ? state.shapeRevision + 1
          : state.shapeRevision,
    };
  }

  state: State = { shapeRevision: 0 };

  constructor(props: Props) {
    super(props);
  }

  _setNativeRef(
    nativeRef: React.Component<NativeProps> & Readonly<NativeMethods>,
  ) {
    this.setNativeRef(nativeRef);
    super._runPendingNativeMethods(nativeRef);
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
    const res: { data: number } = await this._runNativeMethod(
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
    const res: { data: string } = await this._runNativeMethod(
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
    const res: { data: string } = await this._runNativeMethod(
      'getClusterChildren',
      this._nativeRef,
      [JSON.stringify(feature)],
    );

    if (isAndroid()) {
      return JSON.parse(res.data);
    }
    return res.data;
  }

  _featureId(feature: GeoJSON.Feature): string {
    const { promoteId } = this.props;
    const promoted =
      typeof promoteId === 'string'
        ? feature.properties?.[promoteId]
        : undefined;
    const id = promoted ?? feature.id;
    if (id === undefined || id === null) {
      throw new Error(
        'ShapeSource: partial updates need a feature `id`, or the `promoteId` property on the feature',
      );
    }
    return String(id);
  }

  _assertSupportsPartialUpdates() {
    const { shape, url } = this.props;
    if (url) {
      throw new Error(
        'ShapeSource: partial updates are not supported with `url`, as it can load after they are applied',
      );
    }
    if (shape && '__nativeTag' in shape) {
      throw new Error(
        'ShapeSource: partial updates are not supported with a shape animator, as it replaces the data on every frame',
      );
    }
  }

  async _changeFeatures(
    methodName: 'addFeatures' | 'updateFeatures',
    features: GeoJSON.Feature[],
  ): Promise<void> {
    this._assertSupportsPartialUpdates();
    const featureIds = features.map((feature) => this._featureId(feature));
    await this._runNativeMethod(methodName, this._nativeRef, [
      JSON.stringify({ type: 'FeatureCollection', features }),
      featureIds,
      this.state.shapeRevision,
    ]);
  }

  /**
   * Adds features to the source without resending its `shape`, which keeps the JS thread free
   * when a large source changes often. The map still reprocesses the source, so for changes to
   * paint properties alone `MapView#setFeatureState` is much cheaper.
   *
   * Every feature of the source needs a unique id: a feature `id`, or the `promoteId` property.
   *
   * The promise resolves once the source has the change, shortly before it renders. It rejects
   * when the map refused the call, for example if an added id already exists or the source has
   * features without an id. The map stops at the first such id, named in the error, and keeps
   * the features before it. It also rejects if a new `shape` or an unmount replaced the change
   * first. Refusals also reach `MapView#onMapLoadingError`.
   *
   * Changes survive a style reload, and stay in memory for that until the next `shape`. A new
   * `shape` replaces them, a re-render with an equal `shape` keeps them, and remounting
   * `ShapeSource` loses them. A call made after a `shape` was committed applies on top of that
   * `shape`. Works with clustering. Not supported with `url`, a shape animator, or on web. With
   * `existing` the source should have inline data, a reload can't reapply changes before a url loads.
   *
   * @example
   * await shapeSource.addFeatures([{ type: 'Feature', id: 'a', properties: {}, geometry }]);
   *
   * @param  {GeoJSON.Feature[]} features - The features to add.
   * @return {void}
   */
  async addFeatures(features: GeoJSON.Feature[]): Promise<void> {
    await this._changeFeatures('addFeatures', features);
  }

  /**
   * Replaces features of the source by id, without resending its `shape`. The map refuses the
   * call at the first missing id. See `addFeatures` for the requirements and the result.
   *
   * @example
   * await shapeSource.updateFeatures([{ type: 'Feature', id: 'a', properties: { v: 1 }, geometry }]);
   *
   * @param  {GeoJSON.Feature[]} features - The new features, the id selects the feature to replace.
   * @return {void}
   */
  async updateFeatures(features: GeoJSON.Feature[]): Promise<void> {
    await this._changeFeatures('updateFeatures', features);
  }

  /**
   * Removes features from the source by id, without resending its `shape`. The map refuses the
   * call at the first missing id, and removals before it render with the next change. See
   * `addFeatures` for the requirements and the result.
   *
   * @example
   * await shapeSource.removeFeatures(['a']);
   *
   * @param  {(string | number)[]} featureIds - The ids of the features to remove.
   * @return {void}
   */
  async removeFeatures(featureIds: (string | number)[]): Promise<void> {
    this._assertSupportsPartialUpdates();
    await this._runNativeMethod('removeFeatures', this._nativeRef, [
      [...new Set(featureIds.map(String))],
      this.state.shapeRevision,
    ]);
  }

  setNativeProps(props: NativeProps) {
    const shallowProps = Object.assign({}, props);

    // Adds support for Animated
    if (shallowProps.shape && typeof shallowProps.shape !== 'string') {
      shallowProps.shape = JSON.stringify(shallowProps.shape);
    }

    super.setNativeProps(shallowProps);
  }

  _decodePayload(payload: OnPressEvent | string): OnPressEvent {
    // we check whether the payload is a string, since the strict type safety is enforced only on iOS on the new arch
    // on Android, on both archs, the payload is an object
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    } else {
      return payload;
    }
  }

  onPress(
    event: NativeSyntheticEvent<{
      payload: OnPressEvent;
    }>,
  ) {
    const payload = this._decodePayload(event.nativeEvent.payload);
    const { features, coordinates, point } = payload;
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
      shape: this.state.shape,
      shapeRevision: this.state.shapeRevision,
      hitbox: this.props.hitbox,
      hasPressListener: isFunction(this.props.onPress),
      onMapboxShapeSourcePress: this.onPress.bind(this),
      cluster: this.props.cluster ? 1 : 0,
      clusterRadius: this.props.clusterRadius,
      clusterMaxZoomLevel: this.props.clusterMaxZoomLevel,
      clusterMinPoints: this.props.clusterMinPoints,
      clusterProperties: this.props.clusterProperties,
      promoteId: this.props.promoteId,
      maxZoomLevel: this.props.maxZoomLevel,
      minZoomLevel: this.props.minZoomLevel,
      buffer: this.props.buffer,
      tolerance: this.props.tolerance,
      lineMetrics: this.props.lineMetrics,
      onPress: undefined,
      ref: (
        nativeRef: React.Component<NativeProps> & Readonly<NativeMethods>,
      ) => this._setNativeRef(nativeRef),
    };

    return (
      // @ts-expect-error just codegen stuff
      <RNMBXShapeSourceNativeComponent {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RNMBXShapeSourceNativeComponent>
    );
  }
}

type State = {
  source?: Props['shape'];
  shape?: string;
  shapeRevision: number;
};

type NativeProps = {
  id: string;
  shape?: string;
};
