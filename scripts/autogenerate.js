require('./autogenHelpers/globals');

const fs = require('fs');
const path = require('path');

const ejs = require('ejs');

const {execSync} = require('child_process');

const prettier = require('prettier');

const styleSpecJSON = require('../style-spec/v8.json');

const DocJSONBuilder = require('./autogenHelpers/DocJSONBuilder');
const MarkdownBuilder = require('./autogenHelpers/MarkdownBuilder');

function readIosVersion() {
  const podspecPath = path.join(
    __dirname,
    '..',
    'rnmapbox-maps.podspec',
  );
  const lines = fs.readFileSync(podspecPath, 'utf8').split('\n');
  const mapboxLineRegex = /^\s*rnMapboxMapsDefaultMapboxVersion\s*=\s*'~>\s+(\d+\.\d+)(\.\d+)?'$/;
  const mapboxLine = lines.filter(i => mapboxLineRegex.exec(i))[0];

  const mapboxGLLineRegex = /^\s*rnMapboxMapsDefaultMapboxGLVersion\s*=\s*'~>\s+(\d+\.\d+)(\.\d+)?'$/;
  const mapboxGLLine = lines.filter(i => mapboxGLLineRegex.exec(i))[0];
  return {
    v10: `${mapboxLineRegex.exec(mapboxLine)[1]}.0`,
    gl: `${mapboxLineRegex.exec(mapboxLine)[1]}.0`
  };
}

function readAndroidVersion() {
  const buildGradlePath = path.join(
    __dirname,
    '..',
    'android',
    'rctmgl',
    'build.gradle',
  );
  const lines = fs.readFileSync(buildGradlePath, 'utf8').split('\n');
  const mapboxGLLineRegex = /^\s+implementation\s+'com.mapbox.mapboxsdk:mapbox-android-sdk:(\d+\.\d+\.\d+)'$/;
  const mapboxGLLine = lines.filter(i => mapboxGLLineRegex.exec(i))[0];
  const mapboxV10LineRegex = /^\s+implementation\s+'com.mapbox.maps:android:(\d+\.\d+\.\d+)'$/;
  const mapboxV10Line = lines.filter(i => mapboxV10LineRegex.exec(i))[0];
  return {
    gl: mapboxGLLineRegex.exec(mapboxGLLine)[1],
    v10: mapboxV10LineRegex.exec(mapboxV10Line)[1],
  }
}

if (!styleSpecJSON) {
  console.log(
    'Could not find style spec, try running "yarn run fetch:style:spec"',
  );
  process.exit(1);
}

const layers = [];
const androidVersion = readAndroidVersion();
const iosVersion = readIosVersion();

const TMPL_PATH = path.join(__dirname, 'templates');

const outputToExample = false;
const OUTPUT_EXAMPLE_PREFIX = [
  '..',
  'example',
  'node_modules',
  '@react-native-mapbox-gl',
  'maps',
];
const OUTPUT_PREFIX = outputToExample ? OUTPUT_EXAMPLE_PREFIX : ['..'];

const IOS_OUTPUT_PATH = path.join(__dirname, ...OUTPUT_PREFIX, 'ios', 'RCTMGL');
const IOS_V10_OUTPUT_PATH = path.join(__dirname, ...OUTPUT_PREFIX, 'ios', 'RCTMGL-v10');

const ANDROID_OUTPUT_PATH = path.join(
  __dirname,
  ...OUTPUT_PREFIX,
  'android',
  'rctmgl',
  'src',
  'main',
  'java',
  'com',
  'mapbox',
  'rctmgl',
  'components',
  'styles',
);

const ANDROID_V10_OUTPUT_PATH = path.join(
  __dirname,
  ...OUTPUT_PREFIX,
  'android',
  'rctmgl',
  'src',
  'main',
  'java-v10',
  'com',
  'mapbox',
  'rctmgl',
  'components',
  'styles',
);


const JS_OUTPUT_PATH = path.join(
  __dirname,
  ...OUTPUT_PREFIX,
  'javascript',
  'utils',
);

getSupportedLayers(Object.keys(styleSpecJSON.layer.type.values)).forEach(
  ({layerName, support})  => {
    layers.push({
      name: layerName,
      properties: getPropertiesForLayer(layerName),
      props: {
        gl: getPropertiesForLayer(layerName, 'gl'),
        v10: getPropertiesForLayer(layerName, 'v10'),
      },
      support
    });
  },
);

// add light as a layer
layers.push({
  name: 'light', 
  properties: getPropertiesForLight(),
  props: {
    gl: getPropertiesForLight('gl'),
    v10: getPropertiesForLight('v10'),
  },
  support: {gl: true, v10: true}
});

function getPropertiesForLight(only) {
  const lightAttributes = styleSpecJSON.light;

  const lightProps = getSupportedProperties(lightAttributes, only).map(attrName => {
    return Object.assign({}, buildProperties(lightAttributes, attrName), {
      allowedFunctionTypes: [],
    });
  });

  return lightProps;
}

function getPropertiesForLayer(layerName, only) {
  const paintAttributes = styleSpecJSON[`paint_${layerName}`];
  const layoutAttributes = styleSpecJSON[`layout_${layerName}`];

  const paintProps = getSupportedProperties(paintAttributes, only).map(attrName => {
    const prop = buildProperties(paintAttributes, attrName);

    // overrides
    if (['line-width'].includes(attrName)) {
      prop.allowedFunctionTypes = ['camera'];
    }

    return prop;
  });

  const layoutProps = getSupportedProperties(layoutAttributes, only).map(attrName => {
    const prop = buildProperties(layoutAttributes, attrName);

    // overrides
    if (
      [
        'line-join',
        'text-max-width',
        'text-letter-spacing',
        'text-anchor',
        'text-justify',
        'text-font',
      ].includes(attrName)
    ) {
      prop.allowedFunctionTypes = ['camera'];
    }

    return prop;
  });

  return layoutProps.concat(paintProps);
}

function getSupportedLayers(layerNames) {
  const layerMap = styleSpecJSON.layer.type.values;

  const supportedLayers = [];
  for (const layerName of layerNames) {
    const layer = layerMap[layerName];
    const support = getAttributeSupport(layer['sdk-support']);

    if (
      (support.basic.v10.android && support.basic.v10.ios) || 
      (support.basic.gl.android && support.basic.gl.ios)
      ) {
      supportedLayers.push({layerName, support: {
        v10: (support.basic.v10.android && support.basic.v10.ios),
        gl: (support.basic.gl.android && support.basic.gl.ios)
      }});
    }
  }

  return supportedLayers;
}

function getSupportedProperties(attributes, only) {
  return Object.keys(attributes).filter(attrName =>
    isAttrSupported(attributes[attrName], only),
  );
}

function buildProperties(attributes, attrName) {
  return {
    name: camelCase(attrName),
    doc: {
      default: attributes[attrName].default,
      minimum: attributes[attrName].minimum,
      maximum: attributes[attrName].maximum,
      units: attributes[attrName].units,
      description: formatDescription(attributes[attrName].doc),
      requires: getRequires(attributes[attrName].requires),
      disabledBy: getDisables(attributes[attrName].requires),
      values: attributes[attrName].values,
    },
    type: attributes[attrName].type,
    value: attributes[attrName].value,
    image: isImage(attrName, attributes[attrName].type),
    translate: isTranslate(attrName),
    transition: attributes[attrName].transition,
    expression: attributes[attrName].expression,
    expressionSupported:
      Object.keys(attributes[attrName].expression || {}).length > 0,
    support: getAttributeSupport(attributes[attrName]['sdk-support']),
    allowedFunctionTypes: getAllowedFunctionTypes(attributes[attrName]),
  };
}

function formatDescription(description) {
  const words = description.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word.includes('-')) {
      words[i] = camelCase(word);
    }
  }

  const formattedDescription = words.join(' ');
  return formattedDescription;
}

function getRequires(requiredItems) {
  const items = [];

  if (!requiredItems) {
    return items;
  }

  for (const item of requiredItems) {
    if (typeof item === 'string') {
      items.push(camelCase(item, '-'));
    }
  }

  return items;
}

function getDisables(disabledItems) {
  const items = [];

  if (!disabledItems) {
    return items;
  }

  for (const item of disabledItems) {
    if (item['!']) {
      items.push(camelCase(item['!'], '-'));
    }
  }

  return items;
}

function isImage(attrName, type) {
  return (
    attrName.toLowerCase().indexOf('pattern') !== -1 ||
    attrName.toLowerCase().indexOf('image') !== -1 ||
    type === "resolvedImage"
  );
}

function isTranslate(attrName) {
  return attrName.toLowerCase().indexOf('translate') !== -1;
}

function isAttrSupported(attr, only) {
  const support = getAttributeSupport(attr['sdk-support']);
  if (only != null) {
    return support.basic[only].android && support.basic[only].ios;
  }
  return (support.basic.gl.android && support.basic.gl.ios) || (support.basic.v10.android && support.basic.v10.ios);
}

function getAttributeSupport(sdkSupport) {
  const support = {
    basic: {gl: {android: false, ios: false}, v10: {android: false, ios: false}},
    data: {gl: {android: false, ios: false}, v10: {android: false, ios: false}}
  };

  const basicSupport = sdkSupport && sdkSupport['basic functionality'];
  if (basicSupport && basicSupport.android) {
    support.basic.gl.android = isVersionGTE(androidVersion.gl, basicSupport.android);
    support.basic.v10.android = isVersionGTE(androidVersion.v10, basicSupport.android);
  }
  if (basicSupport && basicSupport.ios) {
    support.basic.gl.ios = isVersionGTE(iosVersion.gl, basicSupport.ios);
    support.basic.v10.ios = isVersionGTE(iosVersion.v10, basicSupport.ios);
  }

  const dataDrivenSupport = sdkSupport && sdkSupport['data-driven styling'];
  if (dataDrivenSupport && dataDrivenSupport.android) {
    support.data.gl.android = isVersionGTE(
      androidVersion.gl,
      dataDrivenSupport.android,
    );
    support.data.v10.android = isVersionGTE(
      androidVersion.v10,
      dataDrivenSupport.android,
    );
  }
  if (dataDrivenSupport && dataDrivenSupport.ios) {
    support.data.gl.ios = isVersionGTE(iosVersion.gl, dataDrivenSupport.ios);
    support.data.v10.ios = isVersionGTE(iosVersion.v10, dataDrivenSupport.ios);
  }

  if (support.data.v10.ios !== true || support.data.v10.android !== true) {
    support.data.v10.ios = false;
    support.data.v10.android = false;
  }
  if (support.data.gl.ios !== true || support.data.gl.android !== true) {
    support.data.gl.ios = false;
    support.data.gl.android = false;
  }

  return support;
}

function isVersionGTE(version, otherVersion) {
  const v = +version
    .split('.')
    .map(i => String(i).padStart(3, '0'))
    .join('');
  const ov = +otherVersion
    .split('.')
    .map(i => String(i).padStart(3, '0'))
    .join('');
  return v >= ov;
}

function getAllowedFunctionTypes(paintAttr) {
  const allowedFunctionTypes = [];

  if (paintAttr['zoom-function']) {
    allowedFunctionTypes.push('camera');
  }

  if (paintAttr['property-function']) {
    allowedFunctionTypes.push('source');
    allowedFunctionTypes.push('composite');
  }

  return allowedFunctionTypes;
}

async function generate() {
  const templateMappings = [
    {
      input: path.join(TMPL_PATH, 'RCTMGLStyle.h.ejs'),
      output: path.join(IOS_OUTPUT_PATH, 'RCTMGLStyle.h'),
      only: 'gl',
    },
    {
      input: path.join(TMPL_PATH, 'index.d.ts.ejs'),
      output: path.join(IOS_OUTPUT_PATH, 'index.d.ts'),
    },
    {
      input: path.join(TMPL_PATH, 'RCTMGLStyle.m.ejs'),
      output: path.join(IOS_OUTPUT_PATH, 'RCTMGLStyle.m'),
      only: 'gl',
    },
    {
      input: path.join(TMPL_PATH, 'RCTMGLStyle.swift.ejs'),
      output: path.join(IOS_V10_OUTPUT_PATH, 'RCTMGLStyle.swift'),
      only: 'v10',
    },
    {
      input: path.join(TMPL_PATH, 'RCTMGLStyleFactory.java.ejs'),
      output: path.join(ANDROID_OUTPUT_PATH, 'RCTMGLStyleFactory.java'),
      only: 'gl',
    },
    {
      input: path.join(TMPL_PATH, 'RCTMGLStyleFactoryv10.java.ejs'),
      output: path.join(ANDROID_V10_OUTPUT_PATH, 'RCTMGLStyleFactory.java'),
      only: 'v10',
    },
    {
      input: path.join(TMPL_PATH, 'styleMap.js.ejs'),
      output: path.join(JS_OUTPUT_PATH, 'styleMap.js'),
    },
  ];
  const outputPaths = templateMappings.map(m => m.output);

  // autogenerate code
  templateMappings.forEach(({input, output, only}) => {
    const filename = output.split('/').pop();
    console.log(`Generating ${filename}`);
    const tmpl = ejs.compile(fs.readFileSync(input, 'utf8'), {strict: true});
    
    function filterOnly(layers, only) {
      if (only != null) {
        let result = layers.filter((e) => (e.support[only])).map((e) => ({...e, properties: e.props[only]}));
        return result;
      } else {
        return layers;
      }
    }
    
    let results = tmpl({layers: filterOnly(layers, only)});
    if (filename.endsWith('ts')) {
      results = prettier.format(results, {filepath: filename});
    }
    fs.writeFileSync(output, results);
  });

  // autogenerate docs
  const docBuilder = new DocJSONBuilder(layers);
  const markdownBuilder = new MarkdownBuilder();
  await docBuilder.generate();
  await markdownBuilder.generate();

  // Check if any generated files changed
  try {
    execSync(`git diff --exit-code docs/ ${outputPaths.join(' ')}`);
  } catch (error) {
    console.error(
      '\n\nThere are unstaged changes in the generated code. ' +
        'Please add them to your commit.\n' +
        'If you would really like to exlude them, run "git commit -n" to skip.\n\n',
    );
    process.exit(1);
  }
}

generate();
