import React from 'react';
import { Alert } from 'react-native';
import MapboxGL from 'react-native-mapbox-gl';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

import sheet from '../styles/sheet';
import colors from '../styles/colors';

class FlyTo extends React.Component {
  static SF_OFFICE_LOCATION = [-122.400021, 37.789085];
  static DC_OFFICE_LOCATION = [-77.036086, 38.910233];

  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor (props) {
    super(props);

    this._flyToOptions = [
      { label: 'SF', data: FlyTo.SF_OFFICE_LOCATION },
      { label: 'DC', data: FlyTo.DC_OFFICE_LOCATION },
    ];

    this.onFlyToPress = this.onFlyToPress.bind(this);
    this.onFlyToComplete = this.onFlyToComplete.bind(this);
  }

  onFlyToPress (i, coordinates) {
    this.map.flyTo(coordinates, 6000);
  }

  onFlyToComplete () {
    Alert.alert('Fly To Animation Completed', 'We did it!!!');
  }

  render () {
    return (
      <TabBarPage {...this.props} options={this._flyToOptions} onOptionPress={this.onFlyToPress}>
        <MapboxGL.MapView
            zoomLevel={18}
            onFlyToComplete={this.onFlyToComplete}
            centerCoordinate={FlyTo.SF_OFFICE_LOCATION}
            ref={(ref) => this.map = ref}
            style={sheet.matchParent} />
      </TabBarPage>
    );
  }
}

export default FlyTo;
