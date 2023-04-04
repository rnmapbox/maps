import React from 'react';
import { requireNativeComponent } from 'react-native';

import {
  cloneReactChildrenWithProps,
  isNumber,
  resolveImagePath,
} from '../utils';
import { BaseProps } from '../types/BaseProps';
import { Position } from '../types/Position';

import AbstractSource from './AbstractSource';

export const NATIVE_MODULE_NAME = 'RCTMGLImageSource';

type Props = BaseProps & {
  /**
   * A string that uniquely identifies the source.
   */
  id: string;

  /**
   * The id refers to en existing source in the style. Does not create a new source.
   */
  existing?: boolean;

  /**
   * An HTTP(S) URL, absolute file URL, or local file URL to the source image.
   * Gifs are currently not supported.
   */
  url?: number | string;

  /**
   * The top left, top right, bottom right, and bottom left coordinates for the image.
   */
  coordinates?: [Position, Position, Position, Position];

  children?: React.ReactElement | React.ReactElement[];
};

type NativeProps = Props;

/**
 * ImageSource is a content source that is used for a georeferenced raster image to be shown on the map.
 * The georeferenced image scales and rotates as the user zooms and rotates the map
 */
class ImageSource extends AbstractSource<Props, NativeProps> {
  _getURL(): string | undefined {
    const { url } = this.props;

    if (isNumber(url)) {
      return resolveImagePath(url);
    } else {
      return url;
    }
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
      <RCTMGLImageSource ref={this.setNativeRef} {...props}>
        {cloneReactChildrenWithProps(this.props.children, {
          sourceID: this.props.id,
        })}
      </RCTMGLImageSource>
    );
  }
}

const RCTMGLImageSource =
  requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

export default ImageSource;
