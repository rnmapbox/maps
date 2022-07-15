import { processColor } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import { getStyleType } from './styleMap';
import BridgeValue from './BridgeValue';
import { AllLayerStyleProps } from './MapboxStyles';

type StyleValueArray = { type: 'array'; value: [any] };
type StyleValueNumber = { type: 'number'; value: number };
type StyleValueString = { type: 'string'; value: string };

export type StyleValue = {
  styletype: string;
  stylevalue: StyleValueArray | StyleValueNumber | StyleValueString;
};

export function transformStyle(
  style: AllLayerStyleProps,
): undefined | { [key: string]: StyleValue } {
  if (!style) {
    return;
  }

  const nativeStyle: { [key: string]: StyleValue } = {};
  const styleProps = Object.keys(style) as Array<keyof typeof style>;
  for (const styleProp of styleProps) {
    const styleType = getStyleType(styleProp);
    let rawStyle: unknown = style[styleProp];

    if (styleType === 'color' && typeof rawStyle === 'string') {
      rawStyle = processColor(rawStyle);
    } else if (styleType === 'image' && typeof rawStyle === 'number') {
      rawStyle = resolveAssetSource(rawStyle) || {};
    }

    const bridgeValue = new BridgeValue(rawStyle);
    nativeStyle[styleProp] = {
      styletype: styleType,
      stylevalue: bridgeValue.toJSON(),
    };
  }

  return nativeStyle;
}
