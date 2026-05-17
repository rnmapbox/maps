import { type ReactNode } from 'react';

import NativePointAnnotationManager from '../specs/RNMBXPointAnnotationManagerNativeComponent';

type Slot = 'bottom' | 'middle' | 'top';

type Props = {
  /**
   * The slot in the style layer stack to position the annotation layer.
   * Use with Mapbox Standard style to control layer ordering.
   */
  slot?: Slot | (string & {});

  children?: ReactNode;
};

/**
 * Configures the shared PointAnnotation manager for the parent MapView.
 * Wrap PointAnnotation components as children.
 */
const PointAnnotationManager = (props: Props) => {
  return (
    <NativePointAnnotationManager slot={props.slot as Slot | undefined}>
      {props.children}
    </NativePointAnnotationManager>
  );
};

export default PointAnnotationManager;
