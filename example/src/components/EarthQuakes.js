import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';
import {SF_OFFICE_COORDINATE} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

const layerStyles = MapboxGL.StyleSheet.create({
  singlePoint: {
    circleColor: 'green',
    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
    circleRadius: 5,
    circlePitchAlignment: 'map',
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleColor: MapboxGL.StyleSheet.source(
      [
        [25, 'yellow'],
        [50, 'red'],
        [75, 'blue'],
        [100, 'orange'],
        [300, 'pink'],
        [750, 'white'],
      ],
      'point_count',
      MapboxGL.InterpolationMode.Exponential,
    ),

    circleRadius: MapboxGL.StyleSheet.source(
      [[0, 15], [100, 20], [750, 30]],
      'point_count',
      MapboxGL.InterpolationMode.Exponential,
    ),

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
});

class EarthQuakes extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          zoomLevel={6}
          pitch={45}
          centerCoordinate={SF_OFFICE_COORDINATE}
          style={sheet.matchParent}
          styleURL={MapboxGL.StyleURL.Dark}
        >
          <MapboxGL.ShapeSource
            id="earthquakes"
            cluster
            clusterRadius={50}
            clusterMaxZoom={14}
            url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
          >
            <MapboxGL.SymbolLayer
              id="pointCount"
              style={layerStyles.clusterCount}
            />

            <MapboxGL.CircleLayer
              id="clusteredPoints"
              belowLayerID="pointCount"
              filter={['has', 'point_count']}
              style={layerStyles.clusteredPoints}
            />

            <MapboxGL.CircleLayer
              id="singlePoint"
              filter={['!has', 'point_count']}
              style={layerStyles.singlePoint}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </Page>
    );
  }
}

export default EarthQuakes;
