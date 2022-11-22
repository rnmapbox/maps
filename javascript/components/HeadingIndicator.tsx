import React from 'react';

import headingIcon from '../assets/heading.png';

import { SymbolLayer } from './SymbolLayer';

const style = {
  iconImage: headingIcon,
  iconAllowOverlap: true,
  iconPitchAlignment: 'map',
  iconRotationAlignment: 'map',
} as const;

type Props = {
  heading?: number;
};

const HeadingIndicator = ({ heading }: Props) => (
  <SymbolLayer
    key="mapboxUserLocationHeadingIndicator"
    id="mapboxUserLocationHeadingIndicator"
    belowLayerID="mapboxUserLocationWhiteCircle"
    style={{
      iconRotate: heading,
      ...style,
    }}
  />
);

export default HeadingIndicator;
