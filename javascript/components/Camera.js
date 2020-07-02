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
   * Heading on map
   */
  heading: PropTypes.number,

  /**
   * Pitch on map
   */
  pitch: PropTypes.number,

  /**
   * Represents a rectangle in geographical coordinates marking the visible area of the map.
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
     * Left camera padding for bounds
     */
    paddingLeft: PropTypes.number,

    /**
     * Right camera padding for bounds
     */
    paddingRight: PropTypes.number,

    /**
     * Top camera padding for bounds
     */
    paddingTop: PropTypes.number,

    /**
     * Bottom camera padding for bounds
     */
    paddingBottom: PropTypes.number,
  }),

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
     * The animationstyle when the camara updates. One of; `flyTo`, `easeTo`, `moveTo`
     */
    animationMode: PropTypes.oneOf(['flyTo', 'easeTo', 'moveTo']),

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

    // manual update
    triggerKey: PropTypes.any,

    // position
    alignment: PropTypes.arrayOf(PropTypes.number),

    // Triggered when the
    onUserTrackingModeChange: PropTypes.func,
  };

  static defaultProps = {
    animationMode: 'easeTo',
    animationDuration: 2000,
    isUserInteraction: false,
  };

  static Mode = {
    Flight: 'flyTo',
    Move: 'moveTo',
    Ease: 'easeTo',
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this._handleCameraChange(this.props, nextProps);
  }

  shouldComponentUpdate() {
    return false;
  }

  _handleCameraChange(currentCamera, nextCamera) {
    const hasCameraChanged = this._hasCameraChanged(currentCamera, nextCamera);
    if (!hasCameraChanged) {
      return;
    }

    if (currentCamera.followUserLocation && !nextCamera.followUserLocation) {
      this.refs.camera.setNativeProps({followUserLocation: false});
      return;
    }
    if (!currentCamera.followUserLocation && nextCamera.followUserLocation) {
      this.refs.camera.setNativeProps({followUserLocation: true});
    }

    if (nextCamera.followUserLocation) {
      this.refs.camera.setNativeProps({
        followUserMode: nextCamera.followUserMode,
        followPitch: nextCamera.followPitch || nextCamera.pitch,
        followHeading: nextCamera.followHeading || nextCamera.heading,
        followZoomLevel: nextCamera.followZoomLevel || nextCamera.zoomLevel,
      });
      return;
    }

    const cameraConfig = {
      animationMode: nextCamera.animationMode,
      animationDuration: nextCamera.animationDuration,
      zoomLevel: nextCamera.zoomLevel,
      pitch: nextCamera.pitch,
      heading: nextCamera.heading,
    };

    if (
      nextCamera.bounds &&
      this._hasBoundsChanged(currentCamera, nextCamera)
    ) {
      cameraConfig.bounds = nextCamera.bounds;
    } else {
      cameraConfig.centerCoordinate = nextCamera.centerCoordinate;
    }

    this._setCamera(cameraConfig);
  }

  _hasCameraChanged(currentCamera, nextCamera) {
    const c = currentCamera;
    const n = nextCamera;

    const hasDefaultPropsChanged =
      c.heading !== n.heading ||
      this._hasCenterCoordinateChanged(c, n) ||
      this._hasBoundsChanged(c, n) ||
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

    return (
      hasDefaultPropsChanged ||
      hasFollowPropsChanged ||
      hasAnimationPropsChanged
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

  _hasBoundsChanged(currentCamera, nextCamera) {
    const cB = currentCamera.bounds;
    const nB = nextCamera.bounds;

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
        ...pad,
      },
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
      const {
        ne,
        sw,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
      } = config.bounds;
      stopConfig.bounds = toJSONString(geoUtils.makeLatLngBounds(ne, sw));
      stopConfig.boundsPaddingTop = paddingTop || 0;
      stopConfig.boundsPaddingRight = paddingRight || 0;
      stopConfig.boundsPaddingBottom = paddingBottom || 0;
      stopConfig.boundsPaddingLeft = paddingLeft || 0;
    }

    return stopConfig;
  }

  _getNativeCameraMode(config) {
    switch (config.animationMode) {
      case Camera.Mode.Flight:
        return MapboxGL.CameraModes.Flight;
      case Camera.Mode.Move:
        return MapboxGL.CameraModes.None;
      default:
        return MapboxGL.CameraModes.Ease;
    }
  }

  _getAlignment(coordinate, zoomLevel) {
    const region = geoUtils.getOrCalculateVisibleRegion(
      coordinate,
      zoomLevel,
      this.props._mapWidth,
      this.props._mapHeight,
      this.props._region,
    );

    const topLeftCorner = [region.sw[0], region.ne[1]];
    const topRightCorner = [region.ne[0], region.ne[1]];
    const bottomLeftCorner = [region.sw[0], region.sw[1]];

    const verticalLineString = geoUtils.makeLineString([
      topLeftCorner,
      bottomLeftCorner,
    ]);

    const horizontalLineString = geoUtils.makeLineString([
      topLeftCorner,
      topRightCorner,
    ]);

    const distVertical = geoUtils.calculateDistance(
      topLeftCorner,
      bottomLeftCorner,
    );
    const distHorizontal = geoUtils.calculateDistance(
      topLeftCorner,
      topRightCorner,
    );

    const verticalPoint = geoUtils.pointAlongLine(
      verticalLineString,
      distVertical * this.props.alignment[0],
    );

    const horizontalPoint = geoUtils.pointAlongLine(
      horizontalLineString,
      distHorizontal * this.props.alignment[1],
    );

    return [verticalPoint[0], horizontalPoint[1]];
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
