import React from 'react';
import MapboxGL from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';
import {onSortOptions} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class SetUserLocationVerticalAlignment extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._alignmentOptions = Object.keys(MapboxGL.UserLocationVerticalAlignment)
      .map(key => {
        return {
          label: key,
          data: MapboxGL.UserLocationVerticalAlignment[key],
        };
      })
      .sort(onSortOptions);

    this.state = {
      currentAlignmentMode: this._alignmentOptions[0].data,
    };

    this.onAlignmentChange = this.onAlignmentChange.bind(this);
  }

  onAlignmentChange(index, userLocationVerticalAlignment) {
    this.setState({currentAlignmentMode: userLocationVerticalAlignment});
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        options={this._alignmentOptions}
        onOptionPress={this.onAlignmentChange}>
        <MapboxGL.MapView style={sheet.matchParent}>
          <MapboxGL.Camera followUserLocation />
          <MapboxGL.UserLocation />
        </MapboxGL.MapView>
      </TabBarPage>
    );
  }
}

export default SetUserLocationVerticalAlignment;
