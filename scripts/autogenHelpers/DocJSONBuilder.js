const docgen = require('react-docgen');
const doctrine = require("doctrine");
const dir = require('node-dir');
const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', '..', 'javascript', 'components');
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'docs', 'docs.json');
const IGNORE_FILES = ['AbstractLayer'];

class DocJSONBuilder {
  constructor (styledLayers) {
    this._styledLayers = {};

    for (let styleLayer of styledLayers) {
      const ComponentName = pascelCase(styleLayer.name);
      this._styledLayers[ComponentName + (ComponentName === 'Light' ? '' : 'Layer')] = styleLayer;
    }

    this._filePath = INPUT_PATH;
  }

  get options () {
    return {
      match: /.js$/,
      shortName: true,
    };
  }

  isPrivateMethod (methodName = '') {
    return !methodName || methodName.charAt(0) === '_';
  }

  postprocess (component, name) {
    // Remove all private methods and parse examples from docblock

    if (!Array.isArray(component.methods)) {
      return;
    }

    component.name = name;

    // styles
    if (this._styledLayers[name] && this._styledLayers[name].properties) {
      component.styles = [];
      for (let prop of this._styledLayers[name].properties) {
        component.styles.push({
          name: prop.name,
          type: prop.type,
          description: prop.doc.description,
          requires: prop.doc.requires,
          disabledBy: prop.doc.disabledBy,
        });
      }
    }

    // props
    component.props = Object.keys(component.props).map((propName) => {
      const propMeta = component.props[propName];

      return {
        name: propName || 'FIX ME NO NAME',
        required: propMeta.required || false,
        type: propMeta.type.name || 'FIX ME UNKNOWN TYPE',
        default: !propMeta.defaultValue ? 'none' : propMeta.defaultValue.value.replace(/\n/g, ''),
        description: propMeta.description || 'FIX ME NO DESCRIPTION',
      };
    });

    // methods
    const privateMethods = [];
    for (let method of component.methods) {
      if (this.isPrivateMethod(method.name)) {
        privateMethods.push(method.name);
        continue;
      }

      if (method.docblock) {
        const examples = method.docblock.split('@').filter((block) => block.startsWith('example'));
        method.examples = examples.map((example) => example.substring('example'.length));
      }
    }

    component.methods = component.methods.filter((method) => !privateMethods.includes(method.name));
  }

  generate () {
    let results = {};

    return new Promise((resolve, reject) => {
      dir.readFiles(this._filePath, this.options, (err, content, fileName, next) => {
        if (err) {
          return reject(err);
        }

        fileName = fileName.replace('.js', '');
        if (IGNORE_FILES.includes(fileName)) {
          next();
          return;
        }

        results[fileName] = docgen.parse(content);
        this.postprocess(results[fileName], fileName);

        next();
      }, () => {
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
        resolve();
      });
    });
  }
}

module.exports = DocJSONBuilder;
