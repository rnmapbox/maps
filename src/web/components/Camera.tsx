import React from 'react';

import { Position } from '../../types/Position';
import MapContext from '../MapContext';

class Camera extends React.Component<{
  centerCoordinate: Position | null;
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
    northEastCoordinates: Position,
    southWestCoordinates: Position,
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
