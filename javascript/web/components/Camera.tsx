import React from 'react';

import MapContext from '../MapContext';

class Camera extends React.Component<{
  centerCoordinate: [number, number] | null;
}> {
  context!: React.ContextType<typeof MapContext>;

  static contextType = MapContext;
  static UserTrackingModes = [];

  componentDidMount() {
    const { map } = this.context;
    const { centerCoordinate } = this.props;
    if (map && centerCoordinate) {
      map.flyTo({ center: centerCoordinate });
    }
  }

  fitBounds(
    northEastCoordinates: [number, number],
    southWestCoordinates: [number, number],
    padding = 0,
    animationDuration = 0.0,
  ) {
    const { map } = this.context;
    if (map) {
      map.fitBounds([northEastCoordinates, southWestCoordinates]);
    }
  }

  render() {
    return <></>;
  }
}

export { Camera };
export default Camera;
