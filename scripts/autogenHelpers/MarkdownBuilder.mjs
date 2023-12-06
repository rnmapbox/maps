import fs from 'fs';
import path from 'path';
import * as url from 'url';

import { compile } from '@mdx-js/mdx';
import ejs from 'ejs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const docsRoot = path.join(__dirname, '..', '..', 'docs');
const exampleJSONPath = path.join(docsRoot, 'examples.json');

import * as globalFuncs from './globals.mjs';

Object.keys(globalFuncs).forEach((key) => {
  global[key] = globalFuncs[key];
});

async function checkMDX(code) {
  try {
    await compile(code);
  } catch (e) {
    const lines = code.split('\n');
    const { line, column } = e.place;

    console.error(lines[line-1]);
    console.error(' '.repeat(column-1) + '^');
    console.error(e.reason);
    throw e;
  }
  return true;
}

const TMPL_PATH = path.join(__dirname, '..', 'templates');
const TMPL_FILE = fs.readFileSync(
  path.join(TMPL_PATH, 'component.md.ejs'),
  'utf8',
);

class MarkdownBuilder {
  /**
   *
   * @param {string} destDirPath
   * @param {stirng} docJSON
   * @param {string} componentName
   * @param {string[]} tagLinks
   */
  async generateComponentFile(
    destDirPath,
    docJSON,
    componentName,
    tagLinks,
    options,
  ) {
    global.exampleTagLinks = tagLinks;
    global.docosaurus = !!options.docosaurus;
    const tmpl = ejs.compile(TMPL_FILE, {
      strict: true,
    });
    const fileContents = tmpl({ component: docJSON[componentName] });
    fs.writeFileSync(
      path.join(destDirPath, `${componentName}.md`),
      fileContents,
    );

    if (options.docosaurus) {
      await checkMDX(fileContents);
    }
  }

  parseExampleTagLinks() {
    try {
      const exampleJSONFile = fs.readFileSync(exampleJSONPath, 'utf8');
      const examplesJSON = JSON.parse(exampleJSONFile);

      const tagLinks = {};
      examplesJSON.forEach(({ groupName, examples }) => {
        examples.forEach(({ metadata, name /*, relPath, fullPath */ }) => {
          if (metadata) {
            const { /*docs, */ title, tags } = metadata;
            tags.forEach((tag) => {
              if (!tagLinks[tag]) {
                tagLinks[tag] = [];
              }
              tagLinks[tag].push({
                groupName,
                name,
                title,
              });
            });
          }
        });
      });
      return tagLinks;
    } catch (e) {
      console.log('??? Error in parseExampleTagLinks:', e);
      return {};
    }
  }

  /**
   * @param {string} destDirPath
   * @param {string} docsJsonPath
   * @param {{docosaurus?: boolean}?} options
   */
  async generate(docsJsonPath, destDirPath, options = {}) {
    const docJSONFile = fs.readFileSync(docsJsonPath, 'utf8');
    const docJSON = JSON.parse(docJSONFile);
    const componentPaths = Object.keys(docJSON);

    const tagLinks = this.parseExampleTagLinks();
    for (let componentPath of componentPaths) {
      await this.generateComponentFile(
        destDirPath,
        docJSON,
        componentPath,
        tagLinks,
        options,
      );
    }

    console.log('Markdown is finish generating');
  }
}

export default MarkdownBuilder;
