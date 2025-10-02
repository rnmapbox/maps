import React from 'react';
import { render } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { Text, View } from 'react-native';

import Callout from '../../src/components/Callout';

describe('Callout', () => {
  test('renders with custom title', () => {
    const testTitle = 'test title';
    const { getByText } = render(<Callout {...{ title: testTitle }} />);

    expect(getByText(testTitle)).toBeDefined();
  });

  describe('_renderDefaultCallout', () => {
    test('renders default children', () => {
      const { UNSAFE_getByType, UNSAFE_getAllByType } = render(<Callout />);
      const callout = UNSAFE_getByType('RNMBXCallout');

      expect(callout).toBeDefined();
      expect(UNSAFE_getAllByType(Text).length).toBe(1);
      expect(UNSAFE_getAllByType(View).length).toBe(3);
    });

    test('renders with custom styles', () => {
      const testProps = {
        style: { height: 1 },
        containerStyle: { height: 2 },
        contentStyle: { height: 3 },
        tipStyle: { height: 4 },
        textStyle: { height: 5 },
      };
      const result = render(<Callout {...testProps} />);
      const { UNSAFE_getByType, UNSAFE_getAllByType } = result;
      const callout = UNSAFE_getByType('RNMBXCallout');
      const views = UNSAFE_getAllByType(View);
      const text = UNSAFE_getByType(Text);

      function getStyleHeightForViewWithProps(props: {
        [propName: string]: any;
      }): ReactTestInstance {
        if (Array.isArray(props.style)) {
          return props.style[1].height;
        }
        // Animated views returned from Callouts have the style being an object, whilst other views have an array of style objects instead
        return props.style.height;
      }

      const calloutWrapperTestStyle = getStyleHeightForViewWithProps(
        callout.props,
      );
      const animatedViewTestStyle = getStyleHeightForViewWithProps(
        views[0].props,
      );
      const wrapperViewTestStyle = getStyleHeightForViewWithProps(
        views[1].props,
      );
      const tipViewTestStyle = getStyleHeightForViewWithProps(views[2].props);
      const textTestStyle = getStyleHeightForViewWithProps(text.props);

      expect(calloutWrapperTestStyle).toStrictEqual(
        testProps.containerStyle.height,
      );
      expect(animatedViewTestStyle).toStrictEqual(testProps.style.height);
      expect(wrapperViewTestStyle).toStrictEqual(testProps.contentStyle.height);
      expect(tipViewTestStyle).toStrictEqual(testProps.tipStyle.height);
      expect(textTestStyle).toStrictEqual(testProps.textStyle.height);
    });
  });

  describe('_renderCustomCallout', () => {
    test('renders custom children', () => {
      const { getByTestId, UNSAFE_queryByType } = render(
        <Callout>
          <View testID="TestChild">{'Foo Bar'}</View>
        </Callout>,
      );

      expect(UNSAFE_queryByType(Text)).toBeNull();
      expect(getByTestId('TestChild')).toBeDefined();
    });

    test('renders with custom styles', () => {
      const testProps = {
        style: { width: 1 },
        containerStyle: { width: 2 },
      };
      const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
        <Callout {...testProps}>
          <View>{'Foo Bar'}</View>
        </Callout>,
      );
      const callout = UNSAFE_getByType('RNMBXCallout');
      const views = UNSAFE_getAllByType(View);

      const calloutWrapperTestStyle = callout.props.style[1].width;
      const animatedViewTestStyle = views[0].props.style.width;

      expect(calloutWrapperTestStyle).toStrictEqual(
        testProps.containerStyle.width,
      );
      expect(animatedViewTestStyle).toStrictEqual(testProps.style.width);
    });
  });
});
