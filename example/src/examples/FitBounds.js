import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

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

    this.state = {
      bounds: {
        ne: this.houseBounds[0],
        sw: this.houseBounds[1],
      },
      animationDuration: 0,
    };
  }

  onFitBounds(i, bounds) {
    this.setState({
      bounds: {
        ne: bounds[0],
        sw: bounds[1],
      },
      animationDuration: 2000,
    });
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._bounds}
        onOptionPress={this.onFitBounds}>
        <MapboxGL.MapView
          contentInset={10}
          styleURL={MapboxGL.StyleURL.Satellite}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            bounds={this.state.bounds}
            animationDuration={this.state.animationDuration}
            maxZoomLevel={19}
          />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FitBounds;
