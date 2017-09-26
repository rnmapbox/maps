import { isUndefined, isPrimitive } from './index';
import { processColor, NativeModules } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import styleMap, { StyleTypes, StyleFunctionTypes } from './styleMap';

const MapboxGL = NativeModules.MGLModule;

class MapStyleItem {
  constructor (type, payload) {
    this.type = type;
    this.payload = payload;
  }

  toJSON () {
    return { type: this.type, payload: this.payload };
  }
}

class MapStyleTransitionItem extends MapStyleItem {
  constructor (duration = 0, delay = 0, extras = {}) {
    super(StyleTypes.Transition, {
      value: {
        duration: duration,
        delay: delay,
      },
      ...extras,
    });
  }
}

class MapStyleTranslationItem extends MapStyleItem {
  constructor (x, y, extras = {}) {
    super(StyleTypes.Translation, {
      value: [x, y],
      ...extras,
    });
  }
}

class MapStyleConstantItem extends MapStyleItem {
  constructor (value, extras = {}) {
    super(StyleTypes.Constant, { value: value, ...extras });
  }
}

class MapStyleColorItem extends MapStyleItem {
  constructor (value, extras = {}) {
    super(StyleTypes.Color, { value: value, ...extras });
  }
}

class MapStyleFunctionItem extends MapStyleItem {
  constructor (fn, mode = MapboxGL.InterpolationMode.Exponential, payload) {
    super(StyleTypes.Function, {
      fn: fn,
      mode: mode,
      stops: payload.stops || {},
      attributeName: payload.attributeName,
    });
  }

  processStops (prop) {
    let stops = {};

    const stopKeys = Object.keys(this.payload.stops);
    for (let stopKey of stopKeys) {
      const stopValue = this.payload.stops[stopKey];

      if (Array.isArray(stopValue)) {
        stops[stopKey] = makeStyleValue(prop, stopValue[1], { propertyValue: stopValue[0] });
      } else {
        stops[stopKey] = makeStyleValue(prop, stopValue);
      }
    }

    this.payload.stops = stops;
  }
}

function makeStyleValue (prop, value, extras = {}) {
  let item;

  if (!isUndefined(value.type) && !isUndefined(value.payload)) { // function
    item = value;
    item.processStops(prop);
  } else if (styleMap[prop] === StyleTypes.Transition) {
    item = new MapStyleTransitionItem(value.duration, value.delay, extras);
  } else if (styleMap[prop] === StyleTypes.Color) {
    item = new MapStyleColorItem(processColor(value), extras);
  } else if (styleMap[prop] === StyleTypes.Translation) {
    item = new MapStyleTranslationItem(value.x, value.y, extras);
  } else if (styleMap[prop] === StyleTypes.Image) {
    const res = resolveAssetSource(value) || {};
    item = new MapStyleConstantItem(res.uri || value, { image: true, ...extras });
  } else {
    item = new MapStyleConstantItem(value);
  }

  return item.toJSON();
}

class MapboxStyleSheet {
  static create (userStyles, depth = 0) {
    if (MapboxStyleSheet.isStyleSheet(userStyles)) {
      return userStyles;
    }

    const styleProps = Object.keys(userStyles);
    let style = {};

    for (let styleProp of styleProps) {
      const userStyle = userStyles[styleProp];

      if (!styleMap[styleProp] && depth === 0 && !isPrimitive(userStyle)) {
        style[styleProp] = MapboxStyleSheet.create(userStyle, depth + 1);
        continue;
      } else if (!styleMap[styleProp] && (depth > 0 || isPrimitive(userStyle))) {
        throw new Error(`Invalid Mapbox Style ${styleProp}`);
      } else if (isUndefined(userStyle) || userStyle === null) {
        throw new Error(`Invalid Mapbox Style ${styleProp} cannot be undefined/null`);
      }

      style[styleProp] = makeStyleValue(styleProp, userStyle);
    }

    style.__MAPBOX_STYLESHEET__ = true;
    return style;
  }

  static camera (stops, mode) {
    return new MapStyleFunctionItem(
      StyleFunctionTypes.Camera,
      mode: mode,
      { stops: stops },
    );
  }

  static source (stops, attributeName, mode) {
    return new MapStyleFunctionItem(
      StyleFunctionTypes.Source,
      mode: mode,
      { stops: stops, attributeName: attributeName },
    );
  }

  static composite (stops, attributeName, mode) {
    return new MapStyleFunctionItem(
      StyleFunctionTypes.Composite,
      mode: mode,
      { stops: stops, attributeName: attributeName },
    );
  }

  static isStyleSheet (stylesheet) {
    if (!stylesheet) {
      return false;
    }
    return stylesheet.__MAPBOX_STYLESHEET__ || false;
  }

  static isStyleItem (item) {
    return item instanceof MapStyleItem;
  }

  // helpers

  static identity (attrName) {
    return MapboxStyleSheet.source(null, attrName, MapboxGL.InterpolationMode.Identity);
  }
}

export default MapboxStyleSheet;
