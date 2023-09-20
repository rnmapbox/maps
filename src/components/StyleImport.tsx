import React, { memo } from 'react';

import NativeStyleImport from '../specs/RNMBXStyleImportNativeComponent';

type Props = {
  id: string;

  existing: boolean;

  config: {
    [key: string]: string;
  };
};

export default memo((props: Props) => {
  return <NativeStyleImport {...props} />;
});
