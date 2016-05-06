'use strict'

var React = require('react');
var { PropTypes } = React;

var ReactNative = require('react-native');
var { NativeModules, requireNativeComponent, findNodeHandle, DeviceEventEmitter } = ReactNative;

var { MapboxGLManager } = NativeModules;

var Subscribable = require('Subscribable');

var MapMixins = {
  setDirectionAnimated(mapRef, heading) {
    MapboxGLManager.setDirectionAnimated(findNodeHandle(this.refs[mapRef]), heading);
  },
  setZoomLevelAnimated(mapRef, zoomLevel) {
    MapboxGLManager.setZoomLevelAnimated(findNodeHandle(this.refs[mapRef]), zoomLevel);
  },
  setCenterCoordinateAnimated(mapRef, latitude, longitude) {
    MapboxGLManager.setCenterCoordinateAnimated(findNodeHandle(this.refs[mapRef]), latitude, longitude);
  },
  setCenterCoordinateZoomLevelAnimated(mapRef, latitude, longitude, zoomLevel) {
    MapboxGLManager.setCenterCoordinateZoomLevelAnimated(findNodeHandle(this.refs[mapRef]), latitude, longitude, zoomLevel);
  },
  addAnnotations(mapRef, annotations) {
    MapboxGLManager.addAnnotations(findNodeHandle(this.refs[mapRef]), annotations);
  },
  selectAnnotationAnimated(mapRef, selectedIdentifier) {
    MapboxGLManager.selectAnnotationAnimated(findNodeHandle(this.refs[mapRef]), selectedIdentifier);
  },
  removeAnnotation(mapRef, selectedIdentifier) {
    MapboxGLManager.removeAnnotation(findNodeHandle(this.refs[mapRef]), selectedIdentifier);
  },
  removeAllAnnotations(mapRef) {
    MapboxGLManager.removeAllAnnotations(findNodeHandle(this.refs[mapRef]));
  },
  setVisibleCoordinateBoundsAnimated(mapRef, latitudeSW, longitudeSW, latitudeNE, longitudeNE, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    MapboxGLManager.setVisibleCoordinateBoundsAnimated(findNodeHandle(this.refs[mapRef]), latitudeSW, longitudeSW, latitudeNE, longitudeNE, paddingTop, paddingRight, paddingBottom, paddingLeft);
  },
  setUserTrackingMode(mapRef, userTrackingMode) {
    MapboxGLManager.setUserTrackingMode(findNodeHandle(this.refs[mapRef]), userTrackingMode);
  },
  setTilt(mapRef, tilt) {
    MapboxGLManager.setTilt(findNodeHandle(this.refs[mapRef]), tilt);
  },
  getCenterCoordinateZoomLevel(mapRef, callback) {
    MapboxGLManager.getCenterCoordinateZoomLevel(findNodeHandle(this.refs[mapRef]), callback);
  },
  getDirection(mapRef, callback) {;
    MapboxGLManager.getDirection(findNodeHandle(this.refs[mapRef]), callback);
  },
  getBounds(mapRef, callback) {
    MapboxGLManager.getBounds(findNodeHandle(this.refs[mapRef]), callback);
  },
  mapStyles: MapboxGLManager.mapStyles,
  userTrackingMode: MapboxGLManager.userTrackingMode
};

var ReactMapView = requireNativeComponent('RCTMapbox', {
    name: 'RCTMapbox',
    propTypes: {
      accessToken: PropTypes.string.isRequired,
      attributionButtonIsHidden: PropTypes.bool,
      logoIsHidden: PropTypes.bool,
      annotations: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string,
        coordinates: PropTypes.array.isRequired,
        alpha: PropTypes.number,
        fillColor: PropTypes.string,
        strokeColor: PropTypes.string,
        strokeWidth: PropTypes.number
      })),
      centerCoordinate: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired
      }),
      centerCoordinateZoom: PropTypes.shape(),
      debugActive: PropTypes.bool,
      direction: PropTypes.number,
      rotateEnabled: PropTypes.bool,
      scrollEnabled: PropTypes.bool,
      showsUserLocation: PropTypes.bool,
      styleURL: PropTypes.string,
      userTrackingMode: PropTypes.number,
      zoomEnabled: PropTypes.bool,
      zoomLevel: PropTypes.number,
      tilt: PropTypes.number,
      compassIsHidden: PropTypes.bool,
      onRegionChange: PropTypes.func,
      onOpenAnnotation: PropTypes.func,
      onLongPress: PropTypes.func,
      onUserLocationChange: PropTypes.func,
      // Fix for https://github.com/mapbox/react-native-mapbox-gl/issues/118
      scaleY: PropTypes.number,
      scaleX: PropTypes.number,
      translateY: PropTypes.number,
      translateX: PropTypes.number,
      rotation: PropTypes.number,
      // Fix for https://github.com/mapbox/react-native-mapbox-gl/issues/175
      renderToHardwareTextureAndroid: PropTypes.bool,
      onLayout: PropTypes.bool,
      accessibilityLiveRegion: PropTypes.string,
      accessibilityComponentType: PropTypes.string,
      accessibilityLabel: PropTypes.string,
      testID: PropTypes.string,
      importantForAccessibility: PropTypes.string
    },
    defaultProps() {
      return {
        centerCoordinate: {
          latitude: 0,
          longitude: 0
        },
        debugActive: false,
        direction: 0,
        rotateEnabled: true,
        scrollEnabled: true,
        showsUserLocation: false,
        styleURL: MapboxGLManager.mapStyles.streets,
        userTrackingMode: MapboxGLManager.userTrackingMode.none,
        zoomEnabled: true,
        zoomLevel: 0,
        tilt: 0,
        compassIsHidden: false
      };
    }
});

var ReactMapViewWrapper = React.createClass({
  mixins: [Subscribable.Mixin],
  statics: {
    Mixin: MapMixins
  },
  propTypes: {
    onRegionChange: PropTypes.func,
    onUserLocationChange: PropTypes.func,
    onOpenAnnotation: PropTypes.func,
    onLongPress: PropTypes.func
  },
  componentWillMount: function() {
    this.addListenerOn(DeviceEventEmitter,'onRegionChange', this.handleOnChange);
    this.addListenerOn(DeviceEventEmitter,'onUserLocationChange', this.handleUserLocation);
    this.addListenerOn(DeviceEventEmitter,'onOpenAnnotation', this.handleOnOpenAnnotation);
    this.addListenerOn(DeviceEventEmitter,'onLongPress', this.handleOnLongPress);
  },
  handleOnChange(event) {
    if (this.props.onRegionChange) this.props.onRegionChange(event);
  },
  handleUserLocation(event) {
    if (this.props.onUserLocationChange) this.props.onUserLocationChange(event);
  },
  handleOnOpenAnnotation(event) {
    if (this.props.onOpenAnnotation) this.props.onOpenAnnotation(event);
  },
  handleOnLongPress(event) {
    if (this.props.onLongPress) this.props.onLongPress(event);
  },
  render() {
    return (
      <ReactMapView
        {...this.props} />
    );
  }
});

module.exports = ReactMapViewWrapper;
