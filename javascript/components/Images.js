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

    /**
     * Gets called when a Layer is trying to render an image whose key is not present in
     * any of the `Images` component of the Map.
     */
    onImageMissing: PropTypes.func,
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

  _onImageMissing(event) {
    if (this.props.onImageMissing) {
      this.props.onImageMissing(event.nativeEvent.payload.imageKey);
    }
  }

  render() {
    const props = {
      id: this.props.id,
      hasOnImageMissing: !!this.props.onImageMissing,
      onImageMissing: this._onImageMissing.bind(this),
      ...this._getImages(),
    };

    return <RCTMGLImages {...props}>{this.props.children}</RCTMGLImages>;
  }
}

const RCTMGLImages = requireNativeComponent(NATIVE_MODULE_NAME, Images, {
  nativeOnly: {
    nativeImages: true,
    onImageMissing: true,
  },
});

export default Images;
