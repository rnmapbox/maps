import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import JSON5 from 'json5';

/**
 * This script generates code parts
 * scans for ${codepart-replace-start(..)} and ${codepart-replace-end} comments like bellow
 *   // @{codepart-replace-start(properties.codepart.ts)}
 *   some code repeated in multiple files
 *   // @{codepart-replace-end}
 *
 * This reads properties.codepart.ts file and replaces the code between the comments
 */

const codepartReplaceRegex =
  /^\s*\/\/\s*@{codepart-replace-start\((?<codepartargs>[^)]+)\)}.*$/;
const codepartReplaceEndRegex = /^\s*\/\/\s*@{codepart-replace-end}.*$/;

/**
 * 
 * @param {string} codepartFilePath
 * @param {string[]} args
 * @returns {string}
 */
function readCodePartEjs(codepartFilePath, args) {
  const codepartFileContent = fs.readFileSync(codepartFilePath, 'utf-8');
  return ejs.render(codepartFileContent, JSON5.parse(args[0]));
}

/**
 * 
 * @param {string} codepartFilePath
 * @param {string[]} args
 * @returns {string}
 */
function readCodePart(codepartFilePath, args) {
  if (codepartFilePath.endsWith('.ejs')) {
    return readCodePartEjs(codepartFilePath, args);
  } else {
    return fs.readFileSync(codepartFilePath, 'utf-8');
  }
}

/**
 *
 * @param {string} scanDirectory
 * @param {string} codepartDirectory
 * @param {string[]} extensions
 * @returns {string[]}
 */
export function codepartReplace(scanDirectory, codepartDirectory, extensions) {
  const result = [];
  // Get all files in the directory
  const files = fs.readdirSync(scanDirectory);

  // Iterate over each file
  files.forEach((file) => {
    const filePath = path.join(scanDirectory, file);

    // Check if the file has a matching extension
    const fileExtension = path.extname(file);
    if (!extensions.includes(fileExtension)) {
      return;
    }

    // Read the file content
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    let applied = false;
    // Remove lines between codepartReplaceRegex and codepartReplaceEndRegex
    let newFileContent = fileContent.replace(
      new RegExp(
        `(?<pre>${codepartReplaceRegex.source})([\\s\\S]*?)(?<post>${codepartReplaceEndRegex.source})`,
        'gm',
      ),
      (
        match,
        _pre,
        _fname,
        _body,
        _post,
        offset,
        string,
        { pre, post, codepartargs },
      ) => {
        applied = true;
        let [fname, ...args] = codepartargs.split(',');
        const codepartFilePath = path.join(codepartDirectory, fname);
        const codepartFileContent = readCodePart(codepartFilePath, args);
        if (!codepartFileContent.endsWith('\n')) {
          throw new Error(
            `codepart file ${codepartFilePath} doesn't ends with newline`,
          );
        }
        return `${pre}\n${codepartFileContent}${post}`;
      },
    );

    // Write the modified content back to the file
    if (applied && fileContent !== newFileContent) {
      console.log(' => codepart updated applied to:', filePath);
      fs.writeFileSync(filePath, newFileContent, 'utf-8');
      result.push(filePath);
    }
  });
  return result;
}

// Usage example
/*
const scanDirectory = '../tryout/codepart-replace/src';
const codepartDirectory = '../tryout/codepart-replace/codeparts';
const extensions = ['.ts', '.js']; // Example extensions to scan
codepartReplace(scanDirectory, codepartDirectory, extensions);

*/
