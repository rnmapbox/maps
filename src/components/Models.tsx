import React from 'react';

import NativeModels from '../specs/RNMBXModelsNativeComponent';

type Props = {
  /**
   * pair odf model name to glbf and gbl file path/url
   */
  models: { [key: string]: string };
};

/**
 * Name of 3D model assets to be used in the map
 */
export default function Models(props: Props) {
  return <NativeModels {...props} />;
}
