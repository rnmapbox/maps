/** Counts the fixture's magenta puck pixels inside the map, excluding surrounding UI. */
const fs = require('fs');
const { PNG } = require('pngjs');

const [input, bounds] = process.argv.slice(2);
const frame = JSON.parse(bounds);
const screen = PNG.sync.read(fs.readFileSync(input));
// The fixture's map fills the screen width, as in visual.e2e.js's captureMap.
const scale = screen.width / frame.width;
const left = Math.max(0, Math.round(frame.x * scale));
const top = Math.max(0, Math.round(frame.y * scale));
const right = Math.min(
  screen.width,
  Math.round((frame.x + frame.width) * scale),
);
const bottom = Math.min(
  screen.height,
  Math.round((frame.y + frame.height) * scale),
);
let magenta = 0;
for (let y = top; y < bottom; y++) {
  for (let x = left; x < right; x++) {
    const i = (y * screen.width + x) * 4;
    if (
      screen.data[i] > 220 &&
      screen.data[i + 1] < 40 &&
      screen.data[i + 2] > 220
    ) {
      magenta += 1;
    }
  }
}
process.stdout.write(String(magenta));
