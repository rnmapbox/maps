import React from 'react';
import { MapView, Camera } from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import BaseExamplePropTypes from '../common/BaseExamplePropTypes';

class CompassView extends React.Component {
  static propTypes = {
    ...BaseExamplePropTypes,
  };

  render() {
    return (
      <>
        <MapView
          style={sheet.matchParent}
          compassEnabled
          logoEnabled={false}
          compassViewPosition={2}
        >
          <Camera heading={21} />
        </MapView>
      </>
    );
  }
}

export default CompassView;
