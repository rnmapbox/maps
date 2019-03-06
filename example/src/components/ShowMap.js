import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import sheet from '../styles/sheet';
import {onSortOptions} from '../utils';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import TabBarPage from './common/TabBarPage';

class ShowMap extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  constructor(props) {
    super(props);

    this._mapOptions = Object.keys(MapboxGL.StyleURL)
      .map(key => {
        return {
          label: key,
          data: MapboxGL.StyleURL[key],
        };
      })
      .sort(onSortOptions);

    this.state = {
      styleURL: this._mapOptions[0].data,
    };

    this.onMapChange = this.onMapChange.bind(this);
  }

  onMapChange(index, styleURL) {
    this.setState({styleURL});
  }

  render() {
    return (
      <TabBarPage
        {...this.props}
        scrollable
        options={this._mapOptions}
        onOptionPress={this.onMapChange}
      >
        <MapboxGL.MapView
          showUserLocation={true}
          zoomLevel={12}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          styleURL={this.state.styleURL}
          style={sheet.matchParent}
        />
      </TabBarPage>
    );
  }
}

export default ShowMap;
