import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import styleSpecJSON from '../../style-spec/v8.json' assert { type: 'json' };
import * as url from 'url';

import prettier from 'prettier';
import prettierrc from '../../.prettierrc.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { camelCase } from './globals.mjs';

function readIosVersion() {
  const podspecPath = path.join(__dirname, '..', '..', 'rnmapbox-maps.podspec');
  const lines = fs.readFileSync(podspecPath, 'utf8').split('\n');
  const mapboxLineRegex =
    /^\s*rnMapboxMapsDefaultMapboxVersion\s*=\s*'~>\s+(\d+\.\d+)(\.\d+)?'$/;
  const mapboxLine = lines.filter((i) => mapboxLineRegex.exec(i))[0];

  return {
    v10: `${mapboxLineRegex.exec(mapboxLine)[1]}.0`,
    v11: '11.0.0',
  };
}

function readAndroidVersion() {
  const buildGradlePath = path.join(__dirname, '..', '..', 'android', 'build.gradle');
  const lines = fs.readFileSync(buildGradlePath, 'utf8').split('\n');
  const mapboxV10LineRegex =
    /^\s*def\s+defaultMapboxMapsVersion\s+=\s+"(\d+\.\d+\.\d+)"$/;
  const mapboxV10Line = lines.filter((i) => mapboxV10LineRegex.exec(i))[0];
  return {
    v10: mapboxV10LineRegex.exec(mapboxV10Line)[1],
    v11: '11.0.0',
  };
}

if (!styleSpecJSON) {
  console.log(
    'Could not find style spec, try running "yarn run fetch:style:spec"',
  );
  process.exit(1);
}

const androidVersion = readAndroidVersion();
const iosVersion = readIosVersion();

const TMPL_PATH = path.join(__dirname, '..', 'templates');


const OUTPUT_PREFIX = ['..', '..'];

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


/**
 * @param {string[]|undefined} only
 */
function getPropertiesFor(kind, only) {
  const attributes = styleSpecJSON[kind];

  const props = getSupportedProperties(attributes, only).map((attrName) => {
    return Object.assign({}, buildProperties(attributes, attrName, null, kind), {
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
      const prop = buildProperties(paintAttributes, attrName, 'paint', layerName);

      // overrides
      if (['line-width'].includes(attrName)) {
        prop.allowedFunctionTypes = ['camera'];
      }

      return prop;
    },
  );

  /**
   * @params {string[]|undefined} only
   */
  const layoutProps = getSupportedProperties(layoutAttributes, only).map(
    (attrName) => {
      const prop = buildProperties(layoutAttributes, attrName, 'layout', layerName);

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

    if (layerName === 'model') {
      support.basic.v10.android = true;
      support.basic.v10.ios = true;
    }
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

/**
 * @param {string[]|null} only 
 */
function getSupportedProperties(attributes, only) {
  return Object.keys(attributes).filter((attrName) =>
    isAttrSupported(attrName, attributes[attrName], only),
  );
}

/**
 * 
 * @param {*} attributes 
 * @param {string} attrName 
 * @param {'paint' | 'layout' | null} type 
 * @param {string} layerName
 * @returns 
 */
function buildProperties(attributes, attrName, type, layerName) {
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
    mbx: {
      name: attrName,
      namespace: type,
      fullName: type ? `${type}-${layerName}-${attrName}` : attrName,
    },
    type: attributes[attrName].type,
    value: attributes[attrName].value,
    image: isImage(attrName, attributes[attrName].type),
    translate: isTranslate(attrName),
    transition: attributes[attrName].transition,
    expression: attributes[attrName].expression,
    expressionSupported:
      Object.keys(attributes[attrName].expression || {}).length > 0,
    support: _fixPropSupport(getAttributeSupport(attributes[attrName]['sdk-support']), attrName),
    allowedFunctionTypes: getAllowedFunctionTypes(attributes[attrName]),
  };
}

function _fixPropSupport(support, attrName) {
  /* fill-extrusion-rounded-roof is not supported on v10 */
  if (attrName === 'fill-extrusion-rounded-roof') {
    support.basic.v10.android = false;
    support.basic.v10.ios = false;
  } else if (['model-id', 'model-scale', 'model-rotation'].includes(attrName)) {
    support.basic.v10.android = true;
    support.basic.v10.ios = true;
  }
  return support;
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

const UnsupportedProperties = [
  'hillshade-emissive-strength' // should be supported in v11 according to specs but it's not on ios 11.0.0.rc2
]

/**
 * @param {string[]|undefined} only 
 */
function isAttrSupported(name, attr, only) {
  if (UnsupportedProperties.includes(name)) {
    return false
  }
  const support = getAttributeSupport(attr['sdk-support']);
  if (attr.private === true) {
    return false;
  }
  if (only != null) {
    return only.find(o => (support.basic[o].android && support.basic[o].ios)) != null;
  }
  return support.basic.v10.android && support.basic.v10.ios;
}

function getAttributeSupport(sdkSupport) {
  const support = {
    basic: {
      v10: { android: false, ios: false },
      v11: { android: false, ios: false }
    },
    data: {
      v10: { android: false, ios: false },
      v11: { android: false, ios: false }
    },
  };

  const basicSupport = sdkSupport && sdkSupport['basic functionality'];
  if (basicSupport && basicSupport.android) {
    support.basic.v10.android = isVersionGTE(
      androidVersion.v10,
      basicSupport.android,
    );
    support.basic.v11.android = isVersionGTE(
      androidVersion.v11,
      basicSupport.android,
    )
  }
  if (basicSupport && basicSupport.ios) {
    support.basic.v10.ios = isVersionGTE(iosVersion.v10, basicSupport.ios);
    support.basic.v11.ios = isVersionGTE(iosVersion.v11, basicSupport.ios);
  }

  const dataDrivenSupport = sdkSupport && sdkSupport['data-driven styling'];
  if (dataDrivenSupport && dataDrivenSupport.android) {
    support.data.v10.android = isVersionGTE(
      androidVersion.v10,
      dataDrivenSupport.android,
    );
    support.data.v11.android = isVersionGTE(
      androidVersion.v11,
      dataDrivenSupport.android,
    );
  }
  if (dataDrivenSupport && dataDrivenSupport.ios) {
    support.data.v10.ios = isVersionGTE(iosVersion.v10, dataDrivenSupport.ios);
    support.data.v11.ios = isVersionGTE(iosVersion.v11, dataDrivenSupport.ios);
  }

  if (support.data.v10.ios !== true || support.data.v10.android !== true) {
    support.data.v10.ios = false;
    support.data.v10.android = false;
  }

  if (support.data.v11.ios !== true || support.data.v11.android !== true) {
    support.data.v11.ios = false;
    support.data.v11.android = false;
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

export function getLayers() {
  const layers = [];

  getSupportedLayers(Object.keys(styleSpecJSON.layer.type.values)).forEach(
    ({ layerName, support }) => {
      layers.push({
        name: layerName,
        properties: getPropertiesForLayer(layerName),
        props: {
          v10: getPropertiesForLayer(layerName, ['v10']),
          v11: getPropertiesForLayer(layerName, ['v11']),
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
      v10: getPropertiesFor('light', ['v10','v11']),
    },
    support: { v10: true },
  });
  
  // add atmosphere as a layer
  layers.push({
    name: 'atmosphere',
    properties: getPropertiesFor('fog'),
    props: {
      v10: removeTransitionsOnV10Before1070(getPropertiesFor('fog', ['v10','v11'])),
    },
    support: { v10: true },
  });
  
  // add terrain as a layer
  layers.push({
    name: 'terrain',
    properties: getPropertiesFor('terrain'),
    props: {
      v10: getPropertiesFor('terrain', ['v10'])
        .filter(({ name }) => name !== 'source')
        .map((i) => ({ ...i, transition: false })),
    },
    support: { v10: true },
  });

  return layers;
}

export default function generateCodeWithEjs(layers) {
  const templateMappings = [
    /*{
      input: path.join(TMPL_PATH, 'index.d.ts.ejs'),
      output: path.join(IOS_OUTPUT_PATH, 'index.d.ts'),
    },*/
    {
      input: path.join(TMPL_PATH, 'MapboxStyles.ts.ejs'),
      output: path.join(JS_OUTPUT_PATH, 'MapboxStyles.d.ts'),
      only: ['v10', 'v11'],
    },
    {
      input: path.join(TMPL_PATH, 'RNMBXStyle.swift.ejs'),
      output: path.join(IOS_V10_OUTPUT_PATH, 'RNMBXStyle.swift'),
      only: ['v10', 'v11'],
    },
    {
      input: path.join(TMPL_PATH, 'RNMBXStyleFactoryv10.kt.ejs'),
      output: path.join(ANDROID_V10_OUTPUT_PATH, 'RNMBXStyleFactory.kt'),
      only: ['v10', 'v11'],
    },
    {
      input: path.join(TMPL_PATH, 'styleMap.ts.ejs'),
      output: path.join(JS_OUTPUT_PATH, 'styleMap.ts'),
      only: ['v10', 'v11'],
    },
  ];
  const outputPaths = templateMappings.map((m) => m.output);

  // autogenerate code
  templateMappings.forEach(({ input, output, only }) => {
    const filename = output.split('/').pop();
    console.log(`Generating ${filename}`);
    const tmpl = ejs.compile(fs.readFileSync(input, 'utf8'), { strict: true });

    function concatuniq(propsList) {
      let result = [];
      let has = new Set();
      for (let list of propsList) {
        for (let item of list) {
          if (!has.has(item.name)) {
            result.push(item);
            has.add(item.name);
          }
        }
      }
      return result;
    }
    /**
     * @param {string[]} only 
     */
    function filterOnly(layers, only) {
      if (only != null) {
        let result = layers
          .filter((e) => only.find((v) => e.support[v]))
          .map((e) => ({ ...e, properties: concatuniq(only.map(o => e.props[o] || [])) }));
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
  return outputPaths;
}