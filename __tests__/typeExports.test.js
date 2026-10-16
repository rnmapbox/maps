import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import ts from 'typescript';

const legacyPaths = [
  '@rnmapbox/maps/src/utils/MapboxStyles',
  '@rnmapbox/maps/src/components/SymbolLayer',
  '@rnmapbox/maps/src/components/MapView',
  '@rnmapbox/maps/src/types/OnPressEvent',
];

const consumerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ESNext,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  esModuleInterop: true,
  types: ['react', 'geojson'],
};

const consumerSource = `
import type Mapbox from '@rnmapbox/maps';
import type {
  Expression, FilterExpression, SymbolLayerProps, SymbolLayerStyle,
  SymbolLayerStyleProps, RegionPayload, GestureSettings, MapLoadingErrorPayload,
  OnPressEvent, Translation, Transition,
} from '@rnmapbox/maps';
import type { Expression as LegacyExpression } from '@rnmapbox/maps/src/utils/MapboxStyles';
import type { Props as LegacySymbolLayerProps } from '@rnmapbox/maps/src/components/SymbolLayer';
import type { RegionPayload as LegacyRegionPayload } from '@rnmapbox/maps/src/components/MapView';
import type { OnPressEvent as LegacyOnPressEvent } from '@rnmapbox/maps/src/types/OnPressEvent';

type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;
export type CompatibleTypes = [
  Assert<Equal<Expression, LegacyExpression>>,
  Assert<Equal<Expression, Mapbox.Expression>>,
  Assert<Equal<FilterExpression, Expression>>,
  Assert<Equal<SymbolLayerProps, LegacySymbolLayerProps>>,
  Assert<Equal<SymbolLayerStyle, SymbolLayerStyleProps>>,
  Assert<Equal<RegionPayload, LegacyRegionPayload>>,
  Assert<Equal<OnPressEvent, LegacyOnPressEvent>>,
];

export const expression: Expression = ['get', 'myProp'];
export const symbol: SymbolLayerProps = { id: 'symbols', style: { textField: expression } };
export const gestures: GestureSettings = { panEnabled: false };
export const loadingError: MapLoadingErrorPayload = { error: 'Missing style', type: 'style' };
export const translation: Translation = [1, 2];
export const transition: Transition = { duration: 300, delay: 0 };

// @ts-expect-error Expressions must start with a known operator.
export const invalidExpression: Expression = ['unknown-operator'];
// @ts-expect-error Symbol layer props require an id.
export const invalidSymbol: SymbolLayerProps = { style: {} };
// @ts-expect-error Source press events include features, coordinates and a point.
export const invalidPress: OnPressEvent = {};
// @ts-expect-error Press features must be GeoJSON features.
export const invalidFeature: OnPressEvent['features'][number] = { type: 'wrong' };
// @ts-expect-error Symbol children must be React elements.
export const invalidChildren: SymbolLayerProps['children'] = 123;
`;

describe('Published type exports', () => {
  let consumerDir;
  let packageDir;

  beforeAll(() => {
    consumerDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'rnmapbox-type-exports-'),
    );
    packageDir = path.join(consumerDir, 'node_modules/@rnmapbox/maps');
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(path.join(consumerDir, 'index.ts'), consumerSource);

    const projectRoot = path.resolve(__dirname, '..');
    const buildDir = path.join(consumerDir, 'build');
    fs.mkdirSync(buildDir);
    fs.cpSync(path.join(projectRoot, 'src'), path.join(buildDir, 'src'), {
      recursive: true,
    });
    for (const file of [
      'package.json',
      'tsconfig.json',
      'tsconfig.build.json',
      'yarn.lock',
    ]) {
      fs.copyFileSync(path.join(projectRoot, file), path.join(buildDir, file));
    }
    fs.mkdirSync(path.join(buildDir, 'example'));
    fs.copyFileSync(
      path.join(projectRoot, 'example/package.json'),
      path.join(buildDir, 'example/package.json'),
    );
    fs.writeFileSync(
      path.join(buildDir, '.yarnrc.yml'),
      'nodeLinker: node-modules\n',
    );
    fs.symlinkSync(
      path.join(projectRoot, 'node_modules'),
      path.join(buildDir, 'node_modules'),
      'junction',
    );

    // Use the real build targets and package file selection, including Bob's
    // generated package metadata. Build outside the checkout to avoid stale
    // output and interference with other checks.
    const env = { ...process.env };
    delete env.npm_execpath;
    const bob = require.resolve('react-native-builder-bob/bin/bob');
    for (const target of ['module', 'typescript']) {
      execFileSync(process.execPath, [bob, 'build', '--target', target], {
        cwd: buildDir,
        env,
        timeout: 60000,
      });
    }
    const archive = path.join(consumerDir, 'package.tgz');
    execFileSync(
      process.execPath,
      [
        path.join(projectRoot, '.yarn/releases/yarn-3.6.1.cjs'),
        'pack',
        '--out',
        archive,
      ],
      { cwd: buildDir, env, timeout: 30000 },
    );
    execFileSync('tar', [
      '-xzf',
      archive,
      '--strip-components=1',
      '-C',
      packageDir,
    ]);

    // Resolve React and GeoJSON types as a consumer would, rather than letting
    // missing declaration dependencies degrade to any under skipLibCheck.
    for (const dependency of [
      '@types',
      'react',
      'react-native',
      'debounce',
      '@turf',
    ]) {
      fs.symlinkSync(
        path.join(projectRoot, 'node_modules', dependency),
        path.join(consumerDir, 'node_modules', dependency),
        'junction',
      );
    }
  }, 60000);

  afterAll(() => {
    if (consumerDir) {
      fs.rmSync(consumerDir, { recursive: true, force: true });
    }
  });

  it.each([[''], ['.native', '']])(
    'resolves public and legacy types with moduleSuffixes %j',
    (...moduleSuffixes) => {
      const program = ts.createProgram([path.join(consumerDir, 'index.ts')], {
        ...consumerOptions,
        moduleSuffixes,
      });
      const diagnostics = ts.getPreEmitDiagnostics(program);
      expect(
        diagnostics.map((diagnostic) =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        ),
      ).toEqual([]);
    },
  );

  it('includes the generated package metadata and export targets', () => {
    for (const output of ['module', 'typescript']) {
      expect(
        JSON.parse(
          fs.readFileSync(
            path.join(packageDir, 'lib', output, 'package.json'),
            'utf8',
          ),
        ),
      ).toEqual({ type: 'module' });
    }
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'),
    );
    expect(fs.existsSync(path.join(packageDir, manifest.main))).toBe(true);
    for (const entry of [
      '.',
      ...legacyPaths.map((name) => '.' + name.slice('@rnmapbox/maps'.length)),
    ]) {
      expect(
        fs.existsSync(path.join(packageDir, manifest.exports[entry].types)),
      ).toBe(true);
    }
  });

  it.each([
    '@rnmapbox/maps/src/specs/codegenUtils',
    '@rnmapbox/maps/src/components/NativeBridgeComponent',
  ])('keeps unrelated source path %s private', (specifier) => {
    const resolution = ts.resolveModuleName(
      specifier,
      path.join(consumerDir, 'index.ts'),
      consumerOptions,
      ts.sys,
    );
    expect(resolution.resolvedModule).toBeUndefined();
  });

  it.each(legacyPaths)(
    'does not add a Node runtime export for %s',
    (specifier) => {
      // Run real Node resolution, outside Jest's module resolver.
      const result = execFileSync(
        process.execPath,
        [
          '-e',
          `const consumerRequire = require('node:module').createRequire(process.argv[1]);
         try {
           consumerRequire.resolve(process.argv[2]);
           process.stdout.write('resolved');
         } catch (error) {
           process.stdout.write(error.code);
         }`,
          path.join(consumerDir, 'index.ts'),
          specifier,
        ],
        { encoding: 'utf8' },
      );
      expect(result).toBe('ERR_PACKAGE_PATH_NOT_EXPORTED');
    },
  );
});
