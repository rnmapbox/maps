import React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent } from 'react-native';

const RCTMGLMapView = requireNativeComponent('RCTMGLMapView', MapView);

const DEFAULT_CENTER_COORDINATE = {
  type: 'Point',
  coordinates: [-77.036086, 38.910233],
};

/**
 * MapView backed by Mapbox Native GL
 */
class MapView extends React.Component {
  static StyleURL = {
    Street: 'mapbox-streets',
    Dark: 'mapbox-dark',
    Light: 'mapbox-light',
    Outdoors: 'mapbox-outdoors',
    Satellite: 'mapbox-satellite',
  };

  static propTypes = {
    /**
     * Animates changes between pitch and bearing
     */
    animated: PropTypes.bool,

    /**
     * Initial center coordinate on map
     */
    centerCoordinate: PropTypes.object,

    /**
     * Initial heading on map
     */
    heading: PropTypes.number,

    /**
     * Initial pitch on map
     */
    pitch: PropTypes.number,

    /**
     * Style for wrapping React Native View
     */
    style: PropTypes.any,

    /**
     * Style URL for map
     */
    styleURL: PropTypes.string,

    /**
     * Initial zoom level of map
     */
    zoomLevel: PropTypes.number,

    /**
     * Map press listener, gets called when a user presses the map
     */
     onPress: PropTypes.func,

     /**
      * Map long press listener, gets called when a user long presses the map
      */
      onLongPress: PropTypes.func,
  };

  static defaultProps = {
    animated: true,
    centerCoordinate: DEFAULT_CENTER_COORDINATE,
    heading: 0,
    pitch: 0,
    zoomLevel: 16,
    styleURL: MapView.StyleURL.Street,
  };

  constructor (props) {
    super(props);

    this.onPress = this.onPress.bind(this);
    this.onLongPress = this.onLongPress.bind(this);
  }

  onPress (e) {
    if (typeof this.props.onPress === 'function') {
      this.props.onPress(e.nativeEvent);
    }
  }

  onLongPress (e) {
    if (typeof this.props.onLongPress === 'function') {
      this.props.onLongPress(e.nativeEvent);
    }
  }

  render () {
    return (
      <RCTMGLMapView
        {...this.props}
        onPress={this.onPress}
        onLongPress={this.onLongPress} />
    );
  }
}

export default MapView;
