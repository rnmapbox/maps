const fs = require('fs');
const path = require('path');

const ejs = require('ejs');

const TMPL_PATH = path.join(__dirname, '..', 'templates');
const TMPL_FILE = fs.readFileSync(
  path.join(TMPL_PATH, 'component.md.ejs'),
  'utf8',
);

class MarkdownBuilder {
  generateComponentFile(docJSON, componentName) {
    const tmpl = ejs.compile(TMPL_FILE, { strict: true });
    const fileContents = tmpl({ component: docJSON[componentName] });
    fs.writeFileSync(
      path.join(__dirname, '..', '..', 'docs', `${componentName}.md`),
      fileContents,
    );
  }

  generate() {
    const docJSONFile = fs.readFileSync(
      path.join(__dirname, '..', '..', 'docs', 'docs.json'),
      'utf8',
    );
    const docJSON = JSON.parse(docJSONFile);
    const componentPaths = Object.keys(docJSON);

    for (let componentPath of componentPaths) {
      this.generateComponentFile(docJSON, componentPath);
    }

    console.log('Markdown is finish generating');
  }
}

module.exports = MarkdownBuilder;
