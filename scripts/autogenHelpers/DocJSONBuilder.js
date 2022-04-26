const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const dir = require('node-dir');
const docgen = require('react-docgen');
const parseJsDoc = require('react-docgen/dist/utils/parseJsDoc').default;

const JSDocNodeTree = require('./JSDocNodeTree');

const COMPONENT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'javascript',
  'components',
);
const MODULES_PATH = path.join(__dirname, '..', '..', 'javascript', 'modules');

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'docs', 'docs.json');
const IGNORE_FILES = [
  'AbstractLayer',
  'AbstractSource',
  'NativeBridgeComponent',
];

const IGNORE_METHODS = ['setNativeProps'];

class DocJSONBuilder {
  constructor(styledLayers) {
    this._styledLayers = {};

    for (const styleLayer of styledLayers) {
      const ComponentName = pascelCase(styleLayer.name);
      this._styledLayers[
        ComponentName + (ComponentName === 'Light' ? '' : 'Layer')
      ] = styleLayer;
    }
  }

  get options() {
    return {
      match: /.js$/,
      shortName: true,
    };
  }

  isPrivateMethod(methodName = '') {
    return !methodName || methodName.charAt(0) === '_';
  }

  postprocess(component, name) {
    // Remove all private methods and parse examples from docblock

    if (!Array.isArray(component.methods)) {
      return;
    }

    component.name = name;

    // styles
    if (this._styledLayers[name] && this._styledLayers[name].properties) {
      component.styles = [];

      for (const prop of this._styledLayers[name].properties) {
        const docStyle = {
          name: prop.name,
          type: prop.type,
          values: [],
          minimum: prop.doc.minimum,
          maximum: prop.doc.maximum,
          units: prop.doc.units,
          default: prop.doc.default,
          description: prop.doc.description,
          requires: prop.doc.requires,
          disabledBy: prop.doc.disabledBy,
          allowedFunctionTypes: prop.allowedFunctionTypes || [],
          expression: prop.expression,
          transition: prop.transition,
        };

        if (prop.type === 'enum') {
          docStyle.values = Object.keys(prop.doc.values).map((value) => {
            return { value, doc: prop.doc.values[value].doc };
          });
        } else if (prop.type === 'array') {
          docStyle.type = `${docStyle.type}<${prop.value}>`;
        }

        component.styles.push(docStyle);
      }
    }

    function mapNestedProp(propMeta) {
      const result = {
        type: {
          name: propMeta.name,
          value: propMeta.value,
        },
        description: propMeta.description,
        required: propMeta.required,
      };
      if (propMeta.value) {
        result.type.value = propMeta.value;
      }
      return result;
    }

    function mapProp(propMeta, propName, array) {
      let result = {};
      if (!array) {
        result = {
          name: propName || 'FIX ME NO NAME',
          required: propMeta.required || false,
          type: (propMeta.type && propMeta.type.name) || 'FIX ME UNKNOWN TYPE',
          default: !propMeta.defaultValue
            ? 'none'
            : propMeta.defaultValue.value.replace(/\n/g, ''),
          description: propMeta.description || 'FIX ME NO DESCRIPTION',
        };
      } else {
        if (propName) {
          result.name = propName;
        }
        if (propMeta.required !== undefined) {
          result.required = propMeta.required;
        }
        result.type =
          (propMeta.type && propMeta.type.name) || 'FIX ME UNKNOWN TYPE';
        if (propMeta.defaultValue) {
          result.default = propMeta.defaultValue.value.replace(/\n/g, '');
        }
        if (propMeta.description) {
          result.description = propMeta.description;
        }
      }

      if (
        propMeta.type &&
        propMeta.type.name === 'arrayOf' &&
        propMeta.type.value
      ) {
        result.type = {
          name: 'array',
          value: mapProp(mapNestedProp(propMeta.type.value), undefined, true),
        };
      }

      if (propMeta.type && propMeta.type.name === 'func') {
        const jsdoc = parseJsDoc(propMeta.description);
        if (jsdoc && jsdoc.description) {
          result.description = jsdoc.description;
        }
        if (jsdoc && jsdoc.params && jsdoc.params.length > 0) {
          result.params = jsdoc.params;
        }
        if (jsdoc && jsdoc.returns) {
          result.returns = jsdoc.returns;
        }
      }
      if (
        propMeta.type &&
        propMeta.type.name === 'shape' &&
        propMeta.type.value
      ) {
        const type = propMeta.type.value;
        const value = Object.keys(type).map((_name) =>
          mapProp(mapNestedProp(type[_name]), _name, false),
        );
        result.type = { name: 'shape', value };
      }
      return result;
    }

    // props
    component.props = Object.keys(component.props).map((propName) => {
      const propMeta = component.props[propName];

      return mapProp(propMeta, propName, false);
    });

    // methods
    const privateMethods = [];
    for (const method of component.methods) {
      if (this.isPrivateMethod(method.name)) {
        privateMethods.push(method.name);
        continue;
      }

      if (method.docblock) {
        const examples = method.docblock
          .split('@')
          .filter((block) => block.startsWith('example'));
        method.examples = examples.map((example) =>
          example.substring('example'.length),
        );
      }
    }
    privateMethods.push(...IGNORE_METHODS);

    component.methods = component.methods.filter(
      (method) => !privateMethods.includes(method.name),
    );
  }

  generateReactComponentsTask(results, filePath) {
    return new Promise((resolve, reject) => {
      dir.readFiles(
        filePath,
        this.options,
        (err, content, fileName, next) => {
          if (err) {
            return reject(err);
          }

          fileName = fileName.replace('.js', '');
          if (IGNORE_FILES.includes(fileName)) {
            next();
            return;
          }

          results[fileName] = docgen.parse(content, undefined, undefined, {
            filename: fileName,
          });
          this.postprocess(results[fileName], fileName);

          next();
        },
        () => resolve(),
      );
    });
  }

  generateModulesTask(results, filePath) {
    return new Promise((resolve, reject) => {
      exec(
        `npx documentation build ${MODULES_PATH} -f json`,
        (err, stdout, stderr) => {
          if (err || stderr) {
            reject(err || stderr);
            return;
          }

          const modules = JSON.parse(stdout);
          for (const module of modules) {
            const node = new JSDocNodeTree(module);
            const name = `${module.name
              .charAt(0)
              .toLowerCase()}${module.name.substring(1)}`;

            results[name] = {
              name,
              description: node.getText(),
              props: [],
              styles: [],
              methods: node.getMethods(),
            };
          }

          resolve();
        },
      );
    });
  }

  generate() {
    this.generateModulesTask({}, MODULES_PATH);

    const results = {};

    const tasks = [
      this.generateReactComponentsTask(results, COMPONENT_PATH),
      this.generateModulesTask(results, MODULES_PATH),
    ];

    return Promise.all(tasks).then(() => {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
      return true;
    });
  }
}

module.exports = DocJSONBuilder;
