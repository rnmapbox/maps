// GitHub Pages has no SPA fallback, so the web export gets a copy of its
// index.html at each example's path, e.g. Map/ShowMap/index.html.
// Usage: node scripts/web_route_pages.js <web export dir>
const fs = require('fs');
const path = require('path');

const exportDir = process.argv[2];
const indexHtml = path.join(exportDir, 'index.html');
const examples = require('../../docs/examples.json');

const routes = examples.flatMap(({ groupName, examples: groupExamples }) => [
  groupName,
  ...groupExamples.map(({ name }) => `${groupName}/${name}`),
]);

routes.forEach((route) => {
  const dir = path.join(exportDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(indexHtml, path.join(dir, 'index.html'));
});

console.log(`Copied ${indexHtml} to ${routes.length} routes`);
