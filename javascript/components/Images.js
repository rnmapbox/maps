import React from 'react';
import PropTypes from 'prop-types';
import {requireNativeComponent} from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import {viewPropTypes} from '../utils';

import ShapeSource from './ShapeSource';

export const NATIVE_MODULE_NAME = 'RCTMGLImages';

/**
 * Images defines the images used in Symbol etc layers
 */
class Images extends React.Component {
  static NATIVE_ASSETS_KEY = 'assets';

  static propTypes = {
    ...viewPropTypes,

    /**
     * Specifies the external images in key-value pairs required for the shape source.
     * If you have an asset under Image.xcassets on iOS and the drawables directory on android
     * you can specify an array of string names with assets as the key `{ assets: ['pin'] }`.
     */
    images: PropTypes.object,
  };

  _getImages() {
    if (!this.props.images) {
      return {};
    }

    const images = {};
    let nativeImages = [];

    const imageNames = Object.keys(this.props.images);
    for (const imageName of imageNames) {
      if (
        imageName === ShapeSource.NATIVE_ASSETS_KEY &&
        Array.isArray(this.props.images[Images.NATIVE_ASSETS_KEY])
      ) {
        nativeImages = this.props.images[Images.NATIVE_ASSETS_KEY];
      } else {
        const res = resolveAssetSource(this.props.images[imageName]);
        if (res && res.uri) {
          images[imageName] = res;
        }
      }
    }

    return {
      images,
      nativeImages,
    };
  }

  render() {
    const props = {
      id: this.props.id,
      ...this._getImages(),
    };

    return (
      <RCTMGLImages ref="nativeSource" {...props}>
        {this.props.children}
      </RCTMGLImages>
    );
  }
}

const RCTMGLImages = requireNativeComponent(NATIVE_MODULE_NAME, Images, {
  nativeOnly: {
    nativeImages: true,
  },
});

export default Images;
