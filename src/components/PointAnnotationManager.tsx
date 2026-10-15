import React, { type ReactNode } from 'react';

import NativePointAnnotationManager from '../specs/RNMBXPointAnnotationManagerNativeComponent';

import PointAnnotation from './PointAnnotation';

type Slot = 'bottom' | 'middle' | 'top';

type Props = {
  /**
   * A stable Mapbox layer id for this manager's annotation layer.
   * When omitted, the SDK generates a unique id automatically.
   */
  id?: string;

  /**
   * Marks this as the default manager. PointAnnotations that are not wrapped in a
   * PointAnnotationManager attach to the default manager, so this lets you configure
   * the slot and properties used by those bare annotations. Only one default manager
   * is allowed per MapView.
   */
  default?: boolean;

  /**
   * The slot in the style layer stack to position the annotation layer.
   * Use with Mapbox Standard style to control layer ordering.
   */
  slot?: Slot | (string & {});

  /**
   * If true, the icon will be visible even if it collides with other previously drawn symbols.
   */
  iconAllowOverlap?: boolean;

  /**
   * If true, other symbols can be visible even if they collide with the icon.
   */
  iconIgnorePlacement?: boolean;

  /**
   * If true, text will display without their corresponding icons when the icon collides
   * with other symbols and the text does not.
   */
  iconOptional?: boolean;

  /**
   * If true, the text will be visible even if it collides with other previously drawn symbols.
   */
  textAllowOverlap?: boolean;

  /**
   * If true, other symbols can be visible even if they collide with the text.
   */
  textIgnorePlacement?: boolean;

  /**
   * If true, icons will display without their corresponding text when the text collides
   * with other symbols and the icon does not.
   */
  textOptional?: boolean;

  children?: ReactNode;
};

/**
 * Configures a PointAnnotation manager. Each PointAnnotationManager owns its own
 * annotation layer, so multiple managers can be placed in different `slot`s of the
 * Mapbox Standard style. Wrap PointAnnotation components as children.
 *
 * PointAnnotations that are not wrapped in a PointAnnotationManager attach to a
 * default manager. Use `default` to configure that manager.
 */
const PointAnnotationManager = (props: Props) => {
  const { children, default: isDefault, slot, ...rest } = props;

  if (__DEV__) {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type !== PointAnnotation) {
        console.warn(
          'PointAnnotationManager: only PointAnnotation components should be direct children.',
        );
      }
    });
  }

  return (
    <NativePointAnnotationManager
      {...rest}
      isDefault={isDefault}
      slot={slot as Slot | undefined}
    >
      {children}
    </NativePointAnnotationManager>
  );
};

export default PointAnnotationManager;
