import React from 'react';
import { Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { ButtonGroup } from '@rneui/base';

const layerStyles = {
  building: {
    fillExtrusionColor: '#aaa',

    fillExtrusionHeight: [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height'],
    ],

    fillExtrusionBase: [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height'],
    ],

    fillExtrusionOpacity: 0.6,
  },
};

const styles = {
  matchParent: { flex: 1 },
};

class FlyTo extends React.Component {
  static SF_OFFICE_LOCATION = [-122.400021, 37.789085];

  static DC_OFFICE_LOCATION = [-77.036086, 38.910233];

  static ZERO_ZERO = [0, 0];
  static ZERO_TEN = [0, 10];
  static TEN_ZERO = [10, 0];

  constructor(props) {
    super(props);

    this.state = {
      location: FlyTo.SF_OFFICE_LOCATION,
    };

    this._flyToOptions = [
      { label: 'SF', data: FlyTo.SF_OFFICE_LOCATION },
      { label: 'DC', data: FlyTo.DC_OFFICE_LOCATION },
      { label: '0,0', data: FlyTo.ZERO_ZERO },
      { label: '0,10', data: FlyTo.ZERO_TEN },
      { label: '10,0', data: FlyTo.TEN_ZERO },
    ];

    this.onFlyToPress = this.onFlyToPress.bind(this);
    this.onFlyToComplete = this.onFlyToComplete.bind(this);
  }

  onFlyToPress(i) {
    this.setState({ location: this._flyToOptions[i].data, selectedIndex: i });
  }

  onFlyToComplete() {
    Alert.alert('Fly To Animation Completed', 'We did it!!!');
  }

  render() {
    return (
      <>
        <ButtonGroup
          buttons={this._flyToOptions.map((i) => i.label)}
          selectedIndex={this.state.selectedIndex}
          onPress={(i) => this.onFlyToPress(i)}
        />
        <Mapbox.MapView style={styles.matchParent}>
          <Mapbox.Camera
            zoomLevel={16}
            animationMode={'flyTo'}
            animationDuration={6000}
            centerCoordinate={this.state.location}
          />

          <Mapbox.UserLocation />

          <Mapbox.FillExtrusionLayer
            id="building3d"
            sourceLayerID="building"
            style={layerStyles.building}
          />
        </Mapbox.MapView>
      </>
    );
  }
}

export default FlyTo;
