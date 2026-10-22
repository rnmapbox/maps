/**
 * @file node cropTop.js <in.png> <out.png> <top> <screenWidth>
 * Writes <in.png> without its top <top> points, <screenWidth> being the screen width in points.
 */

const fs = require('fs');
const { PNG } = require('pngjs');

const [input, output, top, screenWidth] = process.argv.slice(2);

const screen = PNG.sync.read(fs.readFileSync(input));
const topPx = Math.round((Number(top) * screen.width) / Number(screenWidth));
const crop = new PNG({ width: screen.width, height: screen.height - topPx });
PNG.bitblt(screen, crop, 0, topPx, screen.width, crop.height, 0, 0);
fs.writeFileSync(output, PNG.sync.write(crop));
