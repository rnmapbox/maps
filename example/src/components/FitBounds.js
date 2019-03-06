import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class FitBounds extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  constructor(props) {
    super(props);

    const houseBounds = [[-74.135379, 40.795909], [-74.135449, 40.795578]];

    const townBounds = [[-74.12641, 40.797968], [-74.143727, 40.772177]];

    this._bounds = [
      {label: 'Fit House', data: houseBounds},
      {label: 'Fit Town', data: townBounds},
    ];

    this.onFitBounds = this.onFitBounds.bind(this);
  }

  onFitBounds(i, bounds) {
    this.map.fitBounds(bounds[0], bounds[1], 0, 200); // ne sw
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._bounds}
        onOptionPress={this.onFitBounds}
      >
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          zoomLevel={18}
          maxZoomLevel={19}
          centerCoordinate={[-74.135426, 40.795765]}
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}
        />
      </TabBarPage>
    );
  }
}

export default FitBounds;
