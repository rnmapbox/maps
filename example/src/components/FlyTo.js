import React from 'react';
import {Alert} from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

const layerStyles = MapboxGL.StyleSheet.create({
  building: {
    fillExtrusionOpacity: 1,
    fillExtrusionHeight: MapboxGL.StyleSheet.identity('height'),
    fillExtrusionBase: MapboxGL.StyleSheet.identity('min_height'),
    fillExtrusionColor: MapboxGL.StyleSheet.source(
      [[0, 'white'], [50, 'blue'], [100, 'red']],
      'height',
      MapboxGL.InterpolationMode.Exponential,
    ),
    fillExtrusionColorTransition: {duration: 2000, delay: 0},
  },
  streets: {
    lineColor: 'blue',
    lineWidth: 2,
    lineOpacity: 0.5,
    lineJoin: 'round',
    lineCap: 'round',
    lineDasharray: [2, 2],
  },
});

class FlyTo extends React.Component {
  static SF_OFFICE_LOCATION = [-122.400021, 37.789085];

  static DC_OFFICE_LOCATION = [-77.036086, 38.910233];

  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._flyToOptions = [
      {label: 'SF', data: FlyTo.SF_OFFICE_LOCATION},
      {label: 'DC', data: FlyTo.DC_OFFICE_LOCATION},
    ];

    this.onFlyToPress = this.onFlyToPress.bind(this);
    this.onFlyToComplete = this.onFlyToComplete.bind(this);
  }

  async onFlyToPress(i, coordinates) {
    await this.map.flyTo(coordinates, 6000);
    this.onFlyToComplete();
  }

  onFlyToComplete() {
    Alert.alert('Fly To Animation Completed', 'We did it!!!');
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._flyToOptions}
        onOptionPress={this.onFlyToPress}
      >
        <MapboxGL.MapView
          zoomLevel={16}
          pitch={45}
          centerCoordinate={FlyTo.SF_OFFICE_LOCATION}
          ref={ref => (this.map = ref)}
          style={sheet.matchParent}
        >
          <MapboxGL.VectorSource>
            <MapboxGL.FillExtrusionLayer
              id="building3d"
              sourceLayerID="building"
              style={layerStyles.building}
            />

            <MapboxGL.LineLayer
              id="streetLineColor"
              sourceLayerID="road"
              minZoomLevel={14}
              belowLayerID="building3d"
              style={layerStyles.streets}
            />
          </MapboxGL.VectorSource>
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default FlyTo;
