import React from 'react';
import {MapView, Camera} from '@react-native-mapbox-gl/maps';

import sheet from '../styles/sheet';

import BaseExamplePropTypes from './common/BaseExamplePropTypes';
import Page from './common/Page';

class CompassView extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <Page {...this.props}>
        <MapView
          style={sheet.matchParent}
          compassEnabled
          logoEnabled={false}
          compassViewPosition={2}>
          <Camera heading={21} />
        </MapView>
      </Page>
    );
  }
}

export default CompassView;
