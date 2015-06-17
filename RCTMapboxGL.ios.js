'use strict';

var React = require('react-native');
var requireNativeComponent = require('requireNativeComponent');
var { NativeModules } = React;

var MapMixins = {
  setDirectionAnimated(mapRef, heading) {
    NativeModules.MapboxGLManager.setDirectionAnimated(React.findNodeHandle(this.refs[mapRef]), heading);
  },
  setZoomLevelAnimated(mapRef, zoomLevel) {
    NativeModules.MapboxGLManager.setZoomLevelAnimated(React.findNodeHandle(this.refs[mapRef]), zoomLevel);
  },
  setCenterCoordinateAnimated(mapRef, latitude, longitude) {
    NativeModules.MapboxGLManager.setCenterCoordinateAnimated(React.findNodeHandle(this.refs[mapRef]), latitude, longitude);
  },
  setCenterCoordinateZoomLevelAnimated(mapRef, latitude, longitude, zoomLevel) {
    NativeModules.MapboxGLManager.setCenterCoordinateZoomLevelAnimated(React.findNodeHandle(this.refs[mapRef]), latitude, longitude, zoomLevel);
  },
  addAnnotations(mapRef, annotations) {
    NativeModules.MapboxGLManager.addAnnotations(React.findNodeHandle(this.refs[mapRef]), annotations);
  },
  selectAnnotationAnimated(mapRef, annotationInArray) {
    NativeModules.MapboxGLManager.selectAnnotationAnimated(React.findNodeHandle(this.refs[mapRef]), annotationInArray);
  },
  removeAnnotation(mapRef, annotationInArray) {
    NativeModules.MapboxGLManager.removeAnnotation(React.findNodeHandle(this.refs[mapRef]), annotationInArray);
  }
};

var MapView = React.createClass({
  statics: {
    Mixin: MapMixins
  },
  _onChange(event: Event) {
    if (!this.props.onRegionChange) {
      return;
    }
    this.props.onRegionChange(event.nativeEvent.region);
  },
  _onOpenAnnotation(event: Event) {
    if (!this.props.onOpenAnnotation) {
      return;
    }
    this.props.onOpenAnnotation(event.nativeEvent.annotation);
  },
  _onRightAnnotationTapped(event: Event) {
    if (!this.props.onRightAnnotationTapped) {
      return;
    }
    this.props.onRightAnnotationTapped(event.nativeEvent.annotation);
  },
  _onUpdateUserLocation(event: Event) {
    if (!this.props.onUpdateUserLocation) {
      return;
    }
    this.props.onUpdateUserLocation(event.nativeEvent.userLocation);
  },
  propTypes: {
    showsUserLocation: React.PropTypes.bool,
    rotateEnabled: React.PropTypes.bool,
    accessToken: React.PropTypes.string.isRequired,
    zoomLevel: React.PropTypes.number,
    direction: React.PropTypes.number,
    styleURL: React.PropTypes.string,
    clipsToBounds: React.PropTypes.bool,
    debugActive: React.PropTypes.bool,
    centerCoordinate: React.PropTypes.shape({
      latitude: React.PropTypes.number.isRequired,
      longitude: React.PropTypes.number.isRequired
    }),
    annotations: React.PropTypes.arrayOf(React.PropTypes.shape({
      latitude: React.PropTypes.number.isRequired,
      longitude: React.PropTypes.number.isRequired,
      title: React.PropTypes.string,
      subtitle: React.PropTypes.string,
      id: React.PropTypes.string,
      rightCalloutAccessory: React.PropTypes.object({
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        url: React.PropTypes.string,
      })
    })),
    onRegionChange: React.PropTypes.func,
    onOpenAnnotation: React.PropTypes.func,
    onUpdateUserLocation: React.PropTypes.func,
    onRightAnnotationTapped: React.PropTypes.func
  },

  render: function() {

    var props = this.props;

    if (!this.props.styleURL) {
      props.styleURL = 'asset://styles/mapbox-streets-v7.json';
    }

    return <MapboxGLView
      {...props}
      onChange={this._onChange}
      onBlur={this._onOpenAnnotation}
      topTap={this._onRightAnnotationTapped}
      onLoadingFinish={this._onUpdateUserLocation} />;
  }
});

var MapboxGLView = requireNativeComponent('RCTMapboxGL', MapView);

module.exports = MapView;
