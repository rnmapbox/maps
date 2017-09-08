import React from 'react';
import PropTypes from 'prop-types';
import { NativeModules, requireNativeComponent } from 'react-native';
import { makePoint, makeLatLngBounds } from '../utils/geoUtils';

import {
  isFunction,
  isNumber,
  runNativeCommand,
  toJSONString,
} from '../utils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLMapView';

const RCTMGLMapView = requireNativeComponent(NATIVE_MODULE_NAME, MapView, {
  nativeOnly: { onMapChange: true },
});

/**
 * MapView backed by Mapbox Native GL
 */
class MapView extends React.Component {
  static propTypes = {
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
     * Enable/Disable scroll on the map
     */
    scrollEnabled: PropTypes.bool,

    /**
     * Enable/Disable pitch on map
     */
    pitchEnabled: PropTypes.bool,

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
    * This event is triggered when a fly to animation is cancelled or completed after calling flyTo
    */
    onFlyToComplete: PropTypes.func,

    /**
     * This event is triggered once the camera is finished after calling setCamera
     */
    onSetCameraComplete: PropTypes.func,
  };

  static defaultProps = {
    animated: false,
    heading: 0,
    pitch: 0,
    scrollEnabled: true,
    pitchEnabled: true,
    zoomLevel: 16,
    userTrackingMode: MapboxGL.UserTrackingModes.None,
    styleURL: MapboxGL.StyleURL.Street,
  };

  constructor (props) {
    super(props);

    this._onPress = this._onPress.bind(this);
    this._onLongPress = this._onLongPress.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  /**
   * Map camera transitions to fit provided bounds
   *
   * @example
   * this.map.fitBounds([lng, lat], [lng, lat])
   * this.map.fitBounds([lng, lat], [lng, lat], 20, 1000)
   *
   * @param {Array<Number>} northEastCoordinates - North east coordinate of bound
   * @param {Array<Number>} southWestCoordinates - South west coordinate of bound
   * @param {Number=} padding - Camera padding for bound
   * @param {Number=} duration - Duration of camera animation
   * @return {void}
   */
  fitBounds (northEastCoordinates, southWestCoordinates, padding = 0, duration = 2000) {
    if (!this._nativeRef) {
      return;
    }
    this.setCamera({
      bounds: {
        ne: northEastCoordinates,
        sw: southWestCoordinates,
        padding: padding,
      },
      duration: duration,
      mode: MapboxGL.CameraModes.Flight,
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
  flyTo (coordinates, duration = 2000) {
    if (!this._nativeRef) {
      return;
    }
    this.setCamera({
      centerCoordinate: coordinates,
      duration: duration,
      mode: MapboxGL.CameraModes.Flight,
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
  zoomTo (zoomLevel, duration = 2000) {
    if (!this._nativeRef) {
      return;
    }
    this.setCamera({
      zoom: zoomLevel,
      duration: duration,
      mode: MapboxGL.CameraModes.Flight,
    });
  }

  /**
   * Map camera will perform updates based on provided config. Advanced use only!
   *
   * @example
   * this.map.setCamera({
   *   centerCoordinate: [lng, lat],
   *   zoomLevel: 16,
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
  setCamera (config = {}) {
    if (!this._nativeRef) {
      return;
    }

    let cameraConfig = {};

    if (config.stops) {
      cameraConfig.stops = [];

      for (let stop of config.stops) {
        cameraConfig.stops.push(this._createStopConfig(stop));
      }
    } else {
      cameraConfig = this._createStopConfig(config);
    }

    runNativeCommand(NATIVE_MODULE_NAME, 'setCamera', this._nativeRef, [cameraConfig]);
  }

  _createStopConfig (config = {}) {
    let stopConfig = {
      mode: isNumber(config.mode) ? config.mode : MapboxGL.CameraModes.Ease,
      pitch: config.pitch,
      heading: config.heading,
      duration: config.duration || 2000,
      zoom: config.zoom,
    };

    if (config.centerCoordinate) {
      stopConfig.centerCoordinate = toJSONString(makePoint(config.centerCoordinate));
    }

    if (config.bounds && config.bounds.ne && config.bounds.sw) {
      const { ne, sw, padding } = config.bounds;
      stopConfig.bounds = toJSONString(makeLatLngBounds(ne, sw));
      stopConfig.boundsPadding = padding;
    }

    return stopConfig;
  }

  _onPress (e) {
    if (isFunction(this.props.onPress)) {
      this.props.onPress(e.nativeEvent.payload);
    }
  }

  _onLongPress (e) {
    if (isFunction(this.props.onLongPress)) {
      this.props.onLongPress(e.nativeEvent.payload);
    }
  }

  _onChange (e) {
    const { type, payload } = e.nativeEvent;
    let propName = '';

    switch (type) {
      case MapboxGL.EventTypes.RegionWillChange:
        propName = 'onRegionWillChange';
        break;
      case MapboxGL.EventTypes.RegionIsChanging:
        propName = 'onRegionIsChanging';
        break;
      case MapboxGL.EventTypes.RegionDidChange:
        propName = 'onRegionDidChange';
        break;
      case MapboxGL.EventTypes.WillStartLoadinMap:
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
      case MapboxGL.EventTypes.SetCameraComplete:
        propName = 'onSetCameraComplete';
        break;
    }

    if (propName.length) {
      this._handleOnChange(propName, payload);
    }
  }

  _handleOnChange (propName, payload) {
    if (isFunction(this.props[propName])) {
      this.props[propName](payload);
    }
  }

  _getCenterCoordinate () {
    if (!this.props.centerCoordinate) {
      return;
    }
    return toJSONString((makePoint(this.props.centerCoordinate)));
  }

  render () {
    let props = {
      animated: this.props.animated,
      centerCoordinate: this._getCenterCoordinate(),
      showUserLocation: this.props.showUserLocation,
      userTrackingMode: this.props.userTrackingMode,
      heading: this.props.heading,
      pitch: this.props.pitch,
      style: this.props.style,
      styleURL: this.props.styleURL,
      zoomLevel: this.props.zoomLevel,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      scrollEnabled: this.props.scrollEnabled,
      pitchEnabled: this.props.pitchEnabled,
    };

    const callbacks = {
      ref: (nativeRef) => this._nativeRef = nativeRef,
      onPress: this._onPress,
      onLongPress: this._onLongPress,
      onMapChange: this._onChange,
    };

    return (
      <RCTMGLMapView {...props} {...callbacks}>
        {this.props.children}
      </RCTMGLMapView>
    );
  }
}

export default MapView;
