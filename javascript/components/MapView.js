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
  };

  static defaultProps = {
    animated: true,
    centerCoordinate: DEFAULT_CENTER_COORDINATE,
    heading: 0,
    pitch: 0,
    zoomLevel: 16,
    styleURL: MapView.StyleURL.Street,
  };

  render () {
    return <RCTMGLMapView {...this.props} />;
  }
}

export default MapView;
