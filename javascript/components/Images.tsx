import React from 'react';
import { requireNativeComponent, Image } from 'react-native';
import { ImageSourcePropType, ImageResolvedAssetSource } from 'react-native';

import { ShapeSource } from './ShapeSource';

export const NATIVE_MODULE_NAME = 'RCTMGLImages';

export type RNMBEvent<PayloadType = { [key: string]: string }> = {
  payload: PayloadType;
  type: string;
};

function _isUrlOrPath(value: string | ImageSourcePropType): value is string {
  return (
    (typeof value === 'string' || value instanceof String) &&
    (value.startsWith('file://') ||
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('asset://') ||
      value.startsWith('/'))
  );
}

type NativeImage =
  | string
  | {
      name: string;
      sdf?: boolean;
      strechX: [number, number][];
      streacY: [number, number][];
    };

interface Props {
  /**
   * Specifies the external images in key-value pairs required for the shape source.
   * Keys are names - see iconImage expressions, values can be either urls-s objects
   * with format {uri: 'http://...'}` or `require('image.png')` or `import 'image.png'`
   */
  images?: { [key: string]: ImageSourcePropType };

  /**
   * If you have an asset under Image.xcassets on iOS and the drawables directory on android
   * you can specify an array of string names with assets as the key `['pin']`.
   * Additionally object with keys sdf, and strechX, strechY is supported for [SDF icons](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/)
   */
  nativeAssetImages?: NativeImage[];

  /**
   * Gets called when a Layer is trying to render an image whose key is not present in
   * any of the `Images` component of the Map.
   */
  onImageMissing?: (imageKey: string) => void;

  id?: string;
  children?: React.ReactElement;
}

/**
 * Images defines the images used in Symbol etc. layers.
 */
class Images extends React.Component<Props> {
  static NATIVE_ASSETS_KEY = 'assets';

  _getImages() {
    if (!this.props.images && !this.props.nativeAssetImages) {
      return {};
    }

    const images: { [key: string]: string | ImageResolvedAssetSource } = {};
    let nativeImages: NativeImage[] = [];

    if (this.props.images) {
      const imageNames = Object.keys(this.props.images);
      for (const imageName of imageNames) {
        const value = this.props.images[imageName];
        if (
          imageName === ShapeSource.NATIVE_ASSETS_KEY &&
          Array.isArray(value)
        ) {
          console.error(
            `Use of ${ShapeSource.NATIVE_ASSETS_KEY} in Images#images is not supported use Images#nativeAssetImages`,
          );
        } else if (_isUrlOrPath(value)) {
          images[imageName] = value;
        } else {
          const res = Image.resolveAssetSource(value);
          if (res && res.uri) {
            images[imageName] = res;
          }
        }
      }
    }

    if (this.props.nativeAssetImages) {
      nativeImages = this.props.nativeAssetImages;
    }

    return {
      images,
      nativeImages,
    };
  }

  _onImageMissing(event: React.SyntheticEvent<Element, RNMBEvent>) {
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

type NativeProps = {
  hasOnImageMissing: boolean;
  onImageMissing?: (event: React.SyntheticEvent<Element, RNMBEvent>) => void;
  images?: { [key: string]: string | ImageResolvedAssetSource };
  nativeImages?: NativeImage[];
};

const RCTMGLImages = requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

export default Images;
