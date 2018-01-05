import { isUndefined, isPrimitive } from './index';
import { processColor, NativeModules } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import styleMap, { StyleTypes, StyleFunctionTypes, styleExtras } from './styleMap';
import BridgeValue from './BridgeValue';

const MapboxGL = NativeModules.MGLModule;

class MapStyleItem {
  constructor (type, payload) {
    this.type = type;
    this.payload = payload;
  }

  toJSON (shouldMarkAsStyle) {
    const json = {
      styletype: this.type,
      payload: this.payload,
      __MAPBOX_STYLE__: true,
    };

    if (!shouldMarkAsStyle) {
      delete json.__MAPBOX_STYLE__;
    }

    return json;
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
      stops: [],
      attributeName: payload.attributeName,
    });

    this._rawStops = payload.stops;
  }

  processStops (prop) {
    let stops = [];

    const isComposite = this.payload.fn === StyleFunctionTypes.Composite;
    for (let rawStop of this._rawStops) {
      const [stopKey, stopValue] = rawStop;

      if (isComposite) {
        stops.push([
          stopKey,
          makeStyleValue(prop, stopValue[1], { propertyValue: stopValue[0] }, false),
        ]);
      } else {
        stops.push([
          stopKey,
          makeStyleValue(prop, stopValue, null, false),
        ]);
      }
    }

    this.payload.stops = stops;
  }
}

function resolveImage (imageURL) {
  let resolved = imageURL;

  if (typeof imageURL === 'number') { // required from JS, local file resolve it's asset filepath
    const res = resolveAssetSource(imageURL) || {};

    // we found a local uri
    if (res.uri) {
      resolved = res.uri;
    }
  }

  return resolved;
}

function makeStyleValue (prop, value, extras = {}, shouldMarkAsStyle = true) {
  let item;

  // search for any extras
  const extraData = Object.assign({}, styleExtras[prop], extras);

  if (MapboxStyleSheet.isFunctionStyleItem(value)) {
    item = value;
    item.processStops(prop);
  } else if (styleMap[prop] === StyleTypes.Transition) {
    item = new MapStyleTransitionItem(value.duration, value.delay, extraData);
  } else if (styleMap[prop] === StyleTypes.Color) {
    item = new MapStyleColorItem(processColor(value), extraData);
  } else if (styleMap[prop] === StyleTypes.Translation) {
    if (Array.isArray(value)) {
      item = new MapStyleTranslationItem(value[0], value[1], extraData);
    } else {
      item = new MapStyleTranslationItem(value.x, value.y, extraData); // supports object based API
    }
  } else if (styleMap[prop] === StyleTypes.Image) {
    item = new MapStyleConstantItem(resolveImage(value), {
      image: true,
      shouldAddImage: typeof value === 'number', // required from JS, tell native code to add image to map style
      ...extraData,
    });
  } else {
    item = new MapStyleConstantItem(value, extraData);
  }

  return item.toJSON(shouldMarkAsStyle);
}

class MapboxStyleSheet {
  static create (userStyles, depth = 0) {
    const styleProps = Object.keys(userStyles);
    let style = {};

    for (let styleProp of styleProps) {
      const userStyle = userStyles[styleProp];

      if (MapboxStyleSheet.isStyleItem(userStyle)) {
        style[styleProp] = userStyle;
        continue;
      }

      if (!styleMap[styleProp] && depth === 0 && !isPrimitive(userStyle)) {
        style[styleProp] = MapboxStyleSheet.create(userStyle, depth + 1);
        continue;
      } else if (!styleMap[styleProp] || isUndefined(userStyle) || userStyle === null) {
        throw new Error(`Invalid Mapbox Style ${styleProp}`);
      }

      style[styleProp] = makeStyleValue(styleProp, userStyle);
    }

    return style;
  }

  static camera (stops, mode) {
    const stopNativeArray = [];
    const cameraZoomLevels = Object.keys(stops);

    for (let cameraZoomLevel of cameraZoomLevels) {
      const keyBridgeValue = new BridgeValue(cameraZoomLevel|0);

      stopNativeArray.push([
        keyBridgeValue.toJSON(),
        stops[cameraZoomLevel],
      ]);
    }

    return new MapStyleFunctionItem(
      StyleFunctionTypes.Camera,
      mode: mode,
      { stops: stopNativeArray },
    );
  }

  static source (stops, attributeName, mode) {
    const stopNativeArray = [];

    if (Array.isArray(stops)) {
      for (let stop of stops) {
        const keyBridgeValue = new BridgeValue(stop[0]);

        stopNativeArray.push([
          keyBridgeValue.toJSON(),
          stop[1],
        ]);
      }
    } else if (stops) {
      const stopKeys = Object.keys(stops);
      for (let stopKey of stopKeys) {
        const keyBridgeValue = new BridgeValue(stopKey);

        stopNativeArray.push([
          keyBridgeValue.toJSON(),
          stops[stopKey],
        ]);
      }
    }

    return new MapStyleFunctionItem(
      StyleFunctionTypes.Source,
      mode: mode,
      { stops: stopNativeArray, attributeName: attributeName },
    );
  }

  static composite (stops, attributeName, mode) {
    const stopNativeArray = [];
    const cameraZoomLevels = Object.keys(stops);

    for (let cameraZoomLevel of cameraZoomLevels) {
      const [propName, styleValue] = stops[cameraZoomLevel];
      const keyBridgeValue = new BridgeValue(cameraZoomLevel|0);

      stopNativeArray.push([
        keyBridgeValue.toJSON(),
        [propName, styleValue],
      ]);
    }

    return new MapStyleFunctionItem(
      StyleFunctionTypes.Composite,
      mode: mode,
      { stops: stopNativeArray, attributeName: attributeName },
    );
  }

  static isStyleItem (item) {
    return typeof item === 'object' && item.__MAPBOX_STYLE__ === true;
  }

  static isFunctionStyleItem (item) {
    if (item instanceof MapStyleFunctionItem) {
      return true;
    }
    const isStyleItem = MapboxStyleSheet.isStyleItem(item);
    return isStyleItem && item.type === StyleTypes.Function;
  }

  // helpers

  static identity (attrName) {
    return MapboxStyleSheet.source(null, attrName, MapboxGL.InterpolationMode.Identity);
  }
}

export default MapboxStyleSheet;
