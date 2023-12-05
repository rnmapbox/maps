import React from 'react';
import { MapView, Camera, UserLocation } from '@rnmapbox/maps';
import { ButtonGroup } from '@rneui/base';
import { SafeAreaView } from 'react-native';

const COLOR = ['red', 'yellow', 'green'];
const OPTIONS = [{ label: 'red' }, { label: 'yellow' }, { label: 'green' }];
const styles = { matchParent: { flex: 1 } };

class SetTintColor extends React.Component {
  state = { tintColor: COLOR[0] };

  onTintColorChange = (index) => {
    this.setState({ tintColor: COLOR[index] });
  };

  render() {
    return (
      <SafeAreaView style={styles.matchParent}>
        <MapView style={styles.matchParent} tintColor={this.state.tintColor}>
          <Camera
            followZoomLevel={16}
            followUserMode="compass"
            followUserLocation
          />

          <UserLocation renderMode="native" androidRenderMode="compass" />
        </MapView>
        <ButtonGroup
          onPress={this.onTintColorChange}
          buttons={OPTIONS.map((i) => i.label)}
          selectedIndex={COLOR.indexOf(this.state.tintColor)}
        />
      </SafeAreaView>
    );
  }
}

export default SetTintColor;

/* end-example-doc */

/** @type ExampleWithMetadata['metadata'] */
const metadata = {
  title: 'Set Tint Color',
  tags: ['MapView#tintColor'],
  docs: `
Change the tint color of the map. This will change the color of the user location icon and the compass.
`,
};
SetTintColor.metadata = metadata;
