import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { ButtonGroup } from '@rneui/base';

const styles = {
  matchParent: { flex: 1 },
};

class SetHeading extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      heading: 0,
      zoomLevel: 16,
      animationDuration: 150,
      followUserLocation: true,
    };

    this._bearingOptions = [
      { label: '0', data: 0 },
      { label: '90', data: 90 },
      { label: '180', data: 180 },
    ];

    this.onHeadingChange = this.onHeadingChange.bind(this);
  }

  componentDidMount() {
    Mapbox.locationManager.start();
  }

  componentDidUpdate() {
    if (this.state.followUserLocation) {
      this.setState({ followUserLocation: false });
    }
  }

  componentWillUnmount() {
    Mapbox.locationManager.stop();
  }

  onHeadingChange(index, heading) {
    this.setState({ heading, selectedIndex: index });
  }

  render() {
    return (
      <>
        <ButtonGroup
          buttons={this._bearingOptions.map((i) => i.label)}
          selectedIndex={this.state.selectedIndex}
          onPress={(i) => this.onHeadingChange(i, this._bearingOptions[i].data)}
        />
        <Mapbox.MapView
          ref={(ref) => (this.map = ref)}
          style={styles.matchParent}
        >
          <Mapbox.Camera {...this.state} />
          <Mapbox.UserLocation />
        </Mapbox.MapView>
      </>
    );
  }
}

export default SetHeading;
