type Props = {
  id: string;
  animated?: boolean;
  animationDuration?: number;
  animationEasingFunction: (x: number) => number;
  coordinates: number[];
  onPress: (event: unknown) => number;
  children: React.Element | React.Element[];
  style: object;
  icon: string | number | object;
};

export default class Annotation extends React.Component<Props> {}
