import fs from 'fs';

import MapboxGL, { Style } from '../src';
import StyleImportConfig from '../example/src/examples/V11/StyleImportConfig';
import UserLocationUpdates from '../example/src/examples/UserLocation/UserLocationUpdates';

console.log(
  ' [***] => Hello World!',
  StyleImportConfig.title,
  StyleImportConfig.tags,
);

const rootDir = '.';

const allexamples = {
  V11: [{ StyleImportConfig }],
  'User Location': [{ UserLocationUpdates }],
};

describe('Public Interface', () => {
  it('should contain all expected components and utils', () => {});

  // enumerate all examples
  var result = {};

  Object.keys(allexamples).forEach((key) => {
    const skey = key.replaceAll(' ', '_');
    console.log('skey', skey);
    const data = allexamples[key];
    result[skey] = [];
    data.forEach((item) => {
      const name = Object.keys(item)[0];
      const { title, tags, docs } = item[name];

      const extensions = ['js', 'jsx', 'ts', 'tsx'];
      const path = `${rootDir}/example/src/examples/${key}/${name}`;
      var fullPath = null;
      extensions.forEach((ext) => {
        const actPath = `${rootDir}/example/src/examples/${key.replaceAll(
          ' ',
          '',
        )}/${name}.${ext}`;
        console.log("actPath", actPath);
        if (fs.existsSync(actPath)) {
          fullPath = actPath;
        }
      });
      result[skey].push({ title, tags, docs, name, fullPath });
    });
  });

  fs.writeFileSync(`${rootDir}/docs/examples.json`, JSON.stringify(result));

  console.log(' [***] => result', JSON.stringify(result));
});
