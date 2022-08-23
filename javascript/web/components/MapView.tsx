import React from 'react';
import mapboxgl from 'mapbox-gl';

import MapContext from '../MapContext';

/**
 * MapView backed by Mapbox GL KS
 */
class MapView extends React.Component {
  state = {};

  componentDidMount() {
    let { styleURL } = this.props;
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: styleURL || 'mapbox://styles/mapbox/streets-v11',
    });
    this.map = map;
    this.setState({ map });
  }

  render() {
    const { children } = this.props;
    const { map } = this.state;
    return (
      <div
        style={{ width: '100%', height: '100%' }}
        ref={(el) => (this.mapContainer = el)}
      >
        {map && (
          <div style={{ position: 'absolute' }}>
            <MapContext.Provider value={{ map }}>
              {children}
            </MapContext.Provider>
          </div>
        )}
      </div>
    );
  }
}

export default MapView;
