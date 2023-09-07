import React, {useState} from 'react';
import MapboxGL, {CameraPadding} from '@rnmapbox/maps';

import sheet from '../../styles/sheet';
import {BaseExampleProps} from '../common/BaseExamplePropTypes';
import TabBarPage from '../common/TabBarPage';

enum Alignment {
  Top = 'TOP',
  Center = 'CENTER',
  Bottom = 'BOTTOM',
}

const ALIGNMENTS: Record<Alignment, Partial<CameraPadding>> = {
  [Alignment.Top]: {paddingBottom: 300},
  [Alignment.Center]: {},
  [Alignment.Bottom]: {paddingTop: 300},
};

const UserLocationPadding = (props: BaseExampleProps) => {
  const [alignment, setAlignment] = useState<Alignment>(Alignment.Center);

  return (
    <TabBarPage
      {...props}
      initialIndex={Object.values(Alignment).indexOf(Alignment.Center)}
      options={Object.values(Alignment).map(alignmentValue => ({
        label: alignmentValue,
        data: alignmentValue,
      }))}
      onOptionPress={(index, data) => setAlignment(data)}>
      <MapboxGL.MapView style={sheet.matchParent}>
        <MapboxGL.Camera
          followUserLocation
          followPadding={ALIGNMENTS[alignment]}
        />
        <MapboxGL.UserLocation />
      </MapboxGL.MapView>
    </TabBarPage>
  );
};

export default UserLocationPadding;
