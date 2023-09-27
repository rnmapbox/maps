import React, { memo } from 'react';

import NativeStyleImport from '../specs/RNMBXStyleImportNativeComponent';

type Props = {
  /**
   * id of the style import (eg. basemap)
   */
  id: string;

  /**
   * existing is now always required as true
   */
  existing: boolean;

  /**
   * config is a dictionary of configuration options for the style import.
   *
   * See https://github.com/mapbox/mapbox-maps-ios/blob/main/Sources/MapboxMaps/Documentation.docc/Migrate%20to%20v11.md#21-the-mapbox-standard-style
   */
  config: {
    [key: string]: string;
  };
};

/**
 * Use StyleImport to set configuration options on the new standard style. **V11 only.**
 *
 * See https://github.com/mapbox/mapbox-maps-ios/blob/main/Sources/MapboxMaps/Documentation.docc/Migrate%20to%20v11.md#21-the-mapbox-standard-style
 */
export default memo((props: Props) => {
  return <NativeStyleImport {...props} />;
});
