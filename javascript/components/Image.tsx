import React, { memo, forwardRef, ReactElement } from 'react';
import { requireNativeComponent } from 'react-native';

interface Props {
  /** Image name */
  name: string;

  /** Make image an sdf optional - see [SDF icons](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/) */
  sdf?: boolean;

  /** stretch along x axis - optional */
  stretchX?: [number, number][];

  /** stretch along y axis - optional */
  stretchY?: [number, number][];

  /** Single react native view generating the image */
  children: ReactElement;
}

interface Ref {
  refresh: () => void;
}

const Image = memo(
  forwardRef<Ref, Props>(function Image(
    { name, sdf, stretchX, stretchY, children }: Props,
    ref: React.ForwardedRef<Ref>,
  ) {
    const nativeProps = {
      name,
      sdf,
      stretchX,
      stretchY,
      children,
    };
    return <RCTMGLImage {...nativeProps} />;
  }),
);

interface NativeProps {
  name: string;
  children: ReactElement;
  sdf?: boolean;
  stretchX?: [number, number][];
  stretchY?: [number, number][];
}

export const NATIVE_MODULE_NAME = 'RCTMGLImage';

const RCTMGLImage = requireNativeComponent<NativeProps>(NATIVE_MODULE_NAME);

Image.displayName = 'Image';

export default Image;
