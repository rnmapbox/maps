import { Image, processColor } from 'react-native';

import BridgeValue, {
  type RawValueType,
  type StyleValueJSON,
} from './BridgeValue';
import { AllLayerStyleProps } from './MapboxStyles';
import { getStyleType } from './styleMap';

export type StyleValue = {
  styletype: string;
  stylevalue: StyleValueJSON;
};

export function transformStyle(
  style: AllLayerStyleProps | undefined,
): undefined | { [key: string]: StyleValue } {
  if (!style) {
    return;
  }

  const nativeStyle: { [key: string]: StyleValue } = {};
  const styleProps = Object.keys(style) as Array<keyof typeof style>;
  for (const styleProp of styleProps) {
    const styleType = getStyleType(styleProp);
    let rawStyle: RawValueType | undefined = style[styleProp];

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
    if (
      styleType === 'image' &&
      !(
        Array.isArray(rawStyle) ||
        (typeof rawStyle === 'string' &&
          !rawStyle.startsWith('http://') &&
          !rawStyle.startsWith('https://'))
      )
    ) {
      console.warn(
        `RNMapbox: Image or URL in ${styleProp} is deprecated, use Images component. See https://github.com/rnmapbox/maps/wiki/Deprecated-URLInIconImages`,
      );
    }

    if (rawStyle !== undefined) {
      const bridgeValue = new BridgeValue(rawStyle);
      nativeStyle[styleProp] = {
        styletype: styleType,
        stylevalue: bridgeValue.toJSON(),
      };
    }
  }

  return nativeStyle;
}
