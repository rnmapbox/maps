import React from 'react';
import PropTypes from 'prop-types';

import {viewPropTypes} from '../utils';

import ShapeSource from './ShapeSource';

/**
 * Images defines the images used in Symbol etc layers
 */
class Images extends React.Component {
  static propTypes = {
    ...viewPropTypes,

    /**
     * Specifies the external images in key-value pairs required for the shape source.
     * If you have an asset under Image.xcassets on iOS and the drawables directory on android
     * you can specify an array of string names with assets as the key `{ assets: ['pin'] }`.
     */
    images: PropTypes.object,
  };

  _getID() {
    if (!this.id) {
      this.id = `${ShapeSource.imageSourcePrefix}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    return this.id;
  }

  render() {
    const id = this._getID();

    return (
      <ShapeSource
        images={this.props.images}
        id={id}
        shape={{
          type: 'FeatureCollection',
          features: [],
        }}
      >
        {this.props.children}
      </ShapeSource>
    );
  }
}

export default Images;
