'use strict'

var React = require('react-native');
var { NativeModules, requireNativeComponent } = React;

var ReactMapView = requireNativeComponent('RCTMapbox', {
    name: 'RCTMapbox',
    propTypes: {
      accessToken: React.PropTypes.string.isRequired,
      annotations: React.PropTypes.arrayOf(React.PropTypes.shape({
        title: React.PropTypes.string,
        subtitle: React.PropTypes.string,
        coordinates: React.PropTypes.array,
        alpha: React.PropTypes.number,
        fillColor: React.PropTypes.string,
        strokeColor: React.PropTypes.string,
        strokeWidth: React.PropTypes.number
      })),
      centerCoordinate: React.PropTypes.shape({
        latitude: React.PropTypes.number.isRequired,
        longitude: React.PropTypes.number.isRequired
      }),
      debugActive: React.PropTypes.bool,
      direction: React.PropTypes.number,
      rotationEnabled: React.PropTypes.bool,
      scrollEnabled: React.PropTypes.bool,
      showsUserLocation: React.PropTypes.bool,
      styleUrl: React.PropTypes.string,
      UserLocationTrackingMode: React.PropTypes.oneOf(['NONE', 'FOLLOW']),
      zoomEnabled: React.PropTypes.bool,
      zoomLevel: React.PropTypes.number,
      onRegionChange: React.PropTypes.func,
      // Fix for https://github.com/mapbox/react-native-mapbox-gl/issues/118
      scaleY: React.PropTypes.number,
      scaleX: React.PropTypes.number,
      translateY: React.PropTypes.number,
      translateX: React.PropTypes.number,
      rotation: React.PropTypes.number,
      // Fix for https://github.com/mapbox/react-native-mapbox-gl/issues/175
      renderToHardwareTextureAndroid: React.PropTypes.bool,
      onLayout: React.PropTypes.bool,
      accessibilityLiveRegion: React.PropTypes.string,
      accessibilityComponentType: React.PropTypes.string,
      accessibilityLabel: React.PropTypes.string,
      testID: React.PropTypes.string,
      importantForAccessibility: React.PropTypes.string
    },
    defaultProps() {
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
        styleUrl: 'asset://styles/streets-v8.json',
        UserLocationTrackingMode: 'NONE',
        zoomEnabled: true,
        zoomLevel: 0
      };
    }
});

var ReactMapViewWrapper = React.createClass({
  handleOnChange(event) {
    if (this.props.onRegionChange) this.props.onRegionChange(event.nativeEvent.src);
  },
  render() {
    return <ReactMapView
      {...this.props}
      onChange={this.handleOnChange} />
  }
});

module.exports = ReactMapViewWrapper;
