import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  NativeModules,
  ViewProps,
  NativeSyntheticEvent,
  NativeMethods,
  HostComponent,
  LayoutChangeEvent,
} from 'react-native';
import { debounce } from 'debounce';

import NativeMapView, {
  type NativeMapViewActual,
} from '../specs/RNMBXMapViewNativeComponent';
import NativeMapViewModule from '../specs/NativeMapViewModule';
import {
  isFunction,
  isAndroid,
  type NativeArg,
  type OrnamentPositonProp,
} from '../utils';
import { getFilter } from '../utils/filterUtils';
import Logger from '../utils/Logger';
import { FilterExpression } from '../utils/MapboxStyles';
import { type Position } from '../types/Position';
import { type Location } from '../modules/location/locationManager';

import NativeBridgeComponent from './NativeBridgeComponent';

const { RNMBXModule } = NativeModules;
const { EventTypes } = RNMBXModule;

if (RNMBXModule == null) {
  console.error(
    'Native part of Mapbox React Native libraries were not registered properly, double check our native installation guides.',
  );
}
if (!RNMBXModule.MapboxV10) {
  console.warn(
    '@rnmapbox/maps: Non v10 implementations are deprecated and will be removed in next version - see https://github.com/rnmapbox/maps/wiki/Deprecated-RNMapboxImpl-Maplibre',
  );
}

const styles = StyleSheet.create({
  matchParent: { flex: 1 },
});

const defaultStyleURL = RNMBXModule.StyleURL.Street;

export type Point = {
  x: number;
  y: number;
};

type BBox = [number, number, number, number];

export type RegionPayload = {
  zoomLevel: number;
  heading: number;
  animated: boolean;
  isUserInteraction: boolean;
  visibleBounds: GeoJSON.Position[];
  pitch: number;
};

export type GestureSettings = {
  /**
   * Whether double tapping the map with one touch results in a zoom-in animation.
   */
  doubleTapToZoomInEnabled?: boolean;
  /**
   * Whether single tapping the map with two touches results in a zoom-out animation.
   */
  doubleTouchToZoomOutEnabled?: boolean;
  /**
   * Whether pan/scroll is enabled for the pinch gesture.
   */
  pinchPanEnabled?: boolean;
  /**
   * Whether zoom is enabled for the pinch gesture.
   */
  pinchZoomEnabled?: boolean;
  /**
   * Whether a deceleration animation following a pinch-zoom gesture is enabled. True by default.
   * (Android only)
   */
  pinchZoomDecelerationEnabled?: boolean;
  /**
   * Whether the pitch gesture is enabled.
   */
  pitchEnabled?: boolean;
  /**
   * Whether the quick zoom gesture is enabled.
   */
  quickZoomEnabled?: boolean;
  /**
   * Whether the rotate gesture is enabled.
   */
  rotateEnabled?: boolean;
  /**
   * Whether a deceleration animation following a rotate gesture is enabled. True by default.
   * (Android only)
   */
  rotateDecelerationEnabled?: boolean;
  /**
   * Whether the single-touch pan/scroll gesture is enabled.
   */
  panEnabled?: boolean;
  /**
   * A constant factor that determines how quickly pan deceleration animations happen. Multiplied with the velocity vector once per millisecond during deceleration animations.
   *
   * On iOS Defaults to UIScrollView.DecelerationRate.normal.rawValue
   * On android set to 0 to disable deceleration, and non zero to enabled it.
   */
  panDecelerationFactor?: number;
  /**
   * Whether rotation is enabled for the pinch zoom gesture.
   */
  simultaneousRotateAndPinchZoomEnabled?: boolean;
  /**
   * The amount by which the zoom level increases or decreases during a double-tap-to-zoom-in or double-touch-to-zoom-out gesture. 1.0 by default. Must be positive.
   * (Android only)
   */
  zoomAnimationAmount?: number;
};

/**
 * v10 only
 */
export type MapState = {
  properties: {
    center: GeoJSON.Position;
    bounds: {
      ne: GeoJSON.Position;
      sw: GeoJSON.Position;
    };
    zoom: number;
    heading: number;
    pitch: number;
  };
  gestures: {
    isGestureActive: boolean;
  };
  timestamp?: number;
};

/**
 * label localization settings (v10 only). `true` is equivalent to current locale.
 */
type LocalizeLabels =
  | {
      /** locale code like `es` or `current` for the device's current locale */
      locale: string;
      /** layer id to localize. If not specified, all layers will be localized */
      layerIds?: string[];
    }
  | true;

type Props = ViewProps & {
  /**
   * The distance from the edges of the map view’s frame to the edges of the map view’s logical viewport.
   * @deprecated use Camera `padding` instead
   */
  contentInset?: number | number[];

  /**
   * The projection used when rendering the map
   */
  projection?: 'mercator' | 'globe';

  /**
   * Style URL for map - notice, if non is set it _will_ default to `Mapbox.StyleURL.Street`
   */
  styleURL?: string;

  /**
   * StyleJSON for map - according to TileJSON specs: https://github.com/mapbox/tilejson-spec
   */
  styleJSON?: string;

  /**
   * iOS: The preferred frame rate at which the map view is rendered.
   * The default value for this property is MGLMapViewPreferredFramesPerSecondDefault,
   * which will adaptively set the preferred frame rate based on the capability of
   * the user’s device to maintain a smooth experience. This property can be set to arbitrary integer values.
   *
   * Android: The maximum frame rate at which the map view is rendered, but it can't exceed the ability of device hardware.
   * This property can be set to arbitrary integer values.
   */
  preferredFramesPerSecond?: number;

  /**
   * Enable/Disable zoom on the map
   */
  zoomEnabled?: boolean;

  /**
   * Enable/Disable scroll on the map
   */
  scrollEnabled?: boolean;

  /**
   * Enable/Disable pitch on map
   */
  pitchEnabled?: boolean;

  /**
   * Enable/Disable rotation on map
   */
  rotateEnabled?: boolean;

  /**
   * The Mapbox terms of service, which governs the use of Mapbox-hosted vector tiles and styles,
   * [requires](https://www.mapbox.com/help/how-attribution-works/) these copyright notices to accompany any map that features Mapbox-designed styles, OpenStreetMap data, or other Mapbox data such as satellite or terrain data.
   * If that applies to this map view, do not hide this view or remove any notices from it.
   *
   * You are additionally [required](https://www.mapbox.com/help/how-mobile-apps-work/#telemetry) to provide users with the option to disable anonymous usage and location sharing (telemetry).
   * If this view is hidden, you must implement this setting elsewhere in your app. See our website for [Android](https://www.mapbox.com/android-docs/map-sdk/overview/#telemetry-opt-out) and [iOS](https://www.mapbox.com/ios-sdk/#telemetry_opt_out) for implementation details.
   *
   * Enable/Disable attribution on map. For iOS you need to add MGLMapboxMetricsEnabledSettingShownInApp=YES
   * to your Info.plist
   */
  attributionEnabled?: boolean;

  /**
   * Adds attribution offset, e.g. `{top: 8, left: 8}` will put attribution button in top-left corner of the map. By default on Android, the attribution with information icon (i) will be on the bottom left, while on iOS the mapbox logo will be on bottom left with information icon (i) on bottom right. Read more about mapbox attribution [here](https://docs.mapbox.com/help/getting-started/attribution/)
   */
  attributionPosition?: OrnamentPositonProp;

  /**
   * MapView's tintColor
   */
  tintColor?: string | number[];

  /**
   * Enable/Disable the logo on the map.
   */
  logoEnabled?: boolean;

  /**
   * Adds logo offset, e.g. `{top: 8, left: 8}` will put the logo in top-left corner of the map
   */
  logoPosition?: OrnamentPositonProp;

  /**
   * Enable/Disable the compass from appearing on the map
   */
  compassEnabled?: boolean;

  /**
   * [`mapbox` (v10) implementation only] Enable/Disable if the compass should fade out when the map is pointing north
   */
  compassFadeWhenNorth?: boolean;

  /**
   * [`mapbox` (v10) implementation only] Adds compass offset, e.g. `{top: 8, left: 8}` will put the compass in top-left corner of the map
   */
  compassPosition?: OrnamentPositonProp;

  /**
   * Change corner of map the compass starts at. 0: TopLeft, 1: TopRight, 2: BottomLeft, 3: BottomRight
   */
  compassViewPosition?: number;

  /**
   * Add margins to the compass with x and y values
   */
  compassViewMargins?: Point;

  /**
   * [iOS, `mapbox` (v10) implementation only] A string referencing an image key. Requires an `Images` component.
   */
  compassImage?: string;

  /**
   * [`mapbox` (v10) implementation only] Enable/Disable the scale bar from appearing on the map
   */
  scaleBarEnabled?: boolean;

  /**
   * [`mapbox` (v10) implementation only] Adds scale bar offset, e.g. `{top: 8, left: 8}` will put the scale bar in top-left corner of the map
   */
  scaleBarPosition?: OrnamentPositonProp;

  /**
   * [Android only] Enable/Disable use of GLSurfaceView instead of TextureView.
   */
  surfaceView?: boolean;

  /**
   * [Android only] Experimental, call requestDisallowInterceptTouchEvent on parent with onTochEvent, this allows touch interaction to work
   * when embedded into a scroll view
   */
  requestDisallowInterceptTouchEvent?: boolean;

  /**
   * [`mapbox` (v10) implementation only]
   * Set map's label locale, e.g. `{ "locale": "es" }` will localize labels to Spanish, `{ "locale": "current" }` will localize labels to system locale.
   */
  localizeLabels?: LocalizeLabels;

  /**
   * Gesture configuration allows to control the user touch interaction.
   */
  gestureSettings?: GestureSettings;

  /**
   * Map press listener, gets called when a user presses the map
   */
  onPress?: (feature: GeoJSON.Feature) => void;

  /**
   * Map long press listener, gets called when a user long presses the map
   */
  onLongPress?: (feature: GeoJSON.Feature) => void;

  /**
   * <v10 only
   *
   * This event is triggered whenever the currently displayed map region is about to change.
   *
   * @param {PointFeature} feature - The geojson point feature at the camera center, properties contains zoomLevel, visibleBounds
   */
  onRegionWillChange?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;

  /**
   *
   * This event is triggered whenever the currently displayed map region is changing.
   *
   * @param {PointFeature} feature - The geojson point feature at the camera center, properties contains zoomLevel, visibleBounds
   */
  onRegionIsChanging?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;

  /**
   *
   * This event is triggered whenever the currently displayed map region finished changing.
   *
   * @param {PointFeature} feature - The geojson point feature at the camera center, properties contains zoomLevel, visibleBounds
   */
  onRegionDidChange?: (
    feature: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => void;

  /**
   * v10 only, replaces onRegionIsChanging
   */
  onCameraChanged?: (state: MapState) => void;

  /**
   * v10 only, replaces onRegionDidChange
   */
  onMapIdle?: (state: MapState) => void;

  /**
   * This event is triggered when the map is about to start loading a new map style.
   */
  onWillStartLoadingMap?: () => void;

  /**
   * This is triggered when the map has successfully loaded a new map style.
   */
  onDidFinishLoadingMap?: () => void;

  /**
   * This event is triggered when the map has failed to load a new map style. On v10 it's deprecated and replaced by onMapLoadingError
   * @deprecated use onMapLoadingError
   */
  onDidFailLoadingMap?: () => void;

  /**
   * This event is tiggered when there is an error during map load. V10 only, replaces onDidFailLoadingMap, might be called multiple times and not exclusive with onDidFinishLoadingMap.
   */
  onMapLoadingError?: () => void;

  /**
   * This event is triggered when the map will start rendering a frame.
   */
  onWillStartRenderingFrame?: () => void;

  /**
   * This event is triggered when the map finished rendering a frame.
   */
  onDidFinishRenderingFrame?: () => void;

  /**
   * This event is triggered when the map fully finished rendering a frame.
   */
  onDidFinishRenderingFrameFully?: () => void;

  /**
   * This event is triggered when the map will start rendering the map.
   */
  onWillStartRenderingMap?: () => void;

  /**
   * This event is triggered when the map finished rendering the map.
   */
  onDidFinishRenderingMap?: () => void;

  /**
   * This event is triggered when the map fully finished rendering the map.
   */
  onDidFinishRenderingMapFully?: () => void;

  /**
   * This event is triggered when the user location is updated.
   */
  onUserLocationUpdate?: (feature: Location) => void;

  /**
   * This event is triggered when a style has finished loading.
   */
  onDidFinishLoadingStyle?: () => void;

  /**
   * The emitted frequency of regionwillchange events
   */
  regionWillChangeDebounceTime?: number;

  /**
   * The emitted frequency of regiondidchange events
   */
  regionDidChangeDebounceTime?: number;

  /**
   * Set to true to deselect any selected annotation when the map is tapped. If set to true you will not receive
   * the onPress event for the taps that deselect the annotation. Default is false.
   */
  deselectAnnotationOnTap?: boolean;

  /**
   * @private Experimental support for custom MapView instances
   */
  mapViewImpl?: string;

  /**
   * @private Experimental support for custom MapView instances
   */
  _nativeImpl?: NativeMapViewActual;
};

type CallbablePropKeys =
  | 'onRegionWillChange'
  | 'onRegionIsChanging'
  | 'onRegionDidChange'
  | 'onUserLocationUpdate'
  | 'onWillStartLoadingMap'
  | 'onMapLoadingError'
  | 'onDidFinishLoadingMap'
  | 'onDidFailLoadingMap'
  | 'onWillStartRenderingFrame'
  | 'onDidFinishRenderingFrame'
  | 'onDidFinishRenderingFrameFully'
  | 'onWillStartRenderingMap'
  | 'onDidFinishRenderingMap'
  | 'onDidFinishRenderingMapFully'
  | 'onDidFinishLoadingStyle'
  | 'onMapIdle'
  | 'onCameraChanged';

type CallbablePropKeysWithoutOn = CallbablePropKeys extends `on${infer C}`
  ? C
  : never;

type Debounced<F> = F & { clear(): void; flush(): void };

/**
 * MapView backed by Mapbox Native GL
 */
class MapView extends NativeBridgeComponent(
  React.PureComponent<Props>,
  NativeMapViewModule,
) {
  static defaultProps: Props = {
    scrollEnabled: true,
    pitchEnabled: true,
    rotateEnabled: true,
    attributionEnabled: true,
    compassEnabled: false,
    compassFadeWhenNorth: false,
    logoEnabled: true,
    scaleBarEnabled: true,
    surfaceView: RNMBXModule.MapboxV10 ? true : false,
    requestDisallowInterceptTouchEvent: false,
    regionWillChangeDebounceTime: 10,
    regionDidChangeDebounceTime: 500,
  };

  deprecationLogged: {
    contentInset: boolean;
    regionDidChange: boolean;
    regionIsChanging: boolean;
  } = {
    contentInset: false,
    regionDidChange: false,
    regionIsChanging: false,
  };
  logger: Logger;
  _onDebouncedRegionWillChange: Debounced<
    (
      payload: GeoJSON.Feature<
        GeoJSON.Point,
        RegionPayload & { isAnimatingFromUserInteraction: boolean }
      >,
    ) => void
  >;
  _onDebouncedRegionDidChange: Debounced<
    (
      payload: GeoJSON.Feature<
        GeoJSON.Point,
        RegionPayload & { isAnimatingFromUserInteraction: boolean }
      >,
    ) => void
  >;
  _nativeRef?: RNMBXMapViewRefType;
  state: {
    isReady: boolean | null;
    region: null;
    width: number;
    height: number;
    isUserInteraction: boolean;
  };

  constructor(props: Props) {
    super(props);

    this.logger = Logger.sharedInstance();
    this.logger.start();

    this.state = {
      isReady: null,
      region: null,
      width: 0,
      height: 0,
      isUserInteraction: false,
    };

    this._onPress = this._onPress.bind(this);
    this._onLongPress = this._onLongPress.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onLayout = this._onLayout.bind(this);
    this._onCameraChanged = this._onCameraChanged.bind(this);

    // debounced map change methods
    this._onDebouncedRegionWillChange = debounce(
      this._onRegionWillChange.bind(this),
      props.regionWillChangeDebounceTime,
      true,
    );

    this._onDebouncedRegionDidChange = debounce(
      this._onRegionDidChange.bind(this),
      props.regionDidChangeDebounceTime,
    );
  }

  componentDidMount() {
    this._setHandledMapChangedEvents(this.props);
  }

  componentWillUnmount() {
    this._onDebouncedRegionWillChange.clear();
    this._onDebouncedRegionDidChange.clear();
    this.logger.stop();
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    this._setHandledMapChangedEvents(nextProps);
  }

  _setHandledMapChangedEvents(props: Props) {
    if (isAndroid() || RNMBXModule.MapboxV10) {
      const events: string[] = [];

      function addIfHasHandler(name: CallbablePropKeysWithoutOn) {
        if (props[`on${name}`] != null) {
          if (EventTypes[name] == null) {
            if (name === 'DidFailLoadingMap') {
              console.warn(
                `rnmapbox maps: on${name} is deprecated, please use onMapLoadingError`,
              );
            } else {
              console.warn(`rnmapbox maps: ${name} is not supported`);
            }
          } else {
            events.push(EventTypes[name]);
            return true;
          }
        }
        return false;
      }

      addIfHasHandler('RegionWillChange');
      addIfHasHandler('RegionIsChanging');
      addIfHasHandler('RegionDidChange');
      addIfHasHandler('UserLocationUpdate');
      addIfHasHandler('WillStartLoadingMap');
      addIfHasHandler('DidFinishLoadingMap');
      addIfHasHandler('MapLoadingError');
      addIfHasHandler('DidFailLoadingMap');
      addIfHasHandler('WillStartRenderingFrame');
      addIfHasHandler('DidFinishRenderingFrame');
      addIfHasHandler('DidFinishRenderingFrameFully');
      addIfHasHandler('WillStartRenderingMap');
      addIfHasHandler('DidFinishRenderingMap');
      addIfHasHandler('DidFinishRenderingMapFully');
      addIfHasHandler('DidFinishLoadingStyle');

      addIfHasHandler('CameraChanged');
      addIfHasHandler('MapIdle');

      if (addIfHasHandler('RegionDidChange')) {
        if (!this.deprecationLogged.regionDidChange) {
          console.warn(
            'onRegionDidChange is deprecated and will be removed in next release - please use onMapIdle. https://github.com/rnmapbox/maps/wiki/Deprecated-RegionIsDidChange',
          );
          this.deprecationLogged.regionDidChange = true;
        }
        if (props.onMapIdle) {
          console.warn(
            'rnmapbox/maps: only one of MapView.onRegionDidChange or onMapIdle is supported',
          );
        }
      }
      if (addIfHasHandler('RegionIsChanging')) {
        if (!this.deprecationLogged.regionIsChanging) {
          console.warn(
            'onRegionIsChanging is deprecated and will be removed in next release - please use onCameraChanged. https://github.com/rnmapbox/maps/wiki/Deprecated-RegionIsDidChange',
          );
          this.deprecationLogged.regionIsChanging = true;
        }
        if (props.onCameraChanged) {
          console.warn(
            'rnmapbox/maps: only one of MapView.onRegionIsChanging or onCameraChanged is supported',
          );
        }
      }

      if (props.onRegionWillChange) {
        console.warn(
          'onRegionWillChange is deprecated and will be removed in v10 - please use onRegionIsChanging',
        );
      }

      this._runNativeMethod('setHandledMapChangedEvents', this._nativeRef, [
        events,
      ]);
    }
  }

  /**
   * Converts a geographic coordinate to a point in the given view’s coordinate system.
   *
   * @example
   * const pointInView = await this._map.getPointInView([-37.817070, 144.949901]);
   *
   * @param {Array<number>} coordinate - A point expressed in the map view's coordinate system.
   * @return {Array}
   */
  async getPointInView(coordinate: Position): Promise<Position> {
    const res = await this._runNative<{ pointInView: Position }>(
      'getPointInView',
      [coordinate],
    );
    return res.pointInView;
  }

  /**
   * Converts a point in the given view’s coordinate system to a geographic coordinate.
   *
   * @example
   * const coordinate = await this._map.getCoordinateFromView([100, 100]);
   *
   * @param {Array<number>} point - A point expressed in the given view’s coordinate system.
   * @return {Array}
   */
  async getCoordinateFromView(point: Position): Promise<Position> {
    const res = await this._runNative<{ coordinateFromView: Position }>(
      'getCoordinateFromView',
      [point],
    );
    return res.coordinateFromView;
  }

  /**
   * The coordinate bounds (ne, sw) visible in the user’s viewport.
   *
   * @example
   * const visibleBounds = await this._map.getVisibleBounds();
   *
   * @return {Array}
   */
  async getVisibleBounds(): Promise<[Position, Position]> {
    const res = await this._runNative<{ visibleBounds: [Position, Position] }>(
      'getVisibleBounds',
    );
    return res.visibleBounds;
  }

  /**
   * Returns an array of rendered map features that intersect with a given point.
   *
   * @example
   * this._map.queryRenderedFeaturesAtPoint([30, 40], ['==', 'type', 'Point'], ['id1', 'id2'])
   *
   * @param  {Array<Number>} coordinate - A point expressed in the map view’s coordinate system.
   * @param  {Array=} filter - A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array.
   * @param  {Array=} layerIDs - A array of layer id's to filter the features by
   * @return {FeatureCollection}
   */

  async queryRenderedFeaturesAtPoint(
    coordinate: Position,
    filter: FilterExpression | [] = [],
    layerIDs: string[] = [],
  ): Promise<GeoJSON.FeatureCollection | undefined> {
    if (!coordinate || coordinate.length < 2) {
      throw new Error('Must pass in valid coordinate[lng, lat]');
    }

    const res = await this._runNative<{ data: GeoJSON.FeatureCollection }>(
      'queryRenderedFeaturesAtPoint',
      [coordinate, getFilter(filter), layerIDs],
    );

    if (isAndroid()) {
      return JSON.parse(res.data as unknown as string);
    }

    return res.data as GeoJSON.FeatureCollection;
  }

  /**
   * Returns an array of rendered map features that intersect with the given rectangle,
   * restricted to the given style layers and filtered by the given predicate. In v10,
   * passing an empty array will query the entire visible bounds of the map.
   *
   * @example
   * this._map.queryRenderedFeaturesInRect([30, 40, 20, 10], ['==', 'type', 'Point'], ['id1', 'id2'])
   *
   * @param  {Array<Number>} bbox - A rectangle expressed in the map view’s coordinate system. For v10, this can be an empty array to query the visible map area.
   * @param  {Array=} filter - A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array.
   * @param  {Array=} layerIDs -  A array of layer id's to filter the features by
   * @return {FeatureCollection}
   */
  async queryRenderedFeaturesInRect(
    bbox: BBox | [],
    filter: FilterExpression | [] = [],
    layerIDs: string[] | null = null,
  ): Promise<GeoJSON.FeatureCollection | undefined> {
    if (
      bbox != null &&
      (bbox.length === 4 || (RNMBXModule.MapboxV10 && bbox.length === 0))
    ) {
      const res = await this._runNative<{ data: GeoJSON.FeatureCollection }>(
        'queryRenderedFeaturesInRect',
        [bbox, getFilter(filter), layerIDs],
      );

      if (isAndroid()) {
        return JSON.parse(res.data as unknown as string);
      }

      return res.data;
    } else {
      throw new Error(
        'Must pass in a valid bounding box: [top, right, bottom, left]. An empty array [] is also acceptable in v10.',
      );
    }
  }

  /**
   * Returns an array of GeoJSON Feature objects representing features within the specified vector tile or GeoJSON source that satisfy the query parameters.
   *
   * @example
   * this._map.querySourceFeatures('your-source-id', [], ['your-source-layer'])
   *
   * @param  {String} sourceId - Style source identifier used to query for source features.
   * @param  {Array=} filter - A filter to limit query results.
   * @param  {Array=} sourceLayerIDs - The name of the source layers to query. For vector tile sources, this parameter is required. For GeoJSON sources, it is ignored.
   * @return {FeatureCollection}
   */
  async querySourceFeatures(
    sourceId: string,
    filter: FilterExpression | [] = [],
    sourceLayerIDs: string[] = [],
  ): Promise<GeoJSON.FeatureCollection> {
    const args = [sourceId, getFilter(filter), sourceLayerIDs];
    const res = await this._runNative<{ data: GeoJSON.FeatureCollection }>(
      'querySourceFeatures',
      args,
    );

    if (isAndroid()) {
      return JSON.parse(res.data as unknown as string);
    }

    return res.data;
  }

  /**
   * Map camera will perform updates based on provided config. Deprecated use Camera#setCamera.
   * @deprecated use Camera#setCamera
   */
  setCamera() {
    console.warn(
      'MapView.setCamera is deprecated - please use Camera#setCamera',
    );
  }

  _runNative<ReturnType>(
    methodName: string,
    args: NativeArg[] = [],
  ): Promise<ReturnType> {
    return super._runNativeMethod<typeof RNMBXMapView, ReturnType>(
      methodName,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore TODO: fix types
      this._nativeRef as HostComponent<NativeProps> | undefined,
      args,
    );
  }

  /**
   * Takes snapshot of map with current tiles and returns a URI to the image
   * @param  {Boolean} writeToDisk If true will create a temp file, otherwise it is in base64
   * @return {String}
   */
  async takeSnap(writeToDisk = false): Promise<string> {
    const res = await this._runNative<{ uri: string }>('takeSnap', [
      writeToDisk,
    ]);
    return res.uri;
  }

  /**
   * Returns the current zoom of the map view.
   *
   * @example
   * const zoom = await this._map.getZoom();
   *
   * @return {Number}
   */

  async getZoom(): Promise<number> {
    const res = await this._runNative<{ zoom: number }>('getZoom');
    return res.zoom;
  }

  /**
   * Returns the map's geographical centerpoint
   *
   * @example
   * const center = await this._map.getCenter();
   *
   * @return {Array<Number>} Coordinates
   */
  async getCenter(): Promise<Position> {
    const res = await this._runNative<{ center: Position }>('getCenter');
    return res.center;
  }

  /**
   *
   * Clears temporary map data from the data path defined in the given resource
   * options. Useful to reduce the disk usage or in case the disk cache contains
   * invalid data.
   *
   * v10 only
   */
  async clearData(): Promise<void> {
    if (!RNMBXModule.MapboxV10) {
      console.warn(
        'RNMapbox: clearData is only implemented in v10 implementation or later',
      );
      return;
    }
    await this._runNative<void>('clearData');
  }

  /**
   * Queries the currently loaded data for elevation at a geographical location.
   * The elevation is returned in meters relative to mean sea-level.
   * Returns null if terrain is disabled or if terrain data for the location hasn't been loaded yet.
   *
   * @param {Array<Number>} coordinate - the coordinates to query elevation at
   * @return {Number}
   */
  async queryTerrainElevation(coordinate: Position): Promise<number> {
    const res = await this._runNative<{ data: number }>(
      'queryTerrainElevation',
      [coordinate],
    );
    return res.data;
  }

  /**
   * Sets the visibility of all the layers referencing the specified `sourceLayerId` and/or `sourceId`
   *
   * @example
   * await this._map.setSourceVisibility(false, 'composite', 'building')
   *
   * @param {boolean} visible - Visibility of the layers
   * @param {String} sourceId - Identifier of the target source (e.g. 'composite')
   * @param {String=} sourceLayerId - Identifier of the target source-layer (e.g. 'building')
   */
  setSourceVisibility(
    visible: boolean,
    sourceId: string,
    sourceLayerId: string | null = null,
  ) {
    this._runNative<void>('setSourceVisibility', [
      visible,
      sourceId,
      sourceLayerId,
    ]);
  }

  _decodePayload<T>(payload: T | string): T {
    if (typeof payload === 'string') {
      return JSON.parse(payload);
    } else {
      return payload;
    }
  }

  _onPress(e: NativeSyntheticEvent<{ payload: GeoJSON.Feature | string }>) {
    if (isFunction(this.props.onPress)) {
      this.props.onPress(this._decodePayload(e.nativeEvent.payload));
    }
  }

  _onLongPress(e: NativeSyntheticEvent<{ payload: GeoJSON.Feature | string }>) {
    if (isFunction(this.props.onLongPress)) {
      this.props.onLongPress(this._decodePayload(e.nativeEvent.payload));
    }
  }

  _onRegionWillChange(
    payload: GeoJSON.Feature<
      GeoJSON.Point,
      RegionPayload & { isAnimatingFromUserInteraction: boolean }
    >,
  ) {
    if (isFunction(this.props.onRegionWillChange)) {
      this.props.onRegionWillChange(payload);
    }
    this.setState({
      isUserInteraction: payload.properties.isUserInteraction,
      isAnimatingFromUserInteraction:
        payload.properties.isAnimatingFromUserInteraction,
    });
  }

  _onRegionDidChange(payload: GeoJSON.Feature<GeoJSON.Point, RegionPayload>) {
    if (isFunction(this.props.onRegionDidChange)) {
      this.props.onRegionDidChange(payload);
    }
    this.setState({ region: payload });
  }

  _onCameraChanged(e: NativeSyntheticEvent<{ payload: MapState | string }>) {
    this.props.onCameraChanged?.(this._decodePayload(e.nativeEvent.payload));
  }

  _onChange(
    e: NativeSyntheticEvent<{
      type: string;
      payload:
        | GeoJSON.Feature<
            GeoJSON.Point,
            RegionPayload & { isAnimatingFromUserInteraction: boolean }
          >
        | string;
    }>,
  ) {
    const { regionWillChangeDebounceTime, regionDidChangeDebounceTime } =
      this.props;
    const { type } = e.nativeEvent;
    const payload = this._decodePayload(e.nativeEvent.payload);

    let propName: CallbablePropKeys | '' = '';
    let deprecatedPropName: CallbablePropKeys | '' = '';

    switch (type) {
      case EventTypes.RegionWillChange:
        if (regionWillChangeDebounceTime && regionWillChangeDebounceTime > 0) {
          this._onDebouncedRegionWillChange(payload);
        } else {
          propName = 'onRegionWillChange';
        }
        break;
      case EventTypes.RegionIsChanging:
        propName = 'onRegionIsChanging';
        break;
      case EventTypes.RegionDidChange:
        if (regionDidChangeDebounceTime && regionDidChangeDebounceTime > 0) {
          this._onDebouncedRegionDidChange(payload);
        } else {
          propName = 'onRegionDidChange';
        }
        break;
      case EventTypes.CameraChanged:
        propName = 'onCameraChanged';
        break;
      case EventTypes.MapIdle:
        propName = 'onMapIdle';
        break;
      case EventTypes.UserLocationUpdated:
        propName = 'onUserLocationUpdate';
        break;
      case EventTypes.WillStartLoadingMap:
        propName = 'onWillStartLoadingMap';
        break;
      case EventTypes.DidFinishLoadingMap:
        propName = 'onDidFinishLoadingMap';
        break;
      case EventTypes.DidFailLoadingMap:
        propName = 'onDidFailLoadingMap';
        break;
      case EventTypes.MapLoadingError:
        propName = 'onMapLoadingError';
        deprecatedPropName = 'onDidFailLoadingMap';
        break;
      case EventTypes.WillStartRenderingFrame:
        propName = 'onWillStartRenderingFrame';
        break;
      case EventTypes.DidFinishRenderingFrame:
        propName = 'onDidFinishRenderingFrame';
        break;
      case EventTypes.DidFinishRenderingFrameFully:
        propName = 'onDidFinishRenderingFrameFully';
        break;
      case EventTypes.WillStartRenderingMap:
        propName = 'onWillStartRenderingMap';
        break;
      case EventTypes.DidFinishRenderingMap:
        propName = 'onDidFinishRenderingMap';
        break;
      case EventTypes.DidFinishRenderingMapFully:
        propName = 'onDidFinishRenderingMapFully';
        break;
      case EventTypes.DidFinishLoadingStyle:
        propName = 'onDidFinishLoadingStyle';
        break;
      default:
        console.warn('Unhandled event callback type', type);
    }

    if (propName !== '') {
      this._handleOnChange(propName, payload);
    }
    if (deprecatedPropName !== '') {
      this._handleOnChange(deprecatedPropName, payload);
    }
  }

  _onLayout(e: LayoutChangeEvent) {
    this.setState({
      isReady: true,
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }

  _handleOnChange<T>(propName: CallbablePropKeys, payload: object) {
    const func = this.props[propName] as (payload: object) => void;
    if (func && isFunction(func)) {
      func(payload);
    }
  }

  _getContentInset() {
    if (!this.props.contentInset) {
      return;
    }

    if (RNMBXModule.MapboxV10) {
      if (!this.deprecationLogged.contentInset) {
        console.warn(
          '@rnmapbox/maps: contentInset is deprecated, use Camera padding instead.',
        );
        this.deprecationLogged.contentInset = true;
      }
    }

    if (!Array.isArray(this.props.contentInset)) {
      return [this.props.contentInset];
    }

    return this.props.contentInset;
  }

  _setNativeRef(nativeRef: RNMBXMapViewRefType | null) {
    if (nativeRef != null) {
      this._nativeRef = nativeRef;
      super._runPendingNativeMethods(nativeRef);
    }
  }

  setNativeProps(props: NativeProps) {
    if (this._nativeRef) {
      this._nativeRef.setNativeProps(props);
    }
  }

  _setStyleURL(props: Props) {
    // user set a styleURL, no need to alter props
    if (props.styleURL) {
      return;
    }

    // user set styleJSON pass it to styleURL
    if (props.styleJSON && !props.styleURL) {
      props.styleURL = props.styleJSON;
    }

    // user neither set styleJSON nor styleURL
    // set defaultStyleUrl
    if (!props.styleJSON || !props.styleURL) {
      props.styleURL = defaultStyleURL;
    }
  }

  _setLocalizeLabels(props: Props) {
    if (!RNMBXModule.MapboxV10) {
      return;
    }
    if (typeof props.localizeLabels === 'boolean') {
      props.localizeLabels = {
        locale: 'current',
      };
    }
  }

  render() {
    const props = {
      ...this.props,
      contentInset: this._getContentInset(),
      style: styles.matchParent,
    };

    this._setStyleURL(props);
    this._setLocalizeLabels(props);

    const callbacks = {
      ref: (nativeRef: RNMBXMapViewRefType | null) =>
        this._setNativeRef(nativeRef),
      onPress: this._onPress,
      onLongPress: this._onLongPress,
      onMapChange: this._onChange,
      onCameraChanged: this._onCameraChanged,
    };

    let mapView = null;
    if (this.state.isReady) {
      if (props._nativeImpl) {
        mapView = <props._nativeImpl {...props} {...callbacks} />;
      } else {
        mapView = (
          <RNMBXMapView {...props} {...callbacks}>
            {this.props.children}
          </RNMBXMapView>
        );
      }
    }

    return (
      <View
        onLayout={this._onLayout}
        style={this.props.style}
        testID={mapView ? undefined : this.props.testID}
      >
        {mapView}
      </View>
    );
  }
}

type NativeProps = Omit<
  Props,
  'onPress' | 'onLongPress' | 'onCameraChanged'
> & {
  onPress?: (
    event: NativeSyntheticEvent<{ type: string; payload: string }>,
  ) => void;
  onLongPress?: (
    event: NativeSyntheticEvent<{ type: string; payload: string }>,
  ) => void;
  onCameraChanged?: (
    event: NativeSyntheticEvent<{ type: string; payload: string }>,
  ) => void;
};

type RNMBXMapViewRefType = Component<NativeProps> & Readonly<NativeMethods>;

const RNMBXMapView = NativeMapView as NativeMapViewActual;

export default MapView;
