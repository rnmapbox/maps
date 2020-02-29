import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';
import Bubble from './common/Bubble';

// eslint-disable-next-line react/prop-types
const AnnotationContent = ({title}) => (
  <View style={{borderColor: 'black', borderWidth: 1.0, width: 60}}>
    <Text>{title}</Text>
    <TouchableOpacity
      style={{
        backgroundColor: 'blue',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          color: 'white',
          fontWeight: 'bold',
        }}>
        Btn
      </Text>
    </TouchableOpacity>
  </View>
);

class ShowMarkerView extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this.state = {
      backgroundColor: 'blue',
      coordinates: [[-73.99155, 40.73581], [-73.99155, 40.73681]],
    };
  }

  render() {
    return (
      <Page {...this.props}>
        <MapboxGL.MapView
          ref={c => (this._map = c)}
          onPress={this.onPress}
          onDidFinishLoadingMap={this.onDidFinishLoadingMap}
          style={sheet.matchParent}>
          <MapboxGL.Camera
            zoomLevel={16}
            centerCoordinate={this.state.coordinates[0]}
          />

          <MapboxGL.PointAnnotation
            coordinate={this.state.coordinates[1]}
            id="pt-ann">
            <AnnotationContent title={'this is a point annotation'} />
          </MapboxGL.PointAnnotation>

          <MapboxGL.MarkerView coordinate={this.state.coordinates[0]}>
            <AnnotationContent title={'this is a marker view'} />
          </MapboxGL.MarkerView>
        </MapboxGL.MapView>

        <Bubble>
          <Text>Click to add a point annotation</Text>
        </Bubble>
      </Page>
    );
  }
}

export default ShowMarkerView;
