import React from 'react';

export interface PointAnnotationProps {
  coordinate: [number, number];
  anchor: {
    x: number;
    y: number;
  };
}

export default class PointAnnotation extends React.Component<PointAnnotationProps> {
  refresh(): void;
}
