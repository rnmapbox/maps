/**
 * Dumps examples.json to docs/examples.json from metadata in the examples in the example direcrory
 */
import path from 'path';
import fs from 'fs';

import * as SymbolCircleLayer from '../src/examples/SymbolCircleLayer';
import * as UserLocation from '../src/examples/UserLocation';
import * as Map from '../src/examples/Map';
import * as V10 from '../src/examples/V10';
import * as Annotations from '../src/examples/Annotations';
import * as FillRasterLayer from '../src/examples/FillRasterLayer';
import * as LineLayer from '../src/examples/LineLayer';
import * as Camera from '../src/examples/Camera';
import type {
  Examples,
  Example,
} from '../../scripts/autogenHelpers/examplesJsonSchema';
import {
  examplesJSONPath,
  mapsRootPath,
} from '../../scripts/autogenHelpers/docconfig.js';

jest.mock('../src/assets/scale-test-icon4.png', () => null, {
  virtual: true,
});

jest.mock('../src/assets/sportcar.glb', () => null, {
  virtual: true,
});

const allTests = {
  SymbolCircleLayer,
  UserLocation,
  Map,

  V10,
  Annotations,
  FillRasterLayer,
  LineLayer,
  Camera,
} as const;

const relExamplesPath = path.join('example', 'src', 'examples');
const examplesPath = path.join(mapsRootPath, relExamplesPath);

function getExampleFullPath(
  groupName: string,
  testName: string,
): { fullPath: string; relPath: string } {
  const extensions = ['js', 'jsx', 'ts', 'tsx'];
  const relPathBase = path.join(groupName, testName);

  const existingExamplePaths = extensions
    .map((ext) => ({
      relPath: `${relPathBase}.${ext}`,
      fullPath: path.join(relExamplesPath, `${relPathBase}.${ext}`),
    }))
    .filter(({ relPath, fullPath }) =>
      fs.existsSync(path.join(mapsRootPath, fullPath)),
    );
  if (existingExamplePaths.length === 0) {
    throw new Error(
      `Could not find example file for ${groupName}/${testName} - ${path.join(
        examplesPath,
        relPathBase,
      )}.*`,
    );
  }
  return existingExamplePaths[0];
}

describe('dump-examples-json', () => {
  it('examples are dumped outside the test', () => {
    expect(true).toBe(true);
  });
});

const exampleGroups: Examples = [];

type AllTestKeys = keyof typeof allTests;

const allTestKeys = Object.keys(allTests) as AllTestKeys[];

allTestKeys.forEach((groupName) => {
  const { metadata, ...tests } = allTests[groupName];
  const examples: Example[] = [];
  Object.entries(tests).forEach(([testName, test]) => {
    const { metadata: testMetadata } = test as unknown as {
      metadata?: Example['metadata'];
    };
    const { fullPath, relPath } = getExampleFullPath(groupName, testName);
    if (testMetadata) {
      examples.push({
        metadata: testMetadata,
        fullPath,
        relPath,
        name: testName,
      });
    }
  });

  exampleGroups.push({
    groupName,
    metadata,
    examples,
  });
});

fs.writeFileSync(
  examplesJSONPath,
  JSON.stringify(exampleGroups, null, 2),
  'utf8',
);
