import {
  Image,
  ImageResolvedAssetSource,
  processColor,
  ProcessedColorValue,
} from 'react-native';

import { getStyleType } from './styleMap';
import BridgeValue, {
  type StyleValueJSON,
  type RawValueType,
} from './BridgeValue';
import { AllLayerStyleProps } from './MapboxStyles';

export type StyleValue = {
  styletype: string;
  stylevalue: StyleValueJSON;
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
    let rawStyle: RawValueType = style[styleProp];

    if (styleType === 'color' && typeof rawStyle === 'string') {
      const color = processColor(rawStyle);
      if (color === null || color === undefined || typeof color === 'symbol') {
        console.error(`RNMapbox: Invalid color value: ${rawStyle} using red`);
        rawStyle = 'ff0000';
      } else {
        rawStyle = color;
      }
    } else if (styleType === 'image' && typeof rawStyle === 'number') {
      rawStyle =
        (Image.resolveAssetSource(rawStyle) as unknown as RawValueType) || {};
    }

    const bridgeValue = new BridgeValue(rawStyle);
    nativeStyle[styleProp] = {
      styletype: styleType,
      stylevalue: bridgeValue.toJSON(),
    };
  }

  return nativeStyle;
}
