import React from 'react';
import { View, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Slider } from '@rneui/base';

import colors from '../../styles/colors';
import { SF_OFFICE_COORDINATE } from '../../utils';

const styles = StyleSheet.create({
  slider: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center',
    maxHeight: 60,
    paddingHorizontal: 24,
  },
});

class WatercolorRasterTiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opacity: 1,
    };

    this.onOpacityChange = this.onOpacityChange.bind(this);
  }

  onOpacityChange(value) {
    this.setState({ opacity: value });
  }

  render() {
    const rasterSourceProps = {
      id: 'stamenWatercolorSource',
      tileUrlTemplates: [
        'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=36ff39ee-a31d-4153-8aee-71f361373a5c',
      ],
      tileSize: 256,
    };

    return (
      <>
        <Mapbox.MapView style={{ flex: 1 }}>
          <Mapbox.Camera
            defaultSettings={{
              zoomLevel: 16,
              centerCoordinate: SF_OFFICE_COORDINATE,
            }}
          />

          <Mapbox.RasterSource {...rasterSourceProps}>
            <Mapbox.RasterLayer
              id="stamenWatercolorLayer"
              sourceID="stamenWatercolorSource"
              style={{ rasterOpacity: this.state.opacity }}
            />
          </Mapbox.RasterSource>
        </Mapbox.MapView>

        <View style={styles.slider}>
          <Slider
            value={this.state.opacity}
            onValueChange={this.onOpacityChange}
            thumbTintColor={colors.primary.blue}
            thumbTouchSize={{ width: 44, height: 44 }}
            maximumTrackTintColor={colors.secondary.purpleLight}
            minimumTrackTintColor={colors.secondary.purpleDark}
          />
        </View>
      </>
    );
  }
}

export default WatercolorRasterTiles;

/* end-example-doc */

/**
 * @typedef {import('../common/ExampleMetadata').ExampleWithMetadata} ExampleWithMetadata
 * @type {ExampleWithMetadata['metadata']}
 */
const metadata = {
  title: 'Watercolor Raster Tiles',
  tags: ['RasterSource', 'RasterLayer'],
  docs: '',
};
WatercolorRasterTiles.metadata = metadata;
