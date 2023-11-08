const path = require('path');

/** @type {string} */
const docSiteRootPath =
  process.env.DOCSITE_ROOT_PATH ||
  path.join(__dirname, '..', '..', '..', 'maps-docs');

/** @type {string} */
const mapsRootPath = path.join(__dirname, '..', '..');

/** @type {string} */
const examplesJSONPath = path.join(mapsRootPath, 'docs', 'examples.json');

/** @type {string} */
const docsJSONPath = path.join(mapsRootPath, 'docs', 'docs.json');

/** @type {string} */
const docScreenshotsPath = path.join(docSiteRootPath, 'examples-screenshots');

/** @type {string} */
const screenshotsJSONPath = path.join(docScreenshotsPath, 'screenshots.json');

module.exports = {
  docSiteRootPath,
  mapsRootPath,
  examplesJSONPath,
  docsJSONPath,
  docScreenshotsPath,
  screenshotsJSONPath,
};
