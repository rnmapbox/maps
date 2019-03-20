import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class FitBounds extends React.Component {
  static propTypes = {...BaseExamplePropTypes};

  houseBounds = [[-74.135379, 40.795909], [-74.135449, 40.795578]];

  townBounds = [[-74.12641, 40.797968], [-74.143727, 40.772177]];

  constructor(props) {
    super(props);

    this._bounds = [
      {label: 'Fit House', data: this.houseBounds},
      {label: 'Fit Town', data: this.townBounds},
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
          contentInset={10}
          visibleCoordinateBounds={this.houseBounds}
          maxZoomLevel={19}
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}
        />
      </TabBarPage>
    );
  }
}

export default FitBounds;
