import React from 'react';

class AbstractLayer extends React.Component {
  get baseProps () {
    return {
      id: this.props.id,
      sourceID: this.props.sourceID,
      reactStyle: this.props.style,
      minZoomLevel: this.props.minZoomLevel,
      maxZoomLevel: this.props.maxZoomLevel,
      aboveLayerID: this.props.aboveLayerID,
      belowLayerID: this.props.belowLayerID,
      layerIndex: this.props.layerIndex,
      filter: this.getFilter(),
    };
  }

  getFilter () {
    if (!this.props.filter) {
      return;
    }

    let flattenedFilter = [];
    for (let i = 0; i < this.props.filter.length; i++) {
      const item = this.props.filter[i];

      if (Array.isArray(item)) {
        flattenedFilter = flattenedFilter.concat(item);
      } else {
        flattenedFilter.push(item);
      }
    }

    return flattenedFilter.join(';');
  }
}

export default AbstractLayer;
