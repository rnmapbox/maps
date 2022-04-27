import React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent } from 'react-native';

import {
  cloneReactChildrenWithProps,
  viewPropTypes,
  isNumber,
  resolveImagePath,
} from '../utils';

import AbstractSource from './AbstractSource';

export const NATIVE_MODULE_NAME = 'RCTMGLImageSource';

/**
 * ImageSource is a content source that is used for a georeferenced raster image to be shown on the map.
 * The georeferenced image scales and rotates as the user zooms and rotates the map
 */
class ImageSource extends AbstractSource {
  static propTypes = {
    ...viewPropTypes,

    /**
     * A string that uniquely identifies the source.
     */
    id: PropTypes.string.isRequired,

    /**
     * An HTTP(S) URL, absolute file URL, or local file URL to the source image.
     * Gifs are currently not supported.
     */
    url: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /**
     * The top left, top right, bottom right, and bottom left coordinates for the image.
     */
    coordinates: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.number).isRequired,
    ).isRequired,
  };

  _getURL() {
    let { url } = this.props;

    if (isNumber(this.props.url)) {
      url = resolveImagePath(this.props.url);
    }

    return url;
  }

  render() {
    if (
      !this.props.url ||
      !this.props.coordinates ||
      !this.props.coordinates.length
    ) {
      return null;
    }

    const props = {
      ...this.props,
      url: this._getURL(),
    };

    return (
      <RCTMGLImageSource ref="nativeSource" {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLImageSource>
    );
  }
}

const RCTMGLImageSource = requireNativeComponent(
  NATIVE_MODULE_NAME,
  ImageSource,
);

export default ImageSource;
