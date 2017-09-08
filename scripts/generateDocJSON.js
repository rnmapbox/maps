const docgen = require('react-docgen');
const dir = require('node-dir');
const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'javascript', 'components');
const OUTPUT_PATH = path.join(__dirname, '..', 'docs', 'docs.json');

class DocJSONBuilder {
  constructor (filePath) {
    this._filePath = filePath;
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

  postprocess (component) {
    // Remove all private methods and parse examples from docblock

    if (!Array.isArray(component.methods)) {
      return;
    }

    const privateMethods = [];
    for (let method of component.methods) {
      if (this.isPrivateMethod(method.name)) {
        privateMethods.push(method.name);
        continue;
      }

      const examples = method.docblock.split('@').filter((block) => block.startsWith('example'));
      method.examples = examples.map((example) => example.substring('example'.length));
    }

    component.methods = component.methods.filter((method) => !privateMethods.includes(method.name));
  }

  generate () {
    let results = {};

    dir.readFiles(this._filePath, this.options, (err, content, fileName, next) => {
      if (err) {
        throw err;
      }

      fileName = fileName.replace('.js', '');
      results[fileName] = docgen.parse(content);
      this.postprocess(results[fileName]);

      next();
    }, () => fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2)));
  }
}

const docJSONBuilder = new DocJSONBuilder(INPUT_PATH);
docJSONBuilder.generate();
