import React from 'react';
import { Camera, MapView } from '@rnmapbox/maps';

import Page from '../common/Page';
import { type BaseExampleProps } from '../common/BaseExamplePropTypes';

const CENTER_COORD = [-74.00597, 40.71427];

const LocalizeLabels = (props: BaseExampleProps) => {
  return (
    <Page {...props}>
      <MapView style={{ flex: 1 }} localizeLabels={{ locale: 'es' }}>
        <Camera centerCoordinate={CENTER_COORD} zoomLevel={14} />
      </MapView>
    </Page>
  );
};

export default LocalizeLabels;
