'use strict';

import React,  { Component, PropTypes } from 'react';
import {
  NativeModules,
  NativeAppEventEmitter,
  requireNativeComponent,
  findNodeHandle
} from 'react-native';

import cloneDeep from 'lodash/cloneDeep';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';

const { MapboxGLManager } = NativeModules;
const { mapStyles, userTrackingMode, userLocationVerticalAlignment, unknownResourceCount } = MapboxGLManager;

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
function addOfflinePack(options, callback = () => {}) {
  MapboxGLManager.addPackForRegion(options, callback);
}

function getOfflinePacks(callback) {
  MapboxGLManager.getPacks(callback);
}

function removeOfflinePack(packName, callback = () => {}) {
  MapboxGLManager.removePack(packName, callback);
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
    let _resolve;
    const promise = new Promise(resolve => _resolve = resolve);
    MapboxGLManager.setCenterZoomDirection(findNodeHandle(this), { direction }, animated, () => {
      callback && callback();
      _resolve();
    });
    return promise;
  }
  setZoomLevel(zoomLevel, animated = true, callback) {
    let _resolve;
    const promise = new Promise(resolve => _resolve = resolve);
    MapboxGLManager.setCenterZoomDirection(findNodeHandle(this), { zoomLevel }, animated, () => {
      callback && callback();
      _resolve();
    });
    return promise;
  }
  setCenterCoordinate(latitude, longitude, animated = true, callback) {
    let _resolve;
    const promise = new Promise(resolve => _resolve = resolve);
    MapboxGLManager.setCenterZoomDirection(findNodeHandle(this), { latitude, longitude }, animated, () => {
      callback && callback();
      _resolve();
    });
    return promise;
  }
  setCenterCoordinateZoomLevel(latitude, longitude, zoomLevel, animated = true, callback) {
    let _resolve;
    const promise = new Promise(resolve => _resolve = resolve);
    MapboxGLManager.setCenterZoomDirection(findNodeHandle(this), { latitude, longitude, zoomLevel }, animated, () => {
      callback && callback();
      _resolve();
    });
    return promise;
  }

  setCamera(latitude, longitude, fromDistance, pitch, direction, duration = 1.0) {
    MapboxGLManager.setCamera(findNodeHandle(this), latitude, longitude, fromDistance, pitch, direction, duration);
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

  // Others
  selectAnnotation(annotationId, animated = true) {
    MapboxGLManager.selectAnnotation(findNodeHandle(this), annotationId, animated);
  }

  // Events
  _onRegionChange = (event: Event) => {
    if (this.props.onRegionChange) this.props.onRegionChange(event.nativeEvent.src);
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
    initialZoomLevel: PropTypes.number,
    initialDirection: PropTypes.number,
    initialCenterCoordinate: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired
    }),
    showsUserLocation: PropTypes.bool,
    rotateEnabled: PropTypes.bool,
    scrollEnabled: PropTypes.bool,
    zoomEnabled: PropTypes.bool,
    styleURL: PropTypes.string,
    clipsToBounds: PropTypes.bool,
    debugActive: PropTypes.bool,
    userTrackingMode: PropTypes.number,
    attributionButton: PropTypes.bool,
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
    attributionButtonIsHidden: PropTypes.bool,
    logoIsHidden: PropTypes.bool,
    compassIsHidden: PropTypes.bool,
    onRegionChange: PropTypes.func,
    onRegionWillChange: PropTypes.func,
    onOpenAnnotation: PropTypes.func,
    onUpdateUserLocation: PropTypes.func,
    onRightAnnotationTapped: PropTypes.func,
    onFinishLoadingMap: PropTypes.func,
    onStartLoadingMap: PropTypes.func,
    onLocateUserFailed: PropTypes.func,
    onLongPress: PropTypes.func,
    onTap: PropTypes.func,
    contentInset: PropTypes.array,
    userLocationVerticalAlignment: PropTypes.number,
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
    annotationsAreImmutable: false
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

  onNativeComponentMount = (ref) => {
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
        ref={this.onNativeComponentMount}
        onRegionChange={this._onRegionChange}
        onRegionWillChange={this._onRegionWillChange}
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

const MapboxGLView = requireNativeComponent('RCTMapboxGL', MapView);

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
