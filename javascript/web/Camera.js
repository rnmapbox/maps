/* eslint-disable react/prop-types */
import React from 'react';

import MapContext from './MapContext';

class Camera extends React.Component {
  componentDidMount() {
    let {map} = this.context;
    console.log("MapContext", MapContext);
    console.log("this.context", this.context);
    let {centerCoordinate} = this.props;
    if (centerCoordinate) {
      map.flyTo({center: centerCoordinate});
    }
  }

  fitBounds(
    northEastCoordinates,
    southWestCoordinates,
    padding = 0,
    animationDuration = 0.0,
  ) {
    let {map} = this.context;
    map.fitBounds([northEastCoordinates, southWestCoordinates]);
  }

  render() {
    return <></>;
  }
}
Camera.contextType = MapContext;

export default Camera;
