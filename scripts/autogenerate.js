require('./autogenHelpers/globals');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ejs = require('ejs');
const prettier = require('prettier');

const prettierrc = require('../.prettierrc.js');
const styleSpecJSON = require('../style-spec/v8.json');

const DocJSONBuilder = require('./autogenHelpers/DocJSONBuilder');
const MarkdownBuilder = require('./autogenHelpers/MarkdownBuilder');

function readIosVersion() {
  const podspecPath = path.join(__dirname, '..', 'rnmapbox-maps.podspec');
  const lines = fs.readFileSync(podspecPath, 'utf8').split('\n');
  const mapboxLineRegex =
    /^\s*rnMapboxMapsDefaultMapboxVersion\s*=\s*'~>\s+(\d+\.\d+)(\.\d+)?'$/;
  const mapboxLine = lines.filter((i) => mapboxLineRegex.exec(i))[0];

  return {
    v10: `${mapboxLineRegex.exec(mapboxLine)[1]}.0`,
  };
}

function readAndroidVersion() {
  const buildGradlePath = path.join(__dirname, '..', 'android', 'build.gradle');
  const lines = fs.readFileSync(buildGradlePath, 'utf8').split('\n');
  const mapboxV10LineRegex =
    /^\s*def\s+defaultMapboxMapsVersion\s+=\s+"(\d+\.\d+\.\d+)"$/;
  const mapboxV10Line = lines.filter((i) => mapboxV10LineRegex.exec(i))[0];
  return {
    v10: mapboxV10LineRegex.exec(mapboxV10Line)[1],
  };
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

const IOS_V10_OUTPUT_PATH = path.join(
  __dirname,
  ...OUTPUT_PREFIX,
  'ios',
  'RNMBX',
);

const ANDROID_V10_OUTPUT_PATH = path.join(
  __dirname,
  ...OUTPUT_PREFIX,
  'android',
  'src',
  'main',
  'java',
  'com',
  'rnmapbox',
  'rnmbx',
  'components',
  'styles',
);

const JS_OUTPUT_PATH = path.join(__dirname, ...OUTPUT_PREFIX, 'src', 'utils');

getSupportedLayers(Object.keys(styleSpecJSON.layer.type.values)).forEach(
  ({ layerName, support }) => {
    layers.push({
      name: layerName,
      properties: getPropertiesForLayer(layerName),
      props: {
        v10: getPropertiesForLayer(layerName, 'v10'),
      },
      support,
    });
  },
);

// add light as a layer
layers.push({
  name: 'light',
  properties: getPropertiesFor('light'),
  props: {
    v10: getPropertiesFor('light', 'v10'),
  },
  support: { v10: true },
});

// add atmosphere as a layer
layers.push({
  name: 'atmosphere',
  properties: getPropertiesFor('fog'),
  props: {
    v10: removeTransitionsOnV10Before1070(getPropertiesFor('fog', 'v10')),
  },
  support: { v10: true },
});

// add terrain as a layer
layers.push({
  name: 'terrain',
  properties: getPropertiesFor('terrain'),
  props: {
    v10: getPropertiesFor('terrain', 'v10')
      .filter(({ name }) => name !== 'source')
      .map((i) => ({ ...i, transition: false })),
  },
  support: { v10: true },
});

function getPropertiesFor(kind, only) {
  const attributes = styleSpecJSON[kind];

  const props = getSupportedProperties(attributes, only).map((attrName) => {
    return Object.assign({}, buildProperties(attributes, attrName), {
      allowedFunctionTypes: [],
    });
  });

  return props;
}

function removeTransitionsOnV10Before1070(props) {
  let isv17orolder = isVersionGTE(iosVersion.v10, '10.7.0');

  return props.map((i) =>
    !isv17orolder ? { ...i, transition: false } : { ...i },
  );
}

function getPropertiesForLayer(layerName, only) {
  const paintAttributes = styleSpecJSON[`paint_${layerName}`];
  const layoutAttributes = styleSpecJSON[`layout_${layerName}`];

  const paintProps = getSupportedProperties(paintAttributes, only).map(
    (attrName) => {
      const prop = buildProperties(paintAttributes, attrName);

      // overrides
      if (['line-width'].includes(attrName)) {
        prop.allowedFunctionTypes = ['camera'];
      }

      return prop;
    },
  );

  const layoutProps = getSupportedProperties(layoutAttributes, only).map(
    (attrName) => {
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
    },
  );

  return layoutProps.concat(paintProps);
}

function getSupportedLayers(layerNames) {
  const layerMap = styleSpecJSON.layer.type.values;

  const supportedLayers = [];
  for (const layerName of layerNames) {
    const layer = layerMap[layerName];
    const support = getAttributeSupport(layer['sdk-support']);

    if (support.basic.v10.android && support.basic.v10.ios) {
      supportedLayers.push({
        layerName,
        support: {
          v10: support.basic.v10.android && support.basic.v10.ios,
        },
      });
    }
  }

  return supportedLayers;
}

function getSupportedProperties(attributes, only) {
  return Object.keys(attributes).filter((attrName) =>
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
    const docMatch = word.match(/^(.+)\]\((.+)\)(.*)$/);
    if (docMatch) {
      if (docMatch[2].startsWith('/')) {
        words[
          i
        ] = `${docMatch[1]}](https://docs.mapbox.com${docMatch[2]})${docMatch[3]}`;
      }
    } else {
      if (word.includes('-')) {
        words[i] = camelCase(word);
      }
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
    type === 'resolvedImage'
  );
}

function isTranslate(attrName) {
  return attrName.toLowerCase().indexOf('translate') !== -1;
}

function isAttrSupported(attr, only) {
  const support = getAttributeSupport(attr['sdk-support']);
  if (attr.private === true) {
    return false;
  }
  if (only != null) {
    return support.basic[only].android && support.basic[only].ios;
  }
  return support.basic.v10.android && support.basic.v10.ios;
}

function getAttributeSupport(sdkSupport) {
  const support = {
    basic: {
      v10: { android: false, ios: false },
    },
    data: {
      v10: { android: false, ios: false },
    },
  };

  const basicSupport = sdkSupport && sdkSupport['basic functionality'];
  if (basicSupport && basicSupport.android) {
    support.basic.v10.android = isVersionGTE(
      androidVersion.v10,
      basicSupport.android,
    );
  }
  if (basicSupport && basicSupport.ios) {
    support.basic.v10.ios = isVersionGTE(iosVersion.v10, basicSupport.ios);
  }

  const dataDrivenSupport = sdkSupport && sdkSupport['data-driven styling'];
  if (dataDrivenSupport && dataDrivenSupport.android) {
    support.data.v10.android = isVersionGTE(
      androidVersion.v10,
      dataDrivenSupport.android,
    );
  }
  if (dataDrivenSupport && dataDrivenSupport.ios) {
    support.data.v10.ios = isVersionGTE(iosVersion.v10, dataDrivenSupport.ios);
  }

  if (support.data.v10.ios !== true || support.data.v10.android !== true) {
    support.data.v10.ios = false;
    support.data.v10.android = false;
  }

  return support;
}

function isVersionGTE(version, otherVersion) {
  const v = +version
    .split('.')
    .map((i) => String(i).padStart(3, '0'))
    .join('');
  const ov = +otherVersion
    .split('.')
    .map((i) => String(i).padStart(3, '0'))
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
    /*{
      input: path.join(TMPL_PATH, 'index.d.ts.ejs'),
      output: path.join(IOS_OUTPUT_PATH, 'index.d.ts'),
    },*/
    {
      input: path.join(TMPL_PATH, 'MapboxStyles.ts.ejs'),
      output: path.join(JS_OUTPUT_PATH, 'MapboxStyles.d.ts'),
    },
    {
      input: path.join(TMPL_PATH, 'RNMBXStyle.swift.ejs'),
      output: path.join(IOS_V10_OUTPUT_PATH, 'RNMBXStyle.swift'),
      only: 'v10',
    },
    {
      input: path.join(TMPL_PATH, 'RNMBXStyleFactoryv10.kt.ejs'),
      output: path.join(ANDROID_V10_OUTPUT_PATH, 'RNMBXStyleFactory.kt'),
      only: 'v10',
    },
    {
      input: path.join(TMPL_PATH, 'styleMap.ts.ejs'),
      output: path.join(JS_OUTPUT_PATH, 'styleMap.ts'),
    },
  ];
  const outputPaths = templateMappings.map((m) => m.output);

  // autogenerate code
  templateMappings.forEach(({ input, output, only }) => {
    const filename = output.split('/').pop();
    console.log(`Generating ${filename}`);
    const tmpl = ejs.compile(fs.readFileSync(input, 'utf8'), { strict: true });

    function filterOnly(layers, only) {
      if (only != null) {
        let result = layers
          .filter((e) => e.support[only])
          .map((e) => ({ ...e, properties: e.props[only] }));
        return result;
      } else {
        return layers;
      }
    }

    let results = tmpl({ layers: filterOnly(layers, only) });
    if (filename.endsWith('ts')) {
      results = prettier.format(results, {
        ...prettierrc,
        filepath: filename,
      });
    }
    fs.writeFileSync(output, results);
  });

  // autogenerate expo plugin
  execSync('yarn build:plugin', { stdio: 'inherit' });
  outputPaths.push('plugin/build');

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
    const showDiff = true;
    if (showDiff) {
      console.log(`=> git diff docs/ ${outputPaths.join(' ')}`);
      execSync(`git diff docs/ ${outputPaths.join(' ')} | head -n 20`, {
        stdio: 'inherit',
      });
    }
    process.exit(1);
  }
}

generate();
