import React from 'react';

import { type Location } from '../modules/location/locationManager';

type Props = {
  androidRenderMode?: 'normal' | 'compass' | 'gps';
  animated?: boolean;
  children?: ReactNode;
  minDisplacement?: number;
  onPress?: () => void;
  onUpdate?: (location: Location) => void;
  renderMode?: 'normal' | 'native';
  showsUserHeadingIndicator?: boolean;
  visible?: boolean;
};

export default class UserLocation extends React.PureComponent<UserLocationProps> {}
