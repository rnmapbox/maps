import React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent } from 'react-native';

const RCTMGLMapView = requireNativeComponent('RCTMGLMapView', MapView);

const DEFAULT_CENTER_COORDINATE = {
  type: 'Point',
  coordinates: [-77.036086, 38.910233]
}

class MapView extends React.Component {
  static StyleURL = {
    Street: 'mapbox-streets',
    Dark: 'mapbox-dark',
    Light: 'mapbox-light',
    Outdoors: 'mapbox-outdoors',
    Satellite: 'mapbox-satellite'
  }

  static propTypes = {
    animated: PropTypes.bool,
    centerCoordinate: PropTypes.object,
    heading: PropTypes.number,
    ptich: PropTypes.number,
    style: PropTypes.any,
    styleURL: PropTypes.string,
    zoomLevel: PropTypes.number
  };

  static defaultProps = {
    animated: true,
    centerCoordinate: DEFAULT_CENTER_COORDINATE,
    heading: 0,
    pitch: 0,
    zoomLevel: 16,
    styleURL: MapView.StyleURL.Street
  };

  render () {
    return <RCTMGLMapView {...this.props} />;
  }
}

export default MapView;
