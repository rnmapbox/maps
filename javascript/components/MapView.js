import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  NativeModules,
  requireNativeComponent,
} from 'react-native';
import _ from 'underscore';

import {makePoint, makeLatLngBounds} from '../utils/geoUtils';
import {
  isFunction,
  isNumber,
  runNativeCommand,
  toJSONString,
  isAndroid,
  viewPropTypes,
} from '../utils';
import {getFilter} from '../utils/filterUtils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLMapView';

export const ANDROID_TEXTURE_NATIVE_MODULE_NAME = 'RCTMGLAndroidTextureMapView';

const styles = StyleSheet.create({
  matchParent: {flex: 1},
});

/**
 * MapView backed by Mapbox Native GL
 */
class MapView extends React.Component {
  static propTypes = {
    ...viewPropTypes,

    /**
     * Animates changes between pitch and bearing
     */
    animated: PropTypes.bool,

    /**
     * Initial center coordinate on map [lng, lat]
     */
    centerCoordinate: PropTypes.arrayOf(PropTypes.number),

    /**
     * Shows the users location on the map
     */
    showUserLocation: PropTypes.bool,

    /**
     * The mode used to track the user location on the map
     */
    userTrackingMode: PropTypes.number,

    /**
     * The vertical alignment of the user location within in map. This is only enabled while tracking the users location.
     */
    userLocationVerticalAlignment: PropTypes.number,

    /**
     * The distance from the edges of the map view’s frame to the edges of the map view’s logical viewport.
     */
    contentInset: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.number,
    ]),

    /**
     * Initial heading on map
     */
    heading: PropTypes.number,

    /**
     * Initial pitch on map
     */
    pitch: PropTypes.number,

    /**
     * Style for wrapping React Native View
     */
    style: PropTypes.any,

    /**
     * Style URL for map
     */
    styleURL: PropTypes.string,

    /**
     * Initial zoom level of map
     */
    zoomLevel: PropTypes.number,

    /**
     * Min zoom level of map
     */
    minZoomLevel: PropTypes.number,

    /**
     * Max zoom level of map
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Automatically change the language of the map labels to the system’s preferred language,
     * this is not something that can be toggled on/off
     */
    localizeLabels: PropTypes.bool,

    /**
     * Enable/Disable zoom on the map
     */
    zoomEnabled: PropTypes.bool,

    /**
     * Enable/Disable scroll on the map
     */
    scrollEnabled: PropTypes.bool,

    /**
     * Enable/Disable pitch on map
     */
    pitchEnabled: PropTypes.bool,

    /**
     * Enable/Disable rotation on map
     */
    rotateEnabled: PropTypes.bool,

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
    attributionEnabled: PropTypes.bool,

    /**
     * Enable/Disable the logo on the map.
     */
    logoEnabled: PropTypes.bool,

    /**
     * Enable/Disable the compass from appearing on the map
     */
    compassEnabled: PropTypes.bool,

    /**
     * [Android only] Enable/Disable use of GLSurfaceView insted of TextureView.
     */
    surfaceView: PropTypes.bool,

    /**
     * Map press listener, gets called when a user presses the map
     */
    onPress: PropTypes.func,

    /**
     * Map long press listener, gets called when a user long presses the map
     */
    onLongPress: PropTypes.func,

    /**
     * This event is triggered whenever the currently displayed map region is about to change.
     */
    onRegionWillChange: PropTypes.func,

    /**
     * This event is triggered whenever the currently displayed map region is changing.
     */
    onRegionIsChanging: PropTypes.func,

    /**
     * This event is triggered whenever the currently displayed map region finished changing
     */
    onRegionDidChange: PropTypes.func,

    /**
     * This event is triggered whenever the location engine receives a location update
     */
    onUserLocationUpdate: PropTypes.func,

    /**
     * This event is triggered when the map is about to start loading a new map style.
     */
    onWillStartLoadingMap: PropTypes.func,

    /**
     * This is triggered when the map has successfully loaded a new map style.
     */
    onDidFinishLoadingMap: PropTypes.func,

    /**
     * This event is triggered when the map has failed to load a new map style.
     */
    onDidFailLoadingMap: PropTypes.func,

    /**
     * This event is triggered when the map will start rendering a frame.
     */
    onWillStartRenderingFrame: PropTypes.func,

    /**
     * This event is triggered when the map finished rendering a frame.
     */
    onDidFinishRenderingFrame: PropTypes.func,

    /**
     * This event is triggered when the map fully finished rendering a frame.
     */
    onDidFinishRenderingFrameFully: PropTypes.func,

    /**
     * This event is triggered when the map will start rendering the map.
     */
    onWillStartRenderingMap: PropTypes.func,

    /**
     * This event is triggered when the map finished rendering the map.
     */
    onDidFinishRenderingMap: PropTypes.func,

    /**
     * This event is triggered when the map fully finished rendering the map.
     */
    onDidFinishRenderingMapFully: PropTypes.func,

    /**
     * This event is triggered when a style has finished loading.
     */
    onDidFinishLoadingStyle: PropTypes.func,

    /**
     * This event is triggered when the users tracking mode is changed.
     */
    onUserTrackingModeChange: PropTypes.func,

    /**
     * The emitted frequency of regionwillchange events
     */
    regionWillChangeDebounceTime: PropTypes.number,

    /**
     * The emitted frequency of regiondidchange events
     */
    regionDidChangeDebounceTime: PropTypes.number,
  };

  static defaultProps = {
    animated: false,
    heading: 0,
    pitch: 0,
    localizeLabels: false,
    scrollEnabled: true,
    pitchEnabled: true,
    rotateEnabled: true,
    attributionEnabled: true,
    logoEnabled: true,
    zoomLevel: 16,
    userTrackingMode: MapboxGL.UserTrackingModes.None,
    styleURL: MapboxGL.StyleURL.Street,
    surfaceView: false,
    regionWillChangeDebounceTime: 10,
    regionDidChangeDebounceTime: 500,
  };

  constructor(props) {
    super(props);

    this.state = {
      isReady: null,
    };

    this._onPress = this._onPress.bind(this);
    this._onLongPress = this._onLongPress.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onAndroidCallback = this._onAndroidCallback.bind(this);
    this._onLayout = this._onLayout.bind(this);

    // debounced map change methods
    this._onDebouncedRegionWillChange = _.debounce(
      this._onRegionWillChange.bind(this),
      props.regionWillChangeDebounceTime,
      true,
    );

    this._onDebouncedRegionDidChange = _.debounce(
      this._onRegionDidChange.bind(this),
      props.regionDidChangeDebounceTime,
    );

    this._callbackMap = new Map();
    this._preRefMapMethodQueue = [];
  }

  componentDidMount() {
    this.setHandledMapChangedEvents(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setHandledMapChangedEvents(nextProps);
  }

  setHandledMapChangedEvents(props) {
    if (isAndroid()) {
      const events = [];

      if (props.onRegionWillChange)
        events.push(MapboxGL.EventTypes.RegionWillChange);
      if (props.onRegionIsChanging)
        events.push(MapboxGL.EventTypes.RegionIsChanging);
      if (props.onRegionDidChange)
        events.push(MapboxGL.EventTypes.RegionDidChange);
      if (props.onUserLocationUpdate)
        events.push(MapboxGL.EventTypes.UserLocationUpdated);
      if (props.onWillStartLoadingMap)
        events.push(MapboxGL.EventTypes.WillStartLoadingMap);
      if (props.onDidFinishLoadingMap)
        events.push(MapboxGL.EventTypes.DidFinishLoadingMap);
      if (props.onDidFailLoadingMap)
        events.push(MapboxGL.EventTypes.DidFailLoadingMap);
      if (props.onWillStartRenderingFrame)
        events.push(MapboxGL.EventTypes.WillStartRenderingFrame);
      if (props.onDidFinishRenderingFrame)
        events.push(MapboxGL.EventTypes.DidFinishRenderingFrame);
      if (props.onDidFinishRenderingFrameFully)
        events.push(MapboxGL.EventTypes.DidFinishRenderingFrameFully);
      if (props.onWillStartRenderingMap)
        events.push(MapboxGL.EventTypes.WillStartRenderingMap);
      if (props.onDidFinishRenderingMap)
        events.push(MapboxGL.EventTypes.DidFinishRenderingMap);
      if (props.onDidFinishRenderingMapFully)
        events.push(MapboxGL.EventTypes.DidFinishRenderingMapFully);
      if (props.onDidFinishLoadingStyle)
        events.push(MapboxGL.EventTypes.DidFinishLoadingStyle);

      this._runNativeCommand('setHandledMapChangedEvents', events);
    }
  }

  /**
   * Converts a geographic coordinate to a point in the given view’s coordinate system.
   *
   * @example
   * const pointInView = await this._map.getPointInView([-37.817070, 144.949901]);
   *
   * @param {Array<Number>} coordinate - A point expressed in the map view's coordinate system.
   * @return {Array}
   */
  async getPointInView(coordinate) {
    const res = await this._runNativeCommand('getPointInView', [coordinate]);
    return res.pointInView;
  }

  /**
   * Converts a point in the given view’s coordinate system to a geographic coordinate.
   *
   * @example
   * const coordinate = await this._map.getCoordinateFromView([100, 100]);
   *
   * @param {Array<Number>} point - A point expressed in the given view’s coordinate system.
   * @return {Array}
   */
  async getCoordinateFromView(point) {
    const res = await this._runNativeCommand('getCoordinateFromView', [point]);
    return res.coordinateFromView;
  }

  /**
   * The coordinate bounds(ne, sw) visible in the users’s viewport.
   *
   * @example
   * const visibleBounds = await this._map.getVisibleBounds();
   *
   * @return {Array}
   */
  async getVisibleBounds() {
    const res = await this._runNativeCommand('getVisibleBounds');
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
  async queryRenderedFeaturesAtPoint(coordinate, filter = [], layerIDs = []) {
    if (!coordinate || coordinate.length < 2) {
      throw new Error('Must pass in valid coordinate[lng, lat]');
    }

    const res = await this._runNativeCommand('queryRenderedFeaturesAtPoint', [
      coordinate,
      getFilter(filter),
      layerIDs,
    ]);

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  /**
   * Returns an array of rendered map features that intersect with the given rectangle,
   * restricted to the given style layers and filtered by the given predicate.
   *
   * @example
   * this._map.queryRenderedFeaturesInRect([30, 40, 20, 10], ['==', 'type', 'Point'], ['id1', 'id2'])
   *
   * @param  {Array<Number>} bbox - A rectangle expressed in the map view’s coordinate system.
   * @param  {Array=} filter - A set of strings that correspond to the names of layers defined in the current style. Only the features contained in these layers are included in the returned array.
   * @param  {Array=} layerIDs -  A array of layer id's to filter the features by
   * @return {FeatureCollection}
   */
  async queryRenderedFeaturesInRect(bbox, filter = [], layerIDs = []) {
    if (!bbox || bbox.length !== 4) {
      throw new Error(
        'Must pass in a valid bounding box[top, right, bottom, left]',
      );
    }
    const res = await this._runNativeCommand('queryRenderedFeaturesInRect', [
      bbox,
      getFilter(filter),
      layerIDs,
    ]);

    if (isAndroid()) {
      return JSON.parse(res.data);
    }

    return res.data;
  }

  /**
   * Map camera transitions to fit provided bounds
   *
   * @example
   * this.map.fitBounds([lng, lat], [lng, lat])
   * this.map.fitBounds([lng, lat], [lng, lat], 20, 1000) // padding for all sides
   * this.map.fitBounds([lng, lat], [lng, lat], [verticalPadding, horizontalPadding], 1000)
   * this.map.fitBounds([lng, lat], [lng, lat], [top, right, bottom, left], 1000)
   *
   * @param {Array<Number>} northEastCoordinates - North east coordinate of bound
   * @param {Array<Number>} southWestCoordinates - South west coordinate of bound
   * @param {Number=} padding - Camera padding for bound
   * @param {Number=} duration - Duration of camera animation
   * @return {void}
   */
  fitBounds(
    northEastCoordinates,
    southWestCoordinates,
    padding = 0,
    duration = 0.0,
  ) {
    if (!this._nativeRef) {
      return;
    }

    const pad = {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };

    if (Array.isArray(padding)) {
      if (padding.length === 2) {
        pad.paddingTop = padding[0];
        pad.paddingBottom = padding[0];
        pad.paddingLeft = padding[1];
        pad.paddingRight = padding[1];
      } else if (padding.length === 4) {
        pad.paddingTop = padding[0];
        pad.paddingRight = padding[1];
        pad.paddingBottom = padding[2];
        pad.paddingLeft = padding[3];
      }
    } else {
      pad.paddingLeft = padding;
      pad.paddingRight = padding;
      pad.paddingTop = padding;
      pad.paddingBottom = padding;
    }

    return this.setCamera({
      bounds: {
        ne: northEastCoordinates,
        sw: southWestCoordinates,
        ...pad,
      },
      duration,
      mode: MapboxGL.CameraModes.None,
    });
  }

  /**
   * Map camera will fly to new coordinate
   *
   * @example
   * this.map.flyTo([lng, lat])
   * this.map.flyTo([lng, lat], 12000)
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will jump too
   *  @param {Number=} duration - Duration of camera animation
   *  @return {void}
   */
  flyTo(coordinates, duration = 2000) {
    if (!this._nativeRef) {
      return Promise.reject(new Error('No native reference found'));
    }
    return this.setCamera({
      centerCoordinate: coordinates,
      duration,
      mode: MapboxGL.CameraModes.Flight,
    });
  }

  /**
   * Map camera will move to new coordinate at the same zoom level
   *
   * @example
   * this.map.moveTo([lng, lat], 200) // eases camera to new location based on duration
   * this.map.moveTo([lng, lat]) // snaps camera to new location without any easing
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will move too
   *  @param {Number=} duration - Duration of camera animation
   *  @return {void}
   */
  moveTo(coordinates, duration = 0) {
    if (!this._nativeRef) {
      return Promise.reject(new Error('No native reference found'));
    }
    return this.setCamera({
      centerCoordinate: coordinates,
      duration,
    });
  }

  /**
   * Map camera will zoom to specified level
   *
   * @example
   * this.map.zoomTo(16)
   * this.map.zoomTo(16, 100)
   *
   * @param {Number} zoomLevel - Zoom level that the map camera will animate too
   * @param {Number=} duration - Duration of camera animation
   * @return {void}
   */
  zoomTo(zoomLevel, duration = 2000) {
    if (!this._nativeRef) {
      return Promise.reject(new Error('No native reference found'));
    }
    return this.setCamera({
      zoom: zoomLevel,
      duration,
      mode: MapboxGL.CameraModes.Flight,
    });
  }

  /**
   * Map camera will perform updates based on provided config. Advanced use only!
   *
   * @example
   * this.map.setCamera({
   *   centerCoordinate: [lng, lat],
   *   zoom: 16,
   *   duration: 2000,
   * })
   *
   * this.map.setCamera({
   *   stops: [
   *     { pitch: 45, duration: 200 },
   *     { heading: 180, duration: 300 },
   *   ]
   * })
   *
   *  @param {Object} config - Camera configuration
   */
  setCamera(config = {}) {
    if (!this._nativeRef) {
      return;
    }

    let cameraConfig = {};

    if (config.stops) {
      cameraConfig.stops = [];

      for (const stop of config.stops) {
        cameraConfig.stops.push(this._createStopConfig(stop));
      }
    } else {
      cameraConfig = this._createStopConfig(config);
    }

    return this._runNativeCommand('setCamera', [cameraConfig]);
  }

  /**
   * Takes snapshot of map with current tiles and returns a URI to the image
   * @param  {Boolean} writeToDisk If true will create a temp file, otherwise it is in base64
   * @return {String}
   */
  async takeSnap(writeToDisk = false) {
    const res = await this._runNativeCommand('takeSnap', [writeToDisk]);
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

  async getZoom() {
    const res = await this._runNativeCommand('getZoom');
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
  async getCenter() {
    const res = await this._runNativeCommand('getCenter');
    return res.center;
  }

  _runNativeCommand(methodName, args = []) {
    if (!this._nativeRef) {
      return new Promise(resolve => {
        this._preRefMapMethodQueue.push({
          method: {name: methodName, args},
          resolver: resolve,
        });
      });
    }

    if (isAndroid()) {
      return new Promise(resolve => {
        const callbackID = `${Date.now()}`;
        this._addAddAndroidCallback(callbackID, resolve);
        args.unshift(callbackID);
        runNativeCommand(NATIVE_MODULE_NAME, methodName, this._nativeRef, args);
      });
    }
    return runNativeCommand(
      NATIVE_MODULE_NAME,
      methodName,
      this._nativeRef,
      args,
    );
  }

  _createStopConfig(config = {}) {
    const stopConfig = {
      mode: isNumber(config.mode) ? config.mode : MapboxGL.CameraModes.Ease,
      pitch: config.pitch,
      heading: config.heading,
      duration: config.duration || 2000,
      zoom: config.zoom,
    };

    if (config.centerCoordinate) {
      stopConfig.centerCoordinate = toJSONString(
        makePoint(config.centerCoordinate),
      );
    }

    if (config.bounds && config.bounds.ne && config.bounds.sw) {
      const {
        ne,
        sw,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
      } = config.bounds;
      stopConfig.bounds = toJSONString(makeLatLngBounds(ne, sw));
      stopConfig.boundsPaddingTop = paddingTop || 0;
      stopConfig.boundsPaddingRight = paddingRight || 0;
      stopConfig.boundsPaddingBottom = paddingBottom || 0;
      stopConfig.boundsPaddingLeft = paddingLeft || 0;
    }

    return stopConfig;
  }

  _addAddAndroidCallback(id, callback) {
    this._callbackMap.set(id, callback);
  }

  _removeAndroidCallback(id) {
    this._callbackMap.remove(id);
  }

  _onAndroidCallback(e) {
    const callbackID = e.nativeEvent.type;
    const callback = this._callbackMap.get(callbackID);

    if (!callback) {
      return;
    }

    this._callbackMap.delete(callbackID);
    callback.call(null, e.nativeEvent.payload);
  }

  _onPress(e) {
    if (isFunction(this.props.onPress)) {
      this.props.onPress(e.nativeEvent.payload);
    }
  }

  _onLongPress(e) {
    if (isFunction(this.props.onLongPress)) {
      this.props.onLongPress(e.nativeEvent.payload);
    }
  }

  _onRegionWillChange(payload) {
    if (isFunction(this.props.onRegionWillChange)) {
      this.props.onRegionWillChange(payload);
    }
  }

  _onRegionDidChange(payload) {
    if (isFunction(this.props.onRegionDidChange)) {
      this.props.onRegionDidChange(payload);
    }
  }

  _onChange(e) {
    const {
      regionWillChangeDebounceTime,
      regionDidChangeDebounceTime,
    } = this.props;
    const {type, payload} = e.nativeEvent;
    let propName = '';

    switch (type) {
      case MapboxGL.EventTypes.RegionWillChange:
        if (regionWillChangeDebounceTime > 0) {
          this._onDebouncedRegionWillChange(payload);
        } else {
          propName = 'onRegionWillChange';
        }
        break;
      case MapboxGL.EventTypes.RegionIsChanging:
        propName = 'onRegionIsChanging';
        break;
      case MapboxGL.EventTypes.RegionDidChange:
        if (regionDidChangeDebounceTime > 0) {
          this._onDebouncedRegionDidChange(payload);
        } else {
          propName = 'onRegionDidChange';
        }
        break;
      case MapboxGL.EventTypes.UserLocationUpdated:
        propName = 'onUserLocationUpdate';
        break;
      case MapboxGL.EventTypes.WillStartLoadingMap:
        propName = 'onWillStartLoadingMap';
        break;
      case MapboxGL.EventTypes.DidFinishLoadingMap:
        propName = 'onDidFinishLoadingMap';
        break;
      case MapboxGL.EventTypes.DidFailLoadingMap:
        propName = 'onDidFailLoadingMap';
        break;
      case MapboxGL.EventTypes.WillStartRenderingFrame:
        propName = 'onWillStartRenderingFrame';
        break;
      case MapboxGL.EventTypes.DidFinishRenderingFrame:
        propName = 'onDidFinishRenderingFrame';
        break;
      case MapboxGL.EventTypes.DidFinishRenderingFrameFully:
        propName = 'onDidFinishRenderingFrameFully';
        break;
      case MapboxGL.EventTypes.WillStartRenderingMap:
        propName = 'onWillStartRenderingMap';
        break;
      case MapboxGL.EventTypes.DidFinishRenderingMap:
        propName = 'onDidFinishRenderingMap';
        break;
      case MapboxGL.EventTypes.DidFinishRenderingMapFully:
        propName = 'onDidFinishRenderingMapFully';
        break;
      case MapboxGL.EventTypes.DidFinishLoadingStyle:
        propName = 'onDidFinishLoadingStyle';
        break;
      default:
        console.warn('Unhandled event callback type', type);
    }

    if (propName.length) {
      this._handleOnChange(propName, payload);
    }
  }

  _onLayout() {
    this.setState({isReady: true});
  }

  _handleOnChange(propName, payload) {
    if (isFunction(this.props[propName])) {
      this.props[propName](payload);
    }
  }

  _getCenterCoordinate() {
    if (!this.props.centerCoordinate) {
      return;
    }
    return toJSONString(makePoint(this.props.centerCoordinate));
  }

  _getContentInset() {
    if (!this.props.contentInset) {
      return;
    }

    if (!Array.isArray(this.props.contentInset)) {
      return [this.props.contentInset];
    }

    return this.props.contentInset;
  }

  async _setNativeRef(nativeRef) {
    this._nativeRef = nativeRef;

    while (this._preRefMapMethodQueue.length > 0) {
      const item = this._preRefMapMethodQueue.pop();

      if (item && item.method && item.resolver) {
        const res = await this._runNativeCommand(
          item.method.name,
          item.method.args,
        );
        item.resolver(res);
      }
    }
  }

  render() {
    const props = {
      ...this.props,
      centerCoordinate: this._getCenterCoordinate(),
      contentInset: this._getContentInset(),
      style: styles.matchParent,
    };

    const callbacks = {
      ref: nativeRef => this._setNativeRef(nativeRef),
      onPress: this._onPress,
      onLongPress: this._onLongPress,
      onMapChange: this._onChange,
      onAndroidCallback: isAndroid() ? this._onAndroidCallback : undefined,
      onUserTrackingModeChange: this.props.onUserTrackingModeChange,
    };

    let mapView = null;
    if (isAndroid() && !this.props.surfaceView && this.state.isReady) {
      mapView = (
        <RCTMGLAndroidTextureMapView {...props} {...callbacks}>
          {this.props.children}
        </RCTMGLAndroidTextureMapView>
      );
    } else if (this.state.isReady) {
      mapView = (
        <RCTMGLMapView {...props} {...callbacks}>
          {this.props.children}
        </RCTMGLMapView>
      );
    }

    return (
      <View onLayout={this._onLayout} style={this.props.style}>
        {mapView}
      </View>
    );
  }
}

const RCTMGLMapView = requireNativeComponent(NATIVE_MODULE_NAME, MapView, {
  nativeOnly: {onMapChange: true, onAndroidCallback: true},
});

let RCTMGLAndroidTextureMapView;
if (isAndroid()) {
  RCTMGLAndroidTextureMapView = requireNativeComponent(
    ANDROID_TEXTURE_NATIVE_MODULE_NAME,
    MapView,
    {
      nativeOnly: {onMapChange: true, onAndroidCallback: true},
    },
  );
}

export default MapView;
