/**
 * @file node update-doc-screenshots.js <captured-dir> <docs-screenshots-dir> <examples.json> <summary.md>
 * Copies the captured example screenshots that differ meaningfully into the doc site's
 * examples-screenshots folder, drops screenshots of removed examples, keeps screenshots.json
 * in sync and writes a markdown summary of what changed (empty if nothing did).
 *
 * excludeFromPercy examples differ by up to ~80% between runs (animations, timers), so they are only
 * replaced when new, when the screenshot size changed or with REFRESH_UNSTABLE=true.
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const [capturedDir, docsDir, examplesJSONPath, summaryPath] =
  process.argv.slice(2);

// The status bar can't be fully frozen (the location arrow comes and goes)
const IGNORE_TOP_FRACTION = 0.075;
const CHANNEL_TOLERANCE = 16;
const THRESHOLD = 0.005;
const refreshUnstable = process.env.REFRESH_UNSTABLE === 'true';

function diffFraction(aPath, bPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));
  if (a.width !== b.width || a.height !== b.height) {
    return null;
  }
  const top = Math.round(a.height * IGNORE_TOP_FRACTION);
  let differing = 0;
  for (let i = top * a.width * 4; i < a.data.length; i += 4) {
    for (let c = 0; c < 4; c++) {
      if (Math.abs(a.data[i + c] - b.data[i + c]) > CHANNEL_TOLERANCE) {
        differing++;
        break;
      }
    }
  }
  return differing / (a.width * (a.height - top));
}

const examples = JSON.parse(fs.readFileSync(examplesJSONPath, 'utf8'));
const screenshotsJSONPath = path.join(docsDir, 'screenshots.json');
const screenshots = JSON.parse(fs.readFileSync(screenshotsJSONPath, 'utf8'));

const changed = [];
const added = [];
const removed = [];
const missing = [];
const expected = new Set();

for (const { groupName, examples: groupExamples } of examples) {
  for (const { name, metadata } of groupExamples) {
    if (!metadata) {
      continue;
    }
    const key = `${groupName}/${name}`;
    expected.add(key);
    const captured = path.join(capturedDir, groupName, `${name}.png`);
    if (!fs.existsSync(captured)) {
      missing.push(key);
      continue;
    }
    const image = `examples-screenshots/${groupName}/${name}.png`;
    const dest = path.join(docsDir, groupName, `${name}.png`);
    const entry = screenshots[groupName]?.[name];
    if (entry && fs.existsSync(dest)) {
      const fraction = diffFraction(captured, dest);
      const unstable = metadata.excludeFromPercy && !refreshUnstable;
      if (fraction === null) {
        changed.push(`${key} (size changed)`);
      } else {
        const percent = `${(fraction * 100).toFixed(1)}%`;
        console.log(`${key}: ${percent}${unstable ? ' (unstable, kept)' : ''}`);
        if (unstable || fraction <= THRESHOLD) {
          continue;
        }
        changed.push(`${key} (${percent} of the pixels)`);
      }
    } else {
      added.push(key);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(captured, dest);
    screenshots[groupName] = screenshots[groupName] || {};
    screenshots[groupName][name] = { images: [image] };
  }
}

for (const [groupName, group] of Object.entries(screenshots)) {
  for (const [name, { images }] of Object.entries(group)) {
    if (expected.has(`${groupName}/${name}`)) {
      continue;
    }
    removed.push(`${groupName}/${name}`);
    for (const image of images) {
      fs.rmSync(path.join(docsDir, '..', image), { force: true });
    }
    delete group[name];
  }
  if (Object.keys(group).length === 0) {
    delete screenshots[groupName];
  }
}

const referenced = new Set(
  Object.values(screenshots).flatMap((group) =>
    Object.values(group).flatMap(({ images }) => images),
  ),
);
for (const file of fs.readdirSync(docsDir, { recursive: true })) {
  const image = path.posix.join('examples-screenshots', file);
  if (file.endsWith('.png') && !referenced.has(image)) {
    removed.push(`${file.slice(0, -'.png'.length)} (unreferenced file)`);
    fs.rmSync(path.join(docsDir, file));
  }
}

if (missing.length > 0) {
  console.log(`Not captured, kept as is: ${missing.join(', ')}`);
}

const sections = [
  ['Changed', changed],
  ['New', added],
  ['Removed', removed],
].filter(([, keys]) => keys.length > 0);

if (sections.length === 0) {
  fs.writeFileSync(summaryPath, '');
  console.log('No meaningful screenshot changes');
} else {
  fs.writeFileSync(screenshotsJSONPath, JSON.stringify(screenshots));
  const summary = sections
    .map(
      ([title, keys]) => `${title}:\n${keys.map((k) => `- ${k}`).join('\n')}`,
    )
    .join('\n\n');
  fs.writeFileSync(summaryPath, `${summary}\n`);
  console.log(summary);
}
