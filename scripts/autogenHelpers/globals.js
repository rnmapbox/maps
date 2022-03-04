/* eslint-disable func-names */
let iosPropNameOverrides = {};

const iosSpecOverrides = {
  'icon-allow-overlap': 'icon-allows-overlap',
  'icon-image': 'icon-image-name',
  'icon-ignore-placement': 'icon-ignores-placement',
  'icon-keep-upright': 'keeps-icon-upright',
  'icon-rotate': 'icon-rotation',
  'icon-size': 'icon-scale',
  'symbol-avoid-edges': 'symbol-avoids-edges',
  'text-allow-overlap': 'text-allows-overlap',
  'text-field': 'text',
  'text-font': 'text-font-names',
  'text-ignore-placement': 'text-ignores-placement',
  'text-justify': 'text-justification',
  'text-keep-upright': 'keeps-text-upright',
  'text-max-angle': 'maximum-text-angle',
  'text-max-width': 'maximum-text-width',
  'text-rotate': 'text-rotation',
  'text-size': 'text-font-size',
  'circle-pitch-scale': 'circle-scale-alignment',
  'circle-translate': 'circle-translation',
  'circle-translate-anchor': 'circle-translation-anchor',
  'fill-antialias': 'fill-antialiased',
  'fill-translate': 'fill-translation',
  'fill-translate-anchor': 'fill-translation-anchor',
  'fill-extrusion-translate': 'fill-extrusion-translation',
  'fill-extrusion-translate-anchor': 'fill-extrusion-translation-anchor',
  'raster-brightness-min': 'minimum-raster-brightness',
  'raster-brightness-max': 'maximum-raster-brightness',
  'raster-hue-rotate': 'raster-hue-rotation',
  'line-dasharray': 'line-dash-pattern',
  'line-translate': 'line-translation',
  'line-translate-anchor': 'line-translation-anchor',
  'icon-translate': 'icon-translation',
  'icon-translate-anchor': 'icon-translation-anchor',
  'text-translate': 'text-translation',
  'text-translate-anchor': 'text-translation-anchor',
  'raster-resampling': 'raster-resampling-mode',
  'text-writing-mode': 'text-writing-modes',
};

global.getValue = function(value, defaultValue) {
  if (!exists(value) || value === '') {
    return defaultValue;
  }
  return value;
};

global.exists = function(value) {
  return typeof value !== 'undefined' && value !== null;
};

global.camelCase = function(str, delimiter = '-') {
  const parts = str.split(delimiter);
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.substring(1);
    })
    .join('');
};

global.pascelCase = function(str, delimiter = '-') {
  const parts = str.split(delimiter);
  return parts
    .map((part, index) => {
      return part.charAt(0).toUpperCase() + part.substring(1);
    })
    .join('');
};

global.setLayerMethodName = function(layer, platform) {
  if (platform === 'ios') {
    return `${camelCase(layer.name)}Layer`;
  }
  return `set${pascelCase(layer.name)}LayerStyle`;
};

global.getLayerType = function(layer, platform) {
  const isIOS = platform === 'ios';

  switch (layer.name) {
    case 'fill':
      return isIOS ? 'MGLFillStyleLayer' : 'FillLayer';
    case 'fill-extrusion':
      return isIOS ? 'MGLFillExtrusionStyleLayer' : 'FillExtrusionLayer';
    case 'line':
      return isIOS ? 'MGLLineStyleLayer' : 'LineLayer';
    case 'symbol':
      return isIOS ? 'MGLSymbolStyleLayer' : 'SymbolLayer';
    case 'circle':
      return isIOS ? 'MGLCircleStyleLayer' : 'CircleLayer';
    case 'background':
      return isIOS ? 'MGLBackgroundStyleLayer' : 'BackgroundLayer';
    case 'raster':
      return isIOS ? 'MGLRasterStyleLayer' : 'RasterLayer';
    case 'heatmap':
      return isIOS ? 'MGLHeatmapStyleLayer' : 'HeatmapLayer';
    case 'hillshade':
      return isIOS ? 'MGLHillshadeStyleLayer' : 'HillshadeLayer';
    case 'light':
      return isIOS ? 'MGLLight' : 'Light';
    case 'sky':
      return isIOS ? 'MGLSkyLayer' : 'SkyLayer'
    default:
      throw new Error(
        `Is ${layer.name} a new layer? We should add support for it!`,
      );
  }
};

global.ifOrElseIf = function(index) {
  if (index === 0) {
    return 'if';
  }
  return '} else if';
};

global.iosStringArrayLiteral = function(arr) {
  return `@[@${arr.map((item) => `"${item}"`).join(', @')}]`;
};

global.iosPropName = function(name) {
  if (name.indexOf('visibility') !== -1) {
    return 'visible';
  }
  if (iosPropNameOverrides[name]) {
    return iosPropNameOverrides[name];
  }
  return name;
};

global.iosV10PropName = function(name) {
  return name;
}

global.iosPropMethodName = function(layer, name) {
  if (name.indexOf('Visibility') !== -1) {
    return pascelCase(layer.name) + 'StyleLayer' + name;
  }
  return name;
};

global.androidInputType = function(type, value) {
  if (type === 'array' && value) {
    return `${androidInputType(value)}[]`;
  }

  switch (type) {
    case 'color':
      return 'Integer';
    case 'boolean':
      return 'Boolean';
    case 'number':
      return 'Float';
    default:
      return 'String';
  }
};

global.androidOutputType = function(type, value) {
  if (type === 'array' && value) {
    return `${androidOutputType(value)}[]`;
  }

  switch (type) {
    case 'color':
      return 'String';
    case 'boolean':
      return 'Boolean';
    case 'number':
      return 'Float';
    default:
      return 'String';
  }
};

global.androidGetConfigType = function(androidType, prop) {
  switch (androidType) {
    case 'Integer':
      return 'styleValue.getInt(VALUE_KEY)';
    case 'Float':
      return 'styleValue.getFloat(VALUE_KEY)';
    case 'Boolean':
      return 'styleValue.getBoolean(VALUE_KEY)';
    case 'Float[]':
      return 'styleValue.getFloatArray(VALUE_KEY)';
    case 'String[]':
      return 'styleValue.getStringArray(VALUE_KEY)';
    default:
      if (prop && prop.image) {
        return 'styleValue.getImageURI()';
      } else {
        return 'styleValue.getString(VALUE_KEY)';
      }
  }
};

global.jsStyleType = function(prop) {
  if (prop.type === 'color') {
    return 'StyleTypes.Color';
  }

  if (prop.type === 'enum') {
    return 'StyleTypes.Enum';
  }

  if (prop.type === 'string' && prop.image) {
    return 'StyleTypes.Image';
  }

  if (prop.type === 'resolvedImage') {
    return 'StyleTypes.Image';
  }

  if (prop.name.indexOf('Translate') !== -1) {
    return 'StyleTypes.Translation';
  }

  return 'StyleTypes.Constant';
};

global.jsDocPropRequires = function(prop) {
  if (!prop.doc.requires) {
    return;
  }

  let desc = '';
  for (let item of prop.doc.requires) {
    if (typeof item === 'string') {
      desc += item + ', ';
    }
  }

  return desc;
};

global.dtsInterfaceType = function(prop) {
  let propTypes = [];

  if (prop.name.indexOf('Translate') !== -1) {
    propTypes.push('TranslationProps');
  } else if (prop.type === 'color') {
    propTypes.push('string');
    // propTypes.push('ConstantPropType');
  } else if (prop.type === 'array') {
    switch (prop.value) {
      case 'number':
        propTypes.push('number[]');
        break;
      case 'boolean':
        propTypes.push('boolean[]');
        break;
      case 'string':
        propTypes.push('string[]');
      default:
        propTypes.push('any[]');
    }
    // propTypes.push('ConstantPropType');
  } else if (prop.type === 'number') {
    propTypes.push('number');

  } else if (prop.type === 'enum') {
    propTypes.push('any');
  } else {
    // images can be required which result in a number
    if (prop.image) {
      propTypes.push('number');
    }
    propTypes.push('string');
  }

  if (prop.allowedFunctionTypes && prop.allowedFunctionTypes.length) {
    propTypes.push('StyleFunctionProps');
  }

  if (propTypes.length > 1) {
    return `TransitionProps |
${propTypes.map((p) => startAtSpace(4, p)).join(' | ')},
${startAtSpace(2, '')}`;
  } else {
    return propTypes[0];
  }
};


global.jsDocReactProp = function(prop) {
  let propTypes = [];

  if (prop.type === 'color') {
    propTypes.push('PropTypes.string');
  } else if (prop.type === 'array') {
    switch (prop.value) {
      case 'number':
        propTypes.push('PropTypes.arrayOf(PropTypes.number)');
        break;
      case 'boolean':
        propTypes.push('PropTypes.arrayOf(PropTypes.bool)');
        break;
      case 'string':
        propTypes.push('PropTypes.arrayOf(PropTypes.string)');
      default:
        propTypes.push('PropTypes.array');
    }
  } else if (prop.type === 'number') {
    propTypes.push('PropTypes.number');
  } else if (prop.type === 'boolean') {
    propTypes.push('PropTypes.bool');
  } else if (prop.type === 'enum') {
    if (prop.doc.values) {
      propTypes.push(`PropTypes.oneOf([${Object.keys(prop.doc.values).map(v => `'${v}'`).join(', ')}])`);
    } else {
      propTypes.push('PropTypes.any');
    }
  } else {
    // images can be required which result in a number
    if (prop.image) {
      propTypes.push('PropTypes.number');
    }
    propTypes.push('PropTypes.string');
  }

  if (prop.expressionSupported && !propTypes.includes('PropTypes.array')) {
    propTypes.push('PropTypes.array');
  }

  if (propTypes.length > 1) {
    return `PropTypes.oneOfType([
${propTypes.map((p) => startAtSpace(4, p)).join(',\n')},
${startAtSpace(2, '])')}`;
  } else {
    return propTypes[0];
  }
};

global.startAtSpace = function(spaceCount, str) {
  let value = '';

  for (let i = 0; i < spaceCount; i++) {
    value += ' ';
  }

  return `${value}${str}`;
};

global.replaceNewLine = function(str) {
  if (str === undefined) {
    return undefined;
  }
  if (str === null) {
    return null;
  }
  return str.replace(/\n/g, '<br/>');
};

global.styleMarkdownTableRow = function(style) {
  return `| \`${style.name}\` | \`${style.type}\` | \`${style.requires.join(
    ', ',
  ) || 'none'}\` | \`${style.disabledBy.join(', ') ||
    'none'}\` | ${replaceNewLine(style.description)} |`;
};

global.methodMarkdownTableRow = function(method) {
  return method.params
    .map((param) => {
      return `| \`${param.name}\` | \`${(param.type && param.type.name) || 'n/a'}\` | \`${
        param.optional ? 'No' : 'Yes'
      }\` | ${replaceNewLine(param.description)} |`;
    })
    .join('\n');
};

function _propMarkdownTableRows(props, prefix = "") {
  return props
    .map((prop) => {
      let type = prop.type;
      if (typeof(type) === "object") {
        type = type.name;
      }
      let defaultValue = prop.default || '';
      let { description = '' } = prop;
      let result =  `| ${prefix}${prop.name} | \`${type}\` | \`${defaultValue}\` | \`${
        prop.required
      }\` | ${replaceNewLine(description)} |`;
      if (type == "shape") {
        result = `${result}\n${_propMarkdownTableRows(prop.type.value, `&nbsp;&nbsp;${prefix}`)}`
      }
      return result;
    })
    .join('\n');
};
global.propMarkdownTableRows = function (component) {
  return _propMarkdownTableRows(component.props, "");
}

global.getMarkdownMethodSignature = function(method) {
  const params = method.params
    .map((param, i) => {
      const isOptional = param.optional;

      let name = '';

      if (i !== 0) {
        name += ', ';
      }

      name += param.name;
      return isOptional ? `[${name}]` : name;
    })
    .join('');

  return `${method.name}(${params})`;
};

global.getMarkdownMethodExamples = function(method) {
  if (method.examples == null) {
    return null;
  }
  return method.examples
    .map((example) => {
      return `

\`\`\`javascript
${example.trim()}
\`\`\`

`;
    })
    .join('');
};

global.getStyleDefaultValue = function (style) {
  if (style.type === 'string' && style.default === '') {
    return 'empty string';
  } else if (style.type.includes('array')) {
    return `[${style.default}]`;
  } else {
    return style.default;
  }
}

Object.keys(iosSpecOverrides).forEach((propName) => {
  const camelCasePropName = camelCase(propName);
  const camelCasePropOverride = camelCase(iosSpecOverrides[propName]);
  iosPropNameOverrides[camelCasePropName] = camelCasePropOverride;
});
