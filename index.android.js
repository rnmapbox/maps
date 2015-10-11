var React = require('react-native');
var { NativeModules, requireNativeComponent } = React;


var MapView = React.createClass({
  name: 'RCTMapbox',
  propTypes: {
    accessToken: React.PropTypes.string,
    annotations: React.PropTypes.arrayOf(React.PropTypes.shape({
      title: React.PropTypes.string,
      subtitle: React.PropTypes.string,
      coordinates: React.PropTypes.arrayOf(),
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
    styleUrl: React.PropTypes.string,
    zoomEnabled: React.PropTypes.bool,
    zoomLevel: React.PropTypes.number
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
      styleUrl: 'asset://styles/streets-v8.json',
      zoomEnabled: true
    };
  },
  render: function() {
    return (<Mapbox
      {...this.props}
      />);
  }
});


module.exports = requireNativeComponent('RCTMapbox', MapView);
