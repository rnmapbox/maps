/* eslint react/prop-types:0  */
import React from 'react';
import MapboxStyleSheet from '../utils/MapboxStyleSheet';
import { getFilter } from '../utils';

class AbstractLayer extends React.Component {
  get baseProps () {
    return {
      id: this.props.id,
      sourceID: this.props.sourceID,
      reactStyle: this.getStyle(),
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      aboveLayerID: this.props.aboveLayerID,
      belowLayerID: this.props.belowLayerID,
      layerIndex: this.props.layerIndex,
      filter: getFilter(this.props.filter),
    };
  }

  getStyle () {
    if (!this.props.style) {
      return;
    }

    if (MapboxStyleSheet.isStyleSheet(this.props.style)) {
      return this.props.style;
    }

    return MapboxStyleSheet.create(this.props.style);
  }
}

export default AbstractLayer;
