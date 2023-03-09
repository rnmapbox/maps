import React from 'react';

type AnnotationProps = {
  id: string;
  animated?: boolean;
  animationDuration?: number;
  animationEasingFunction?: (x: number) => number;
  coordinates: number[];
  onPress?: (event: unknown) => void;
  children: React.Element | React.Element[];
  style: object;
  icon?: string | number | object;
};

export default class Annotation extends React.Component<AnnotationProps> {}
