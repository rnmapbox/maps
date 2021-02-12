import React from 'react';
import PropTypes from 'prop-types';

import headingIcon from '../../assets/heading.png';

import SymbolLayer from './SymbolLayer';

const style = {
  iconImage: headingIcon,
  iconAllowOverlap: true,
  iconPitchAlignment: 'map',
  iconRotationAlignment: 'map',
};

const HeadingIndicator = (heading) => (
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

HeadingIndicator.propTypes = {
  heading: PropTypes.number,
};

export default HeadingIndicator;
