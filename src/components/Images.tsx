import React, { ReactNode, ReactElement } from 'react';
import { Image as RNImage, ImageURISource } from 'react-native';
import { ImageSourcePropType, ImageResolvedAssetSource } from 'react-native';

import RNMBXImagesNativeComponent from '../specs/RNMBXImagesNativeComponent';

import { ShapeSource } from './ShapeSource';
import Image from './Image';

export const NATIVE_MODULE_NAME = 'RNMBXImages';

export type RNMBEvent<PayloadType = { [key: string]: string }> = {
  payload: PayloadType;
  type: string;
};

function _isUrlOrPath(value: ImageEntry): value is string {
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

function isImageSourcePropType(
  value: ImageEntry,
): value is ImageSourcePropType {
  if (typeof value === 'number' || value instanceof Number) {
    return true;
  }
  const valueAsSource = value as ImageURISource;
  return !!valueAsSource.uri && typeof valueAsSource.uri === 'string';
}

type TypedReactNode<T> = ReactElement<T> | Array<TypedReactNode<T>> | never;

type NativeImage =
  | string
  | {
      name: string;
      sdf?: boolean;
      stretchX?: [number, number][];
      stretchY?: [number, number][];
      content?: [number, number, number, number];
      scale?: number;
    };

export type ImageEntryData = {
  url?: string;
  image?: ImageSourcePropType;
  resolvedImage?: ImageResolvedAssetSource;
  sdf?: boolean;
  stretchX?: [number, number][];
  stretchY?: [number, number][];
  content?: [number, number, number, number];
  scale?: number;
};

type ResolvedImageEntryData = {
  url?: string;
  resolvedImage?: ImageResolvedAssetSource;
  sdf?: boolean;
  stretchX?: [number, number][];
  stretchY?: [number, number][];
  content?: [number, number, number, number];
  scale?: number;
};

export type ImageEntry = string | ImageSourcePropType | ImageEntryData;

const isChildAnImage = (
  child: ReactNode,
): child is React.ReactElement<typeof Image> => {
  return React.isValidElement(child) && child.type === Image;
};

interface Props {
  /**
   * Specifies the external images in key-value pairs required for the shape source.
   * Keys are names - see iconImage expressions, values can be either urls-s objects
   * with format `{uri: 'http://...'}` or `require('image.png')` or `import 'image.png'`
   */
  images?: { [key: string]: ImageEntry };

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

  children?: TypedReactNode<typeof Image>;
}

/**
 * Images defines the images used in Symbol etc. layers.
 */
class Images extends React.PureComponent<Props> {
  static NATIVE_ASSETS_KEY = 'assets';

  _getImages() {
    if (!this.props.images && !this.props.nativeAssetImages) {
      return {};
    }

    const images: {
      [key: string]: string | ImageResolvedAssetSource | ResolvedImageEntryData;
    } = {};
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
        } else if (isImageSourcePropType(value)) {
          const res = RNImage.resolveAssetSource(value);
          if (res && res.uri) {
            images[imageName] = res;
          }
        } else {
          let imageEntry = value as ImageEntryData;
          if (imageEntry.image) {
            imageEntry = {
              ...imageEntry,
              resolvedImage: RNImage.resolveAssetSource(imageEntry.image),
            };
          }
          images[imageName] = imageEntry;
        }
      }
    }

    const { children } = this.props;
    if (children) {
      const childrenWithWrongType = React.Children.toArray(children).find(
        (child) => !isChildAnImage(child),
      );
      if (childrenWithWrongType) {
        console.error(
          `Images component on accepts Image a children passed in: ${
            (childrenWithWrongType as any).type || 'n/a'
          }`,
        );
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
      hasOnImageMissing: !!this.props.onImageMissing,
      onImageMissing: this._onImageMissing.bind(this),
      ...this._getImages(),
    };

    return (
      // @ts-expect-error just codegen stuff
      <RNMBXImagesNativeComponent {...props}>
        {this.props.children}
      </RNMBXImagesNativeComponent>
    );
  }
}

export default Images;
