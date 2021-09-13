import React from 'react';
import PropTypes from 'prop-types';
import {NativeModules, requireNativeComponent} from 'react-native';

import {toJSONString, viewPropTypes, existenceChange} from '../utils';
import * as geoUtils from '../utils/geoUtils';

const MapboxGL = NativeModules.MGLModule;

export const NATIVE_MODULE_NAME = 'RCTMGLCamera';

const SettingsPropTypes = {
  /**
   * Center coordinate on map [lng, lat]
   */
  centerCoordinate: PropTypes.arrayOf(PropTypes.number),
  
  /**
   * Padding around edges of map in points
   */
  padding: PropTypes.shape({
    /**
     * Left padding in points
     */
    paddingLeft: PropTypes.number,

    /**
     * Right padding in points
     */
    paddingRight: PropTypes.number,

    /**
     * Top padding in points
     */
    paddingTop: PropTypes.number,

    /**
     * Bottom padding in points
     */
    paddingBottom: PropTypes.number,
  }),

  /**
   * Heading on map
   */
  heading: PropTypes.number,

  /**
   * Pitch on map
   */
  pitch: PropTypes.number,

  /**
   * Represents a rectangle in geographical coordinates marking the visible area of the map.
   * The `bounds.padding*` properties are deprecated; use root `padding` property instead.
   */
  bounds: PropTypes.shape({
    /**
     * North east coordinate of bound
     */
    ne: PropTypes.arrayOf(PropTypes.number).isRequired,

    /**
     * South west coordinate of bound
     */
    sw: PropTypes.arrayOf(PropTypes.number).isRequired,

    /**
     * Left padding in points (deprecated; use root `padding` property instead)
     */
    paddingLeft: PropTypes.number,

    /**
    * Right padding in points (deprecated; use root `padding` property instead)
    */
    paddingRight: PropTypes.number,

    /**
    * Top padding in points (deprecated; use root `padding` property instead)
    */
    paddingTop: PropTypes.number,

    /**
    * Bottom padding in points (deprecated; use root `padding` property instead)
    */
    paddingBottom: PropTypes.number,
  }),

  /**
   * Callback that is triggered on user tracking mode changes
   */
  onUserTrackingModeChange: PropTypes.func,

  /**
   * Zoom level of the map
   */
  zoomLevel: PropTypes.number,
};

class Camera extends React.Component {
  static propTypes = {
    ...viewPropTypes,

    /**
     * The duration a camera update takes (in ms)
     */
    animationDuration: PropTypes.number,

    /**
     * The animationstyle when the camara updates. One of: `flyTo`, `easeTo`, `linearTo`, `moveTo`
     */
    animationMode: PropTypes.oneOf(['flyTo', 'easeTo', 'linearTo', 'moveTo']),

    /**
     * Default view settings applied on camera
     */
    defaultSettings: PropTypes.shape(SettingsPropTypes),

    // normal - view settings
    ...SettingsPropTypes,

    /**
     * The minimun zoom level of the map
     */
    minZoomLevel: PropTypes.number,

    /**
     * The maximun zoom level of the map
     */
    maxZoomLevel: PropTypes.number,

    /**
     * Restrict map panning so that the center is within these bounds
     */
    maxBounds: PropTypes.shape({
      /**
       * northEastCoordinates - North east coordinate of bound
       */
      ne: PropTypes.arrayOf(PropTypes.number).isRequired,

      /**
       * southWestCoordinates - South west coordinate of bound
       */
      sw: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),

    /**
     * Should the map orientation follow the user's.
     */
    followUserLocation: PropTypes.bool,

    /**
     * The mode used to track the user location on the map. One of; "normal", "compass", "course". Each mode string is also available as a member on the `MapboxGL.UserTrackingModes` object. `Follow` (normal), `FollowWithHeading` (compass), `FollowWithCourse` (course). NOTE: `followUserLocation` must be set to `true` for any of the modes to take effect. [Example](../example/src/examples/SetUserTrackingModes.js)
     */
    followUserMode: PropTypes.oneOf(['normal', 'compass', 'course']),

    /**
     * The zoomLevel on map while followUserLocation is set to `true`
     */
    followZoomLevel: PropTypes.number,

    /**
     * The pitch on map while followUserLocation is set to `true`
     */
    followPitch: PropTypes.number,

    /**
     * The heading on map while followUserLocation is set to `true`
     */
    followHeading: PropTypes.number,

    /**
     * Manually update the camera - helpful for when props did not update, however you still want the camera to move
     */
    triggerKey: PropTypes.any,

    // Triggered when the
    onUserTrackingModeChange: PropTypes.func,
  };

  static defaultProps = {
    animationMode: 'easeTo',
    animationDuration: 2000,
  };

  static Mode = {
    Flight: 'flyTo',
    Move: 'moveTo',
    Ease: 'easeTo',
    Linear: 'linearTo',
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this._handleCameraChange(this.props, nextProps);
  }

  shouldComponentUpdate() {
    return false;
  }

  _handleCameraChange(currentCamera, nextCamera) {
    const c = currentCamera;
    const n = nextCamera;

    const hasCameraChanged = this._hasCameraChanged(c, n);
    if (!hasCameraChanged) {
      return;
    }

    if (c.followUserLocation && !n.followUserLocation) {
      this.refs.camera.setNativeProps({followUserLocation: false});
      return;
    }
    if (!c.followUserLocation && n.followUserLocation) {
      this.refs.camera.setNativeProps({followUserLocation: true});
    }

    if (n.followUserLocation) {
      this.refs.camera.setNativeProps({
        followUserMode: n.followUserMode,
        followPitch: n.followPitch || n.pitch,
        followHeading: n.followHeading || n.heading,
        followZoomLevel: n.followZoomLevel || n.zoomLevel,
      });
      return;
    }

    if (n.maxBounds) {
      this.refs.camera.setNativeProps({
        maxBounds: this._getMaxBounds(),
      });
    }
    if (n.minZoomLevel) {
      this.refs.camera.setNativeProps({
        minZoomLevel: this.props.minZoomLevel,
      });
    }
    if (n.maxZoomLevel) {
      this.refs.camera.setNativeProps({
        maxZoomLevel: this.props.maxZoomLevel,
      });
    }

    const cameraConfig = {
      animationMode: n.animationMode,
      animationDuration: n.animationDuration,
      zoomLevel: n.zoomLevel,
      pitch: n.pitch,
      heading: n.heading,
      padding: n.padding,
    };

    const boundsChanged = this._hasBoundsChanged(c.bounds, n.bounds);
    const centerCoordinateChanged = this._hasCenterCoordinateChanged(c, n);
    const paddingChanged = this._hasPaddingChanged(c, n);
    
    let shouldUpdate = false;
    if (n.bounds && (boundsChanged || paddingChanged)) {
      cameraConfig.bounds = n.bounds;
      shouldUpdate = true;
    } else if (n.centerCoordinate && (centerCoordinateChanged || paddingChanged)) {
      cameraConfig.centerCoordinate = n.centerCoordinate;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      this._setCamera(cameraConfig);
    }
  }

  _hasCameraChanged(currentCamera, nextCamera) {
    const c = currentCamera;
    const n = nextCamera;

    const hasDefaultPropsChanged =
      c.heading !== n.heading ||
      this._hasCenterCoordinateChanged(c, n) ||
      this._hasBoundsChanged(c.bounds, n.bounds) ||
      this._hasPaddingChanged(c, n) ||
      c.pitch !== n.pitch ||
      c.zoomLevel !== n.zoomLevel ||
      c.triggerKey !== n.triggerKey;

    const hasFollowPropsChanged =
      c.followUserLocation !== n.followUserLocation ||
      c.followUserMode !== n.followUserMode ||
      c.followZoomLevel !== n.followZoomLevel ||
      c.followHeading !== n.followHeading ||
      c.followPitch !== n.followPitch;

    const hasAnimationPropsChanged =
      c.animationMode !== n.animationMode ||
      c.animationDuration !== n.animationDuration;
    
    const hasNavigationConstraintsPropsChanged =
      this._hasBoundsChanged(c.maxBounds, n.maxBounds) ||
      c.minZoomLevel !== n.minZoomLevel ||
      c.maxZoomLevel !== n.maxZoomLevel;

    return (
      hasDefaultPropsChanged ||
      hasFollowPropsChanged ||
      hasAnimationPropsChanged ||
      hasNavigationConstraintsPropsChanged
    );
  }

  _hasCenterCoordinateChanged(currentCamera, nextCamera) {
    const cC = currentCamera.centerCoordinate;
    const nC = nextCamera.centerCoordinate;

    if (existenceChange(cC, nC)) {
      return true;
    }

    if (!cC && !nC) {
      return false;
    }

    const isLngDiff =
      currentCamera.centerCoordinate[0] !== nextCamera.centerCoordinate[0];
    const isLatDiff =
      currentCamera.centerCoordinate[1] !== nextCamera.centerCoordinate[1];
    return isLngDiff || isLatDiff;
  }

  _hasBoundsChanged(cB, nB) {
    if (!cB && !nB) {
      return false;
    }
    if (existenceChange(cB, nB)) {
      return true;
    }
    return (
      cB.ne[0] !== nB.ne[0] ||
      cB.ne[1] !== nB.ne[1] ||
      cB.sw[0] !== nB.sw[0] ||
      cB.sw[1] !== nB.sw[1] ||
      cB.paddingTop !== nB.paddingTop ||
      cB.paddingLeft !== nB.paddingLeft ||
      cB.paddingRight !== nB.paddingRight ||
      cB.paddingBottom !== nB.paddingBottom
    );
  }

  _hasPaddingChanged(currentCamera, nextCamera) {
    const cP = currentCamera.padding;
    const nP = nextCamera.padding;

    if (!cP && !nP) {
      return false;
    }

    if (existenceChange(cP, nP)) {
      return true;
    }

    return (
      cP.paddingTop !== nP.paddingTop ||
      cP.paddingLeft !== nP.paddingLeft ||
      cP.paddingRight !== nP.paddingRight ||
      cP.paddingBottom !== nP.paddingBottom
    );
  }

  /**
   * Map camera transitions to fit provided bounds
   *
   * @example
   * this.camera.fitBounds([lng, lat], [lng, lat])
   * this.camera.fitBounds([lng, lat], [lng, lat], 20, 1000) // padding for all sides
   * this.camera.fitBounds([lng, lat], [lng, lat], [verticalPadding, horizontalPadding], 1000)
   * this.camera.fitBounds([lng, lat], [lng, lat], [top, right, bottom, left], 1000)
   *
   * @param {Array<Number>} northEastCoordinates - North east coordinate of bound
   * @param {Array<Number>} southWestCoordinates - South west coordinate of bound
   * @param {Number=} padding - Camera padding for bound
   * @param {Number=} animationDuration - Duration of camera animation
   * @return {void}
   */
  fitBounds(
    northEastCoordinates,
    southWestCoordinates,
    padding = 0,
    animationDuration = 0.0,
  ) {
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
      },
      padding: pad,
      animationDuration,
      animationMode: Camera.Mode.Ease,
    });
  }

  /**
   * Map camera will fly to new coordinate
   *
   * @example
   * this.camera.flyTo([lng, lat])
   * this.camera.flyTo([lng, lat], 12000)
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will jump too
   *  @param {Number=} animationDuration - Duration of camera animation
   *  @return {void}
   */
  flyTo(coordinates, animationDuration = 2000) {
    return this.setCamera({
      centerCoordinate: coordinates,
      animationDuration,
      animationMode: Camera.Mode.Flight,
    });
  }

  /**
   * Map camera will move to new coordinate at the same zoom level
   *
   * @example
   * this.camera.moveTo([lng, lat], 200) // eases camera to new location based on duration
   * this.camera.moveTo([lng, lat]) // snaps camera to new location without any easing
   *
   *  @param {Array<Number>} coordinates - Coordinates that map camera will move too
   *  @param {Number=} animationDuration - Duration of camera animation
   *  @return {void}
   */
  moveTo(coordinates, animationDuration = 0) {
    return this._setCamera({
      centerCoordinate: coordinates,
      animationDuration,
    });
  }

  /**
   * Map camera will zoom to specified level
   *
   * @example
   * this.camera.zoomTo(16)
   * this.camera.zoomTo(16, 100)
   *
   * @param {Number} zoomLevel - Zoom level that the map camera will animate too
   * @param {Number=} animationDuration - Duration of camera animation
   * @return {void}
   */
  zoomTo(zoomLevel, animationDuration = 2000) {
    return this._setCamera({
      zoomLevel,
      animationDuration,
      animationMode: Camera.Mode.Flight,
    });
  }

  /**
   * Map camera will perform updates based on provided config. Advanced use only!
   *
   * @example
   * this.camera.setCamera({
   *   centerCoordinate: [lng, lat],
   *   zoomLevel: 16,
   *   animationDuration: 2000,
   * })
   *
   * this.camera.setCamera({
   *   stops: [
   *     { pitch: 45, animationDuration: 200 },
   *     { heading: 180, animationDuration: 300 },
   *   ]
   * })
   *
   *  @param {Object} config - Camera configuration
   */
  setCamera(config = {}) {
    this._setCamera(config);
  }

  _setCamera(config = {}) {
    let cameraConfig = {};

    if (config.stops) {
      cameraConfig.stops = [];

      for (const stop of config.stops) {
        cameraConfig.stops.push(this._createStopConfig(stop));
      }
    } else {
      cameraConfig = this._createStopConfig(config);
    }

    this.refs.camera.setNativeProps({stop: cameraConfig});
  }

  _createDefaultCamera() {
    if (this.defaultCamera) {
      return this.defaultCamera;
    }
    if (!this.props.defaultSettings) {
      return null;
    }

    this.defaultCamera = this._createStopConfig(
      {
        ...this.props.defaultSettings,
        animationMode: Camera.Mode.Move,
      },
      true,
    );
    return this.defaultCamera;
  }

  _createStopConfig(config = {}, ignoreFollowUserLocation = false) {
    if (this.props.followUserLocation && !ignoreFollowUserLocation) {
      return null;
    }

    const stopConfig = {
      mode: this._getNativeCameraMode(config),
      pitch: config.pitch,
      heading: config.heading,
      duration: config.animationDuration || 0,
      zoom: config.zoomLevel,
    };

    if (config.centerCoordinate) {
      stopConfig.centerCoordinate = toJSONString(
        geoUtils.makePoint(config.centerCoordinate),
      );
    }

    if (config.bounds && config.bounds.ne && config.bounds.sw) {
      const { ne, sw } = config.bounds;
      stopConfig.bounds = toJSONString(geoUtils.makeLatLngBounds(ne, sw));
    }
    
    stopConfig.paddingTop = config.padding?.paddingTop || config.bounds?.paddingTop || 0;
    stopConfig.paddingRight = config.padding?.paddingRight || config.bounds?.paddingRight || 0;
    stopConfig.paddingBottom = config.padding?.paddingBottom || config.bounds?.paddingBottom || 0;
    stopConfig.paddingLeft = config.padding?.paddingLeft || config.bounds?.paddingLeft || 0;

    return stopConfig;
  }

  _getNativeCameraMode(config) {
    switch (config.animationMode) {
      case Camera.Mode.Flight:
        return MapboxGL.CameraModes.Flight;
      case Camera.Mode.Move:
        return MapboxGL.CameraModes.None;
      case Camera.Mode.Linear:
        return MapboxGL.CameraModes.Linear;
      default:
        return MapboxGL.CameraModes.Ease;
    }
  }

  _getMaxBounds() {
    const bounds = this.props.maxBounds;
    if (!bounds || !bounds.ne || !bounds.sw) {
      return null;
    }
    return toJSONString(geoUtils.makeLatLngBounds(bounds.ne, bounds.sw));
  }

  render() {
    const props = Object.assign({}, this.props);

    const callbacks = {
      onUserTrackingModeChange: props.onUserTrackingModeChange,
    };

    return (
      <RCTMGLCamera
        testID="Camera"
        ref="camera"
        followUserLocation={this.props.followUserLocation}
        followUserMode={this.props.followUserMode}
        followPitch={this.props.followPitch}
        followHeading={this.props.followHeading}
        followZoomLevel={this.props.followZoomLevel}
        stop={this._createStopConfig(props)}
        maxZoomLevel={this.props.maxZoomLevel}
        minZoomLevel={this.props.minZoomLevel}
        maxBounds={this._getMaxBounds()}
        defaultStop={this._createDefaultCamera()}
        {...callbacks}
      />
    );
  }
}

const RCTMGLCamera = requireNativeComponent(NATIVE_MODULE_NAME, Camera, {
  nativeOnly: {
    stop: true,
  },
});

Camera.UserTrackingModes = {
  Follow: 'normal',
  FollowWithHeading: 'compass',
  FollowWithCourse: 'course',
};

export default Camera;
