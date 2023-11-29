import React from 'react';
import { Image } from 'react-native';

import NativeModels from '../specs/RNMBXModelsNativeComponent';

type Props = {
  /**
   * pair odf model name to gltf and gbl file path/url, or asset id.
   */
  models: { [key: string]: string | number };
};

type Asset = {
  __packager_asset?: boolean;
  uri?: string;
  url?: string;
};

function _resolveAssets(models: Props['models']): {
  [key: string]: Asset;
} {
  const resolvedModels: { [key: string]: Asset } = {};
  Object.keys(models).forEach((key) => {
    const model = models[key];
    if (typeof model === 'string') {
      resolvedModels[key] = { url: model };
    } else {
      const asset = Image.resolveAssetSource(model);
      if (!asset) {
        throw new Error(`Could not resolve model asset: ${model}`);
      }
      resolvedModels[key] = asset;
    }
  });
  return resolvedModels;
}

/**
 * Name of 3D model assets to be used in the map
 */
export default function Models(props: Props) {
  const { models, ...restOfProps } = props;
  return <NativeModels {...restOfProps} models={_resolveAssets(models)} />;
}
