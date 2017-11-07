const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const docJSON = require('../../docs/docs.json');

const TMPL_PATH = path.join(__dirname, '..', 'templates');
const TMPL_FILE = fs.readFileSync(path.join(TMPL_PATH, 'component.md.ejs'), 'utf8');

class MarkdownBuilder {
  constructor () {
    this.json = docJSON;
  }

  generateComponentFile (componentName) {
    const tmpl = ejs.compile(TMPL_FILE, { strict: true });
    const fileContents = tmpl({ component: this.json[componentName] });
    fs.writeFileSync(path.join(__dirname, '..', '..', 'docs',  `${componentName}.md`), fileContents);
  }

  generate () {
    const componentPaths = Object.keys(this.json);

    for (let componentPath of componentPaths) {
      this.generateComponentFile(componentPath);
    }

    console.log('Markdown is finish generating');
  }
}

module.exports = MarkdownBuilder;
