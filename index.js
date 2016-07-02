'use strict';

import React, { Component, PropTypes } from 'react';
import ReactNative, {
  View,
  NativeModules,
  NativeAppEventEmitter,
  requireNativeComponent,
  findNodeHandle,
  Platform
} from 'react-native';

import cloneDeep from 'lodash/cloneDeep';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';

const { MapboxGLManager } = NativeModules;
const { mapStyles, userTrackingMode, userLocationVerticalAlignment, unknownResourceCount } = MapboxGLManager;

// Monkeypatch Android commands

if (Platform.OS === 'android') {
  const RCTUIManager = NativeModules.UIManager;
  const commands = RCTUIManager.RCTMapboxGL.Commands;

  // Since we cannot pass functions to dispatchViewManagerCommand, we keep a
  // map of callbacks and send an int instead
  const callbackMap = new Map();
  let nextCallbackId = 0;

  Object.keys(commands).forEach(command => {
    MapboxGLManager[command] = (handle, ...rawArgs) => {
      const args = rawArgs.map(arg => {
        if (typeof arg === 'function') {
          callbackMap.set(nextCallbackId, arg);
          return nextCallbackId++;
        }
        return arg;
      });
      RCTUIManager.dispatchViewManagerCommand(handle, commands[command], args);
    };
  });

  NativeAppEventEmitter.addListener('MapboxAndroidCallback', ([ callbackId, args ]) => {
    const callback = callbackMap.get(callbackId);
    if (!callback) {
      throw new Error(`Native is calling a callbackId ${callbackId}, which is not registered`);
    }
    callbackMap.delete(callbackId);
    callback.apply(null, args);
  });
}

// Metrics

let _metricsEnabled = MapboxGLManager.metricsEnabled;

function setMetricsEnabled(enabled: boolean) {
  _metricsEnabled = enabled;
  MapboxGLManager.setMetricsEnabled(enabled);
}

function getMetricsEnabled() {
  return _metricsEnabled;
}

// Access token
function setAccessToken(token: string) {
  MapboxGLManager.setAccessToken(token);
}

// Offline
function bindCallbackToPromise(callback, promise) {
  if (callback) {
    promise.then(value => {
      callback(null, value);
    }).catch(err => {
      callback(err);
    })
  }
}

function addOfflinePack(options, callback) {
  const promise = MapboxGLManager.addOfflinePack(options);
  bindCallbackToPromise(callback, promise);
  return promise;
}

function getOfflinePacks(callback) {
  const promise = MapboxGLManager.getOfflinePacks();
  bindCallbackToPromise(callback, promise);
  return promise;
}

function removeOfflinePack(packName, callback) {
  const promise = MapboxGLManager.removeOfflinePack(packName);
  bindCallbackToPromise(callback, promise);
  return promise;
}

function addOfflinePackProgressListener(handler) {
  return NativeAppEventEmitter.addListener('MapboxOfflineProgressDidChange', handler);
}

function addOfflineMaxAllowedTilesListener(handler) {
  return NativeAppEventEmitter.addListener('MapboxOfflineMaxAllowedTiles', handler);
}

function addOfflineErrorListener(handler) {
  return NativeAppEventEmitter.addListener('MapboxOfflineError', handler);
}

class MapView extends Component {

  // Viewport setters
  setDirection(direction, animated = true, callback) {
    return this.easeTo({ direction }, animated, callback);
  }
  setZoomLevel(zoomLevel, animated = true, callback) {
    return this.easeTo({ zoomLevel }, animated, callback);
  }
  setCenterCoordinate(latitude, longitude, animated = true, callback) {
    return this.easeTo({ latitude, longitude }, animated, callback);
  }
  setCenterCoordinateZoomLevel(latitude, longitude, zoomLevel, animated = true, callback) {
    return this.easeTo({ latitude, longitude, zoomLevel }, animated, callback);
  }
  setCenterCoordinateZoomLevelPitch(latitude, longitude, zoomLevel, pitch, animated = true, callback) {
    return this.easeTo({ latitude, longitude, zoomLevel, pitch }, animated, callback);
  }
  setPitch(pitch, animated = true, callback) {
    return this.easeTo({ pitch }, animated, callback);
  }
  easeTo(options, animated = true, callback) {
    let _resolve;
    const promise = new Promise(resolve => _resolve = resolve);
    MapboxGLManager.easeTo(findNodeHandle(this), options, animated, () => {
      callback && callback();
      _resolve();
    });
    return promise;
  }

  setCamera(latitude, longitude, zoomLevel, pitch, direction, duration = 0.3) {
    MapboxGLManager.setCamera(findNodeHandle(this), latitude, longitude, zoomLevel, pitch, direction, duration);
  }

  setVisibleCoordinateBounds(latitudeSW, longitudeSW, latitudeNE, longitudeNE, paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0, animated = true) {
    MapboxGLManager.setVisibleCoordinateBounds(findNodeHandle(this), latitudeSW, longitudeSW, latitudeNE, longitudeNE, paddingTop, paddingRight, paddingBottom, paddingLeft, animated);
  }

  // Getters
  getCenterCoordinateZoomLevel(callback) {
    MapboxGLManager.getCenterCoordinateZoomLevel(findNodeHandle(this), callback);
  }
  getDirection(callback) {
    MapboxGLManager.getDirection(findNodeHandle(this), callback);
  }
  getBounds(callback) {
    MapboxGLManager.getBounds(findNodeHandle(this), callback);
  }
  getPitch(callback) {
    MapboxGLManager.getPitch(findNodeHandle(this), callback);
  }

  // Others
  selectAnnotation(annotationId, animated = true) {
    MapboxGLManager.selectAnnotation(findNodeHandle(this), annotationId, animated);
  }

  // Events
  _onRegionDidChange = (event: Event) => {
    if (this.props.onRegionDidChange) this.props.onRegionDidChange(event.nativeEvent.src);
  };
  _onRegionWillChange = (event: Event) => {
    if (this.props.onRegionWillChange) this.props.onRegionWillChange(event.nativeEvent.src);
  };
  _onOpenAnnotation = (event: Event) => {
    if (this.props.onOpenAnnotation) this.props.onOpenAnnotation(event.nativeEvent.src);
  };
  _onRightAnnotationTapped = (event: Event) => {
    if (this.props.onRightAnnotationTapped) this.props.onRightAnnotationTapped(event.nativeEvent.src);
  };
  _onChangeUserTrackingMode = (event: Event) => {
    if (this.props.onChangeUserTrackingMode) this.props.onChangeUserTrackingMode(event.nativeEvent.src);
  };
  _onUpdateUserLocation = (event: Event) => {
    if (this.props.onUpdateUserLocation) this.props.onUpdateUserLocation(event.nativeEvent.src);
  };
  _onLongPress = (event: Event) => {
    if (this.props.onLongPress) this.props.onLongPress(event.nativeEvent.src);
  };
  _onTap = (event: Event) => {
    if (this.props.onTap) this.props.onTap(event.nativeEvent.src);
  };
  _onFinishLoadingMap = (event: Event) => {
    if (this.props.onFinishLoadingMap) this.props.onFinishLoadingMap(event.nativeEvent.src);
  };
  _onStartLoadingMap = (event: Event) => {
    if (this.props.onStartLoadingMap) this.props.onStartLoadingMap(event.nativeEvent.src);
  };
  _onLocateUserFailed = (event: Event) => {
    if (this.props.onLocateUserFailed) this.props.onLocateUserFailed(event.nativeEvent.src);
  };

  static propTypes = {
    ...View.propTypes,

    initialZoomLevel: PropTypes.number,
    initialDirection: PropTypes.number,
    initialCenterCoordinate: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired
    }),
    clipsToBounds: PropTypes.bool,
    debugActive: PropTypes.bool,
    rotateEnabled: PropTypes.bool,
    scrollEnabled: PropTypes.bool,
    zoomEnabled: PropTypes.bool,
    showsUserLocation: PropTypes.bool,
    styleURL: PropTypes.string.isRequired,
    userTrackingMode: PropTypes.number,
    attributionButtonIsHidden: PropTypes.bool,
    logoIsHidden: PropTypes.bool,
    compassIsHidden: PropTypes.bool,
    userLocationVerticalAlignment: PropTypes.number,
    contentInset: PropTypes.arrayOf(PropTypes.number),

    annotations: PropTypes.arrayOf(PropTypes.shape({
      coordinates: PropTypes.array.isRequired,
      title: PropTypes.string,
      subtitle: PropTypes.string,
      fillAlpha: PropTypes.number,
      fillColor: PropTypes.string,
      strokeAlpha: PropTypes.number,
      strokeColor: PropTypes.string,
      strokeWidth: PropTypes.number,
      id: PropTypes.string,
      type: PropTypes.string.isRequired,
      rightCalloutAccessory: PropTypes.object({
        height: PropTypes.number,
        width: PropTypes.number,
        url: PropTypes.string
      }),
      annotationImage: PropTypes.object({
        height: PropTypes.number,
        width: PropTypes.number,
        url: PropTypes.string
      })
    })),
    annotationsAreImmutable: PropTypes.bool,

    onRegionDidChange: PropTypes.func,
    onRegionWillChange: PropTypes.func,
    onOpenAnnotation: PropTypes.func,
    onUpdateUserLocation: PropTypes.func,
    onRightAnnotationTapped: PropTypes.func,
    onFinishLoadingMap: PropTypes.func,
    onStartLoadingMap: PropTypes.func,
    onLocateUserFailed: PropTypes.func,
    onLongPress: PropTypes.func,
    onTap: PropTypes.func,
    onChangeUserTrackingMode: PropTypes.func,
  };

  static defaultProps = {
    initialCenterCoordinate: {
      latitude: 0,
      longitude: 0
    },
    initialDirection: 0,
    initialZoomLevel: 0,
    debugActive: false,
    rotateEnabled: true,
    scrollEnabled: true,
    showsUserLocation: false,
    styleURL: mapStyles.streets,
    userTrackingMode: userTrackingMode.none,
    zoomEnabled: true,
    attributionButtonIsHidden: false,
    logoIsHidden: false,
    compassIsHidden: false,
    annotationsAreImmutable: false,
    annotations: [],
    contentInset: [0, 0, 0, 0]
  };

  componentWillReceiveProps(newProps) {
    const oldKeys = clone(this._annotations);
    const itemsToAdd = [];
    const itemsToRemove = [];

    const isImmutable = newProps.annotationsAreImmutable;
    if (isImmutable && this.props.annotations === newProps.annotations) {
      return;
    }

    newProps.annotations.forEach(annotation => {
      const id = annotation.id;
      if (!isEqual(this._annotations[id], annotation)) {
        this._annotations[id] = isImmutable ? annotation : cloneDeep(annotation);
        itemsToAdd.push(annotation);
      }
      oldKeys[id] = null;
    });

    for (let key in oldKeys) {
      if (oldKeys[key]) {
        delete this._annotations[key];
        itemsToRemove.push(key);
      }
    }

    MapboxGLManager.spliceAnnotations(findNodeHandle(this), false, itemsToRemove, itemsToAdd);
  }

  _native = null;

  _onNativeComponentMount = (ref) => {
    if (this._native === ref) { return; }
    this._native = ref;

    MapboxGLManager.spliceAnnotations(findNodeHandle(this), true, [], this.props.annotations);

    const isImmutable = this.props.annotationsAreImmutable;

    this._annotations = this.props.annotations.reduce((acc, annotation) => {
      acc[annotation.id] = isImmutable ? annotation : cloneDeep(annotation);
      return acc;
    }, {});
  };

  setNativeProps(nativeProps) {
    this._native && this._native.setNativeProps(nativeProps);
  }

  componentWillUnmount() {
    this._native = null;
  }

  render() {
    return (
      <MapboxGLView
        {...this.props}
        ref={this._onNativeComponentMount}
        onRegionDidChange={this._onRegionDidChange}
        onRegionWillChange={this._onRegionWillChange}
        enableOnRegionDidChange={!!this.props.onRegionDidChange}
        enableOnRegionWillChange={!!this.props.onRegionWillChange}
        onOpenAnnotation={this._onOpenAnnotation}
        onRightAnnotationTapped={this._onRightAnnotationTapped}
        onUpdateUserLocation={this._onUpdateUserLocation}
        onLongPress={this._onLongPress}
        onTap={this._onTap}
        onFinishLoadingMap={this._onFinishLoadingMap}
        onStartLoadingMap={this._onStartLoadingMap}
        onLocateUserFailed={this._onLocateUserFailed}
        onChangeUserTrackingMode={this._onChangeUserTrackingMode}
      />
    );
  }
}

const MapboxGLView = requireNativeComponent('RCTMapboxGL', MapView, {
  nativeOnly: {
    onChange: true,
    enableOnRegionDidChange: true,
    enableOnRegionWillChange: true
  }
});

const Mapbox = {
  MapView,
  mapStyles, userTrackingMode, userLocationVerticalAlignment, unknownResourceCount,
  getMetricsEnabled, setMetricsEnabled,
  setAccessToken,
  addOfflinePack, getOfflinePacks, removeOfflinePack,
  addOfflinePackProgressListener,
  addOfflineMaxAllowedTilesListener,
  addOfflineErrorListener
};

module.exports = Mapbox;
