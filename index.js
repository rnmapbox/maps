'use strict';

import React, { Component, PropTypes } from 'react';
import {
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
import Annotation from './Annotation';

const { MapboxGLManager } = NativeModules;
const { mapStyles, userTrackingMode, userLocationVerticalAlignment, unknownResourceCount } = MapboxGLManager;

// Deprecation

function deprecated(obj, key) {
  const value = obj[key];
  let warned = false;
  Object.defineProperty(obj, key, {
    get() {
      if (!warned) {
        console.warn(`${key} is deprecated`); // eslint-disable-line
        warned = true;
      }
      return value;
    }
  });
}

deprecated(mapStyles, 'emerald');

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
  let _options = options;
  // Workaround the fact that RN Android can't serialize JSON correctly
  if (Platform.OS === 'android') {
    _options = {
      ...options,
      metadata: JSON.stringify({ v: options.metadata })
    };
  }
  const promise = MapboxGLManager.addOfflinePack(_options);
  bindCallbackToPromise(callback, promise);
  return promise;
}

function getOfflinePacks(callback) {
  let promise = MapboxGLManager.getOfflinePacks();
  if (Platform.OS === 'android') {
    promise = promise.then(packs => {
      packs.forEach(progress => {
        if (progress.metadata) {
          progress.metadata = JSON.parse(progress.metadata).v;
        }
      });
      return packs;
    });
  }
  bindCallbackToPromise(callback, promise);
  return promise;
}

function removeOfflinePack(packName, callback) {
  const promise = MapboxGLManager.removeOfflinePack(packName);
  bindCallbackToPromise(callback, promise);
  return promise;
}

function setOfflinePackProgressThrottleInterval(milis) {
  MapboxGLManager.setOfflinePackProgressThrottleInterval(milis);
}

function addOfflinePackProgressListener(handler) {
  let _handler = handler;
  if (Platform.OS === 'android') {
    _handler = (progress) => {
      if (progress.metadata) {
        progress.metadata = JSON.parse(progress.metadata).v;
      }
      handler(progress);
    };
  }
  return NativeAppEventEmitter.addListener('MapboxOfflineProgressDidChange', _handler);
}

function addOfflineMaxAllowedTilesListener(handler) {
  return NativeAppEventEmitter.addListener('MapboxOfflineMaxAllowedTiles', handler);
}

function addOfflineErrorListener(handler) {
  return NativeAppEventEmitter.addListener('MapboxOfflineError', handler);
}

class MapView extends Component {
  constructor(props) {
    super(props);

    this._onRegionDidChange = this._onRegionDidChange.bind(this);
    this._onRegionWillChange = this._onRegionWillChange.bind(this);
    this._onOpenAnnotation = this._onOpenAnnotation.bind(this);
    this._onRightAnnotationTapped = this._onRightAnnotationTapped.bind(this);
    this._onChangeUserTrackingMode = this._onChangeUserTrackingMode.bind(this);
    this._onUpdateUserLocation = this._onUpdateUserLocation.bind(this);
    this._onLongPress = this._onLongPress.bind(this);
    this._onTap = this._onTap.bind(this);
    this._onFinishLoadingMap = this._onFinishLoadingMap.bind(this);
    this._onStartLoadingMap = this._onStartLoadingMap.bind(this);
    this._onLocateUserFailed = this._onLocateUserFailed.bind(this);
    this._onNativeComponentMount = this._onNativeComponentMount.bind(this);
  }

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
  deselectAnnotation() {
    MapboxGLManager.deselectAnnotation(findNodeHandle(this));
  }
  queryRenderedFeatures(options, callback) {
    let promise;
    if (Platform.OS === 'android') {
      promise = Promise.reject('queryRenderedFeatures() is not yet implemented on Android');
    } else {
      promise = MapboxGLManager.queryRenderedFeatures(findNodeHandle(this), options);
    }
    bindCallbackToPromise(callback, promise);
    return promise;
  }

  // Events
  _onRegionDidChange(event: Event) {
    if (this.props.onRegionDidChange) this.props.onRegionDidChange(event.nativeEvent.src);
  }
  _onRegionWillChange(event: Event) {
    if (this.props.onRegionWillChange) this.props.onRegionWillChange(event.nativeEvent.src);
  }
  _onOpenAnnotation(event: Event) {
    if (this.props.onOpenAnnotation) this.props.onOpenAnnotation(event.nativeEvent.src);
  }
  _onRightAnnotationTapped(event: Event) {
    if (this.props.onRightAnnotationTapped) this.props.onRightAnnotationTapped(event.nativeEvent.src);
  }
  _onChangeUserTrackingMode(event: Event) {
    if (this.props.onChangeUserTrackingMode) this.props.onChangeUserTrackingMode(event.nativeEvent.src);
  }
  _onUpdateUserLocation(event: Event) {
    if (this.props.onUpdateUserLocation) this.props.onUpdateUserLocation(event.nativeEvent.src);
  }
  _onLongPress(event: Event) {
    if (this.props.onLongPress) this.props.onLongPress(event.nativeEvent.src);
  }
  _onTap(event: Event) {
    if (this.props.onTap) this.props.onTap(event.nativeEvent.src);
  }
  _onFinishLoadingMap(event: Event) {
    if (this.props.onFinishLoadingMap) this.props.onFinishLoadingMap(event.nativeEvent.src);
  }
  _onStartLoadingMap(event: Event) {
    if (this.props.onStartLoadingMap) this.props.onStartLoadingMap(event.nativeEvent.src);
  }
  _onLocateUserFailed(event: Event) {
    if (this.props.onLocateUserFailed) this.props.onLocateUserFailed(event.nativeEvent.src);
  }

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
    minimumZoomLevel: PropTypes.number,
    maximumZoomLevel: PropTypes.number,
    pitchEnabled: PropTypes.bool,
    annotationsPopUpEnabled: PropTypes.bool,
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
      rightCalloutAccessory: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
        url: PropTypes.string
      }),
      annotationImage: PropTypes.shape({
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
    minimumZoomLevel: 0,
    maximumZoomLevel: 20, // default in native map view
    debugActive: false,
    rotateEnabled: true,
    scrollEnabled: true,
    pitchEnabled: true,
    showsUserLocation: false,
    styleURL: mapStyles.streets,
    userTrackingMode: userTrackingMode.none,
    zoomEnabled: true,
    annotationsPopUpEnabled: true,
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

  _onNativeComponentMount(ref) {
    if (this._native === ref) { return; }
    this._native = ref;

    MapboxGLManager.spliceAnnotations(findNodeHandle(this), true, [], this.props.annotations);

    const isImmutable = this.props.annotationsAreImmutable;

    this._annotations = this.props.annotations.reduce((acc, annotation) => {
      acc[annotation.id] = isImmutable ? annotation : cloneDeep(annotation);
      return acc;
    }, {});
  }

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
  Annotation,
  mapStyles, userTrackingMode, userLocationVerticalAlignment, unknownResourceCount,
  getMetricsEnabled, setMetricsEnabled,
  setAccessToken,
  addOfflinePack, getOfflinePacks, removeOfflinePack,
  addOfflinePackProgressListener,
  addOfflineMaxAllowedTilesListener,
  addOfflineErrorListener,
  setOfflinePackProgressThrottleInterval
};

module.exports = Mapbox;
