import React from 'react';
import {Button} from 'react-native';
import {
  MapView,
  SkyLayer,
  Camera,
  Logger,
  Terrain,
  RasterDemSource,
} from '@react-native-mapbox-gl/maps';

import Page from '../common/Page';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';

Logger.setLogLevel('verbose');

const styles = {
  mapView: {flex: 1},
};

class SkyAndTerran extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <Page {...this.props}>
        <Button
          title="Grow 1"
          onPress={() => this.setState({radius: this.state.radius + 20})}
        />
        <MapView
          style={styles.mapView}
          styleURL={
            'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'
          }>
          <Camera
            centerCoordinate={[
              // -74.00597, 40.71427
              //-122.4189591, 37.6614238,
              -114.34411, 32.6141,
            ]}
            zoomLevel={13.1}
            bearing={80}
            pitch={85}
          />

          <RasterDemSource
            id="mapbox-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            tileSize={514}
            maxZoomLevel={14}>
            <SkyLayer
              id="sky-layer"
              style={{
                skyType: 'atmosphere',
                skyAtmosphereSun: [0.0, 0.0],
                skyAtmosphereSunIntensity: 15.0,
              }}
            />

            <Terrain exaggeration={1.5} />
          </RasterDemSource>
        </MapView>
      </Page>
    );
  }
}

export default SkyAndTerran;
