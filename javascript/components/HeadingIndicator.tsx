import React from 'react';

import headingIcon from '../assets/heading.png';
import { BaseProps } from '../types/BaseProps';

import { SymbolLayer } from './SymbolLayer';
import Images from './Images';

const style = {
  iconImage: 'userLocationHeading',
  iconAllowOverlap: true,
  iconPitchAlignment: 'map',
  iconRotationAlignment: 'map',
} as const;

type Props = BaseProps & {
  heading?: number;
};

const HeadingIndicator = ({ heading }: Props) => {
  return (
    <React.Fragment key="mapboxUserLocationHeadingIndicatorWrapper">
      <Images
        images={{ userLocationHeading: headingIcon }}
        key="mapboxUserLocationHeadingImages"
      />
      <SymbolLayer
        key="mapboxUserLocationHeadingIndicator"
        id="mapboxUserLocationHeadingIndicator"
        sourceID="mapboxUserLocation"
        belowLayerID="mapboxUserLocationWhiteCircle"
        style={{
          iconRotate: heading,
          ...style,
        }}
      />
    </React.Fragment>
  );
};

export default HeadingIndicator;
