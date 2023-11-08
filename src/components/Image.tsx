import React, { memo, forwardRef, ReactElement } from 'react';
import { findNodeHandle } from 'react-native';

import RNMBXImageNativeComponent from '../specs/RNMBXImageNativeComponent';
import NativeRNMBXImageModule from '../specs/NativeRNMBXImageModule';

interface Props {
  /** ID of the image */
  name: string;

  /** Make image an sdf optional - see [SDF icons](https://docs.mapbox.com/help/troubleshooting/using-recolorable-images-in-mapbox-maps/) */
  sdf?: boolean;

  /** An array of two-element arrays, consisting of two numbers that represent, the from position and the to position of areas that can be stretched horizontally. */
  stretchX?: [number, number][];

  /** An array of two-element arrays, consisting of two numbers that represent, the from position and the to position of areas that can be stretched vertically. */
  stretchY?: [number, number][];

  /** An array of four numbers, with the first two specifying the left, top
   * corner, and the last two specifying the right, bottom corner. If present, and if the
   * icon uses icon-text-fit, the symbol's text will be fit inside the content box. */
  content?: [number, number, number, number];

  /** Scale factor for the image. */
  scale?: number;

  /** Single react native view rendering the image */
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

    const imageRef = React.useRef(null);

    const refresh = () => {
      const handle = findNodeHandle(imageRef.current as any);
      NativeRNMBXImageModule.refresh(handle);
    };

    React.useImperativeHandle(ref, () => {
      return { refresh };
    });

    // @ts-expect-error just codegen stuff
    return <RNMBXImageNativeComponent {...nativeProps} ref={imageRef} />;
  }),
);

Image.displayName = 'Image';

export default Image;
