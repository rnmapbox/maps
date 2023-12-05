import React from 'react';
import MapboxGL from '@rnmapbox/maps';
import { ButtonGroup } from '@rneui/base';

const styles = {
  matchParent: { flex: 1 },
};

class SetPitch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      followPitch: 15,
      zoomLevel: 16,
      duration: 300,
    };

    this._pitchOptions = [
      { label: '15', data: 15 },
      { label: '45', data: 45 },
      { label: '60', data: 60 },
    ];

    this.onUpdatePitch = this.onUpdatePitch.bind(this);
  }

  componentDidMount() {
    MapboxGL.locationManager.start();
  }

  componentWillUnmount() {
    MapboxGL.locationManager.stop();
  }

  onUpdatePitch(index, pitch) {
    this.setState({ followPitch: pitch });
  }

  render() {
    return (
      <>
        <ButtonGroup
          buttons={this._pitchOptions.map((i) => i.label)}
          selectedIndex={this.state.selectedIndex}
          onPress={(i) => this.onUpdatePitch(i, this._pitchOptions[i].data)}
        />
        <MapboxGL.MapView style={styles.matchParent}>
          <MapboxGL.Camera {...this.state} followUserLocation />
          <MapboxGL.UserLocation />
        </MapboxGL.MapView>
      </>
    );
  }
}

export default SetPitch;
