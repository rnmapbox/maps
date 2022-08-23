import React from 'react';

import MapContext from '../MapContext';

class Camera extends React.Component {
  componentDidMount() {
    let { map } = this.context;
    let { centerCoordinate } = this.props;
    if (centerCoordinate) {
      map.flyTo({ center: centerCoordinate });
    }
  }

  fitBounds(
    northEastCoordinates,
    southWestCoordinates,
    padding = 0,
    animationDuration = 0.0,
  ) {
    let { map } = this.context;
    map.fitBounds([northEastCoordinates, southWestCoordinates]);
  }

  render() {
    return <></>;
  }
}
Camera.contextType = MapContext;
Camera.UserTrackingModes = [];

export { Camera };
export default Camera;
