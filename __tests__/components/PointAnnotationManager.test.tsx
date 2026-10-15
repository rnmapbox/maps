import { render } from '@testing-library/react-native';
import type React from 'react';
import { View } from 'react-native';

import PointAnnotationManager from '../../src/components/PointAnnotationManager';
import PointAnnotation from '../../src/components/PointAnnotation';

function getCompByName(name: string): React.ComponentType<any> {
  return name as any as React.ComponentType<any>;
}

describe('PointAnnotationManager', () => {
  test('passes slot and maps the `default` prop to native `isDefault`', () => {
    const { UNSAFE_getByType } = render(
      <PointAnnotationManager default slot="top" iconAllowOverlap />,
    );
    const native = UNSAFE_getByType(
      getCompByName('RNMBXPointAnnotationManager'),
    );

    expect(native.props.slot).toBe('top');
    expect(native.props.isDefault).toBe(true);
    expect(native.props.iconAllowOverlap).toBe(true);
  });

  test('nests PointAnnotation children inside the native manager view', () => {
    const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
      <PointAnnotationManager slot="middle">
        <PointAnnotation id="pin-1" coordinate={[0, 0]}>
          <View />
        </PointAnnotation>
        <PointAnnotation id="pin-2" coordinate={[1, 1]}>
          <View />
        </PointAnnotation>
      </PointAnnotationManager>,
    );

    const manager = UNSAFE_getByType(
      getCompByName('RNMBXPointAnnotationManager'),
    );
    const annotations = UNSAFE_getAllByType(
      getCompByName('RNMBXPointAnnotation'),
    );

    expect(annotations.length).toBe(2);
    // every annotation must be a descendant of the manager
    annotations.forEach((annotation) => {
      let parent = annotation.parent;
      let found = false;
      while (parent) {
        if (parent === manager) {
          found = true;
          break;
        }
        parent = parent.parent;
      }
      expect(found).toBe(true);
    });
  });
});
