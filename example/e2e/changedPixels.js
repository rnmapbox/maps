/**
 * @file node changedPixels.js <a.png> <b.png> <top> <screenWidth>
 * Prints the number of pixels that differ between two screenshots, leaving out their top <top> points, <screenWidth> being the screen width in points.
 */

const fs = require('fs');
const { PNG } = require('pngjs');

const [aPath, bPath, top, screenWidth] = process.argv.slice(2);

const a = PNG.sync.read(fs.readFileSync(aPath));
const b = PNG.sync.read(fs.readFileSync(bPath));
if (a.width !== b.width || a.height !== b.height) {
  process.stdout.write(String(a.width * a.height));
  process.exit(0);
}
const topPx = Math.round((Number(top) * a.width) / Number(screenWidth));
const a32 = new Uint32Array(
  a.data.buffer,
  a.data.byteOffset,
  a.data.length / 4,
);
const b32 = new Uint32Array(
  b.data.buffer,
  b.data.byteOffset,
  b.data.length / 4,
);
let changed = 0;
for (let i = topPx * a.width; i < a32.length; i++) {
  if (a32[i] !== b32[i]) {
    changed++;
  }
}
process.stdout.write(String(changed));
