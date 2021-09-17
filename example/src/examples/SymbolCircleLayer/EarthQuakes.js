import React from 'react';
import {FlatList} from 'react-native';
import {Overlay, ListItem, FAB, Icon} from 'react-native-elements';
import MapboxGL from '@react-native-mapbox-gl/maps';
import moment from 'moment';

import sheet from '../../styles/sheet';
import {SF_OFFICE_COORDINATE} from '../../utils';

import BaseExamplePropTypes from '../common/BaseExamplePropTypes';
import Page from '../common/Page';

const layerStyles = {
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

    circleColor: [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100,
      '#f1f075',
      750,
      '#f28cb1',
    ],

    circleRadius: ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
};

const styles = {
  fab: {
    position: 'absolute',
    top: 10,
    right: 10,
    elevation: 9999,
    zIndex: 9999,
  },
};

class EarthQuakes extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  state = {
    selectedCluster: null,
  };

  render() {
    return (
      <>
        <Overlay isVisible={!!this.state.selectedCluster} fullScreen>
          <FAB
            onPress={() => {
              this.setState({selectedCluster: null});
            }}
            icon={<Icon name="close" />}
            size="large"
            style={styles.fab}
          />
          {this.state.selectedCluster && (
            <FlatList
              keyExtractor={({properties: earthquakeInfo}) => {
                return earthquakeInfo.code;
              }}
              data={this.state.selectedCluster.features}
              renderItem={({item: {properties: earthquakeInfo}}) => {
                const magnitude = `Magnitude: ${earthquakeInfo.mag}`;
                const place = `Place: ${earthquakeInfo.place}`;
                const code = `Code: ${earthquakeInfo.code}`;
                const time = `Time: ${moment(earthquakeInfo.time).format(
                  'MMMM Do YYYY, h:mm:ss a',
                )}`;

                return (
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>{earthquakeInfo.title}</ListItem.Title>
                      <ListItem.Subtitle>{magnitude}</ListItem.Subtitle>
                      <ListItem.Subtitle>{place}</ListItem.Subtitle>
                      <ListItem.Subtitle>{code}</ListItem.Subtitle>
                      <ListItem.Subtitle>{time}</ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                );
              }}
            />
          )}
        </Overlay>
        <Page {...this.props}>
          <MapboxGL.MapView
            style={sheet.matchParent}
            styleURL={MapboxGL.StyleURL.Dark}>
            <MapboxGL.Camera
              zoomLevel={6}
              pitch={45}
              centerCoordinate={SF_OFFICE_COORDINATE}
            />

            <MapboxGL.ShapeSource
              id="earthquakes"
              onPress={async shape => {
                const cluster = shape.features[0];
                const collection = await this.shape.getClusterLeaves(
                  cluster,
                  999,
                  0,
                );

                this.setState({selectedCluster: collection});
              }}
              ref={shape => (this.shape = shape)}
              cluster
              clusterRadius={50}
              clusterMaxZoom={14}
              url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson">
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
                filter={['!', ['has', 'point_count']]}
                style={layerStyles.singlePoint}
              />
            </MapboxGL.ShapeSource>
          </MapboxGL.MapView>
        </Page>
      </>
    );
  }
}

export default EarthQuakes;
