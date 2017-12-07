let iosPropNameOverrides = {};

const iosSpecOverrides = {
  "icon-allow-overlap": "icon-allows-overlap",
  "icon-image": "icon-image-name",
  "icon-ignore-placement": "icon-ignores-placement",
  "icon-keep-upright": "keeps-icon-upright",
  "icon-rotate": "icon-rotation",
  "icon-size": "icon-scale",
  "symbol-avoid-edges": "symbol-avoids-edges",
  "text-allow-overlap": "text-allows-overlap",
  "text-field": "text",
  "text-font": "text-font-names",
  "text-ignore-placement": "text-ignores-placement",
  "text-justify": "text-justification",
  "text-keep-upright": "keeps-text-upright",
  "text-max-angle": "maximum-text-angle",
  "text-max-width": "maximum-text-width",
  "text-rotate": "text-rotation",
  "text-size": "text-font-size",
  "circle-pitch-scale": "circle-scale-alignment",
  "circle-translate": "circle-translation",
  "circle-translate-anchor": "circle-translation-anchor",
  "fill-antialias": "fill-antialiased",
  "fill-translate": "fill-translation",
  "fill-translate-anchor": "fill-translation-anchor",
  "fill-extrusion-translate": "fill-extrusion-translation",
  "fill-extrusion-translate-anchor": "fill-extrusion-translation-anchor",
  "raster-brightness-min": "minimum-raster-brightness",
  "raster-brightness-max": "maximum-raster-brightness",
  "raster-hue-rotate": "raster-hue-rotation",
  "line-dasharray": "line-dash-pattern",
  "line-translate": "line-translation",
  "line-translate-anchor": "line-translation-anchor",
  "icon-translate": "icon-translation",
  "icon-translate-anchor": "icon-translation-anchor",
  "text-translate": "text-translation",
  "text-translate-anchor": "text-translation-anchor"
};

global.camelCase = function (str, delimiter = '-') {
  const parts = str.split(delimiter);
  return parts.map((part, index) => {
    if (index === 0) {
      return part;
    }
    return part.charAt(0).toUpperCase() + part.substring(1);
  }).join('');
};

global.pascelCase = function (str, delimiter = '-') {
  const parts = str.split(delimiter);
  return parts.map((part, index) => {
    return part.charAt(0).toUpperCase() + part.substring(1);
  }).join('');
};

global.setLayerMethodName = function (layer, platform) {
  if (platform === 'ios') {
    return `${camelCase(layer.name)}Layer`;
  }
  return `set${pascelCase(layer.name)}LayerStyle`;
};

global.getLayerType = function (layer, platform) {
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
    case 'light':
      return isIOS ? 'MGLLight' : 'Light';
    default:
      throw new Error(`Is ${layer.name} a new layer? We should add support for it!`);
  }
}

global.ifOrElseIf = function (index) {
  if (index === 0) {
    return 'if';
  }
  return '} else if';
};

global.iosStringArrayLiteral = function (arr) {
  return `@[@${arr.map((item) => `"${item}"`).join(', @')}]`;
}

global.iosPropName = function (name) {
  if (name.indexOf('visibility') !== -1) {
    return 'visible';
  }
  if (iosPropNameOverrides[name]) {
    return iosPropNameOverrides[name];
  }
  return name;
}

global.iosPropMethodName = function (layer, name) {
  if (name.indexOf('Visibility') !== -1) {
    return pascelCase(layer.name) + 'StyleLayer' + name;
  }
  return name;
}

global.androidInputType = function (type, value) {
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
}

global.androidOutputType = function (type, value) {
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
}

global.androidGetConfigType = function (androidType) {
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
      return 'styleValue.getString(VALUE_KEY)';
  }
}

global.jsStyleType = function (prop) {
  if (prop.type === 'color') {
    return 'StyleTypes.Color';
  }

  if (prop.type === 'string' && prop.image) {
    return 'StyleTypes.Image';
  }

  if (prop.name.indexOf('Translate') !== -1) {
    return 'StyleTypes.Translation';
  }

  return 'StyleTypes.Constant';
}

global.jsDocPropRequires = function (prop) {
  if (!prop.doc.requires) {
    return;
  }

  let desc = '';
  for (let item of prop.doc.requires) {
    if (typeof item === 'string') {
      desc += (item + ', ');
    }
  }

  return desc;
}

global.jsDocReactProp = function (prop) {
  let propTypes = [];

  if (prop.name.indexOf('Translate') !== -1) {
    propTypes.push('TranslationPropType');
  } else if (prop.type === 'color') {
    propTypes.push('PropTypes.string');
    propTypes.push('ConstantPropType');
  } else if (prop.type === 'array') {
    switch (prop.value) {
      case 'number':
        propTypes.push('PropTypes.arrayOf(PropTypes.number)');
        break;
      case 'boolean':
        propTypes.push('PropTypes.arrayOf(PropTypes.bool)');
        break;
      case 'string':
        propTypes.push('PropTypes.arrayOf(PropTypes.string)')
      default:
        propTypes.push('PropTypes.array');
    }
    propTypes.push('ConstantPropType');
  } else if (prop.type === 'number') {
    propTypes.push('PropTypes.number');
    propTypes.push('ConstantPropType');
  } else if (prop.type === 'enum') {
    propTypes.push('PropTypes.any');
  } else {
    // images can be required which result in a number
    if (prop.name.indexOf('Image') !== -1 || prop.name.indexOf('Pattern') !== -1) {
      propTypes.push('PropTypes.number');
    }
    propTypes.push('PropTypes.string');
    propTypes.push('ConstantPropType');
  }

  if (prop.allowedFunctionTypes && prop.allowedFunctionTypes.length) {
    propTypes.push('StyleFunctionPropType');
  }

  if (propTypes.length > 1) {
    return `PropTypes.oneOfType([
${propTypes.map((p) => startAtSpace(4, p)).join(',\n')},
${startAtSpace(2, '])')}`;
  } else {
    return propTypes[0];
  }
}

global.startAtSpace = function (spaceCount, str) {
  let value = '';

  for (let i = 0; i < spaceCount; i++) {
    value += ' ';
  }

  return `${value}${str}`;
}

global.replaceNewLine = function (str) {
  return str.replace(/\n/g, '<br/>');
}

global.styleMarkdownTableRow = function (style) {
  return `| \`${style.name}\` | \`${style.type}\` | \`${style.requires.join(', ') || 'none'}\` | \`${style.disabledBy.join(', ') || 'none'}\` | ${replaceNewLine(style.description)} |`;
}

global.methodMarkdownTableRow = function (method) {
  return method.params.map((param) => {
    return `| \`${param.name}\` | \`${param.type.name}\` | \`${param.optional ? 'No' : 'Yes'}\` | ${replaceNewLine(param.description)} |`;
  }).join('\n');
}

global.propMarkdownTableRows = function (component) {
  return component.props.map((prop) => {
    return `| ${prop.name} | \`${prop.type}\` | \`${prop.default}\` | \`${prop.required}\` | ${replaceNewLine(prop.description)} |`;
  }).join('\n');
}

global.getMarkdownMethodSignature = function (method) {
  const params = method.params.map((param, i) => {
    const isOptional = param.optional;

    let name = '';

    if (i !== 0) {
      name += ', ';
    }

    name += param.name;
    return isOptional ? `[${name}]` : name;
  }).join('');

  return `${method.name}(${params})`;
}

global.getMarkdownMethodExamples = function (method) {
  return method.examples.map((example) => {
    return `

\`\`\`javascript
${example.trim()}
\`\`\`

`;
  }).join('');
}

Object.keys(iosSpecOverrides).forEach((propName) => {
  const camelCasePropName = camelCase(propName);
  const camelCasePropOverride = camelCase(iosSpecOverrides[propName]);
  iosPropNameOverrides[camelCasePropName] = camelCasePropOverride;
});
