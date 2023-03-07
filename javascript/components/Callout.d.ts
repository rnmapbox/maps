import { ViewStyle } from 'react-native';

type Props = Omit<ViewProps, 'style'> & {
  /**
   * String that gets displayed in the default callout.
   */
  title: string;

  /**
   * Style property for the Animated.View wrapper, apply animations to this
   */
  style?: ViewStyle;

  /**
   * Style property for the native RCTMGLCallout container, set at your own risk.
   */
  containerStyle?: ViewStyle;

  /**
   * Style property for the content bubble.
   */
  contentStyle?: ViewStyle;

  /**
   * Style property for the triangle tip under the content.
   */
  tipStyle?: ViewStyle;

  /**
   * Style property for the title in the content bubble.
   */
  textStyle?: ViewStyle;
};

export default class Callout extends React.Component<Props> {}
