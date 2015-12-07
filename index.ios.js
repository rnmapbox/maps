'use strict';

var React = require('react-native');
var { NativeModules, requireNativeComponent } = React;

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
  },
  setVisibleCoordinateBoundsAnimated(mapRef, latitudeSW, longitudeSW, latitudeNE, longitudeNE, edge) {
    NativeModules.MapboxGLManager.setVisibleCoordinateBoundsAnimated(React.findNodeHandle(this.refs[mapRef]), latitudeSW, longitudeSW, latitudeNE, longitudeNE, edge);
  },
  setUserTrackingMode(mapRef, userTrackingMode) {
    NativeModules.MapboxGLManager.setUserTrackingMode(React.findNodeHandle(this.refs[mapRef]), userTrackingMode);
  },
  mapStyles: NativeModules.MapboxGLManager.mapStyles,
  userTrackingMode: NativeModules.MapboxGLManager.userTrackingMode
};

var MapView = React.createClass({
  statics: {
    Mixin: MapMixins
  },
  _onRegionChange(event: Event) {
    if (this.props.onRegionChange) this.props.onRegionChange(event.nativeEvent.src);
  },
  _onRegionWillChange(event: Event) {
    if (this.props.onRegionWillChange) this.props.onRegionWillChange(event.nativeEvent.src);
  },
  _onOpenAnnotation(event: Event) {
    if (this.props.onOpenAnnotation) this.props.onOpenAnnotation(event.nativeEvent.src);
  },
  _onRightAnnotationTapped(event: Event) {
    if (this.props.onRightAnnotationTapped) this.props.onRightAnnotationTapped(event.nativeEvent.src);
  },
  _onUpdateUserLocation(event: Event) {
    if (this.props.onUpdateUserLocation) this.props.onUpdateUserLocation(event.nativeEvent.src);
  },
  _onLongPress(event: Event) {
    if (this.props.onLongPress) this.props.onLongPress(event.nativeEvent.src);
  },
  propTypes: {
    showsUserLocation: React.PropTypes.bool,
    rotateEnabled: React.PropTypes.bool,
    scrollEnabled: React.PropTypes.bool,
    zoomEnabled: React.PropTypes.bool,
    accessToken: React.PropTypes.string.isRequired,
    zoomLevel: React.PropTypes.number,
    direction: React.PropTypes.number,
    styleURL: React.PropTypes.string,
    clipsToBounds: React.PropTypes.bool,
    debugActive: React.PropTypes.bool,
    userTrackingMode: React.PropTypes.number,
    attributionButton: React.PropTypes.bool,
    centerCoordinate: React.PropTypes.shape({
      latitude: React.PropTypes.number.isRequired,
      longitude: React.PropTypes.number.isRequired
    }),
    annotations: React.PropTypes.arrayOf(React.PropTypes.shape({
      coordinates: React.PropTypes.arrayOf().isRequired,
      title: React.PropTypes.string,
      subtitle: React.PropTypes.string,
      fillAlpha: React.PropTypes.number,
      fillColor: React.PropTypes.sting,
      strokeAlpha: React.PropTypes.number,
      strokeColor: React.PropTypes.sting,
      strokeWidth: React.PropTypes.number,
      id: React.PropTypes.string,
      type: React.PropTypes.stringisRequired,
      rightCalloutAccessory: React.PropTypes.object({
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        url: React.PropTypes.string
      }),
      annotationImage: React.PropTypes.object({
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        url: React.PropTypes.string
      })
    })),
    attributionButtonIsHidden: React.PropTypes.bool,
    logoIsHidden: React.PropTypes.bool,
    compassIsHidden: React.PropTypes.bool,
    onRegionChange: React.PropTypes.func,
    onRegionWillChange: React.PropTypes.func,
    onOpenAnnotation: React.PropTypes.func,
    onUpdateUserLocation: React.PropTypes.func,
    onRightAnnotationTapped: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      centerCoordinate: {
        latitude: 0,
        longitude: 0
      },
      debugActive: false,
      direction: 0,
      rotationEnabled: true,
      scrollEnabled: true,
      showsUserLocation: false,
      styleUrl: this.Mixin.mapStyles.streets,
      zoomEnabled: true,
      zoomLevel: 0,
      attributionButtonIsHidden: false,
      logoIsHidden: false,
      compassIsHidden: false
    };
  },
  render() {
    return <MapboxGLView
      {...this.props}
      onRegionChange={this._onRegionChange}
      onRegionWillChange={this._onRegionWillChange}
      onOpenAnnotation={this._onOpenAnnotation}
      onRightAnnotationTapped={this._onRightAnnotationTapped}
      onUpdateUserLocation={this._onUpdateUserLocation}
      onLongPress={this._onLongPress} />;
  }
});

var MapboxGLView = requireNativeComponent('RCTMapboxGL', MapView);

module.exports = MapView;
