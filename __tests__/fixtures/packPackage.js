import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

// Build outside the checkout, then test the files selected by npm rather than
// stale lib output or Jest's @rnmapbox/maps source alias.
export function packPackage(targets = ['module', 'typescript']) {
  const projectRoot = path.resolve(__dirname, '../..');
  const consumerDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'rnmapbox-package-'),
  );
  const packageDir = path.join(consumerDir, 'node_modules/@rnmapbox/maps');
  const buildDir = path.join(consumerDir, 'build');
  const env = { ...process.env };
  delete env.npm_execpath;
  env.npm_config_cache = path.join(consumerDir, 'npm-cache');

  try {
    fs.mkdirSync(packageDir, { recursive: true });
    fs.mkdirSync(buildDir);
    for (const directory of ['src', 'plugin']) {
      fs.cpSync(
        path.join(projectRoot, directory),
        path.join(buildDir, directory),
        {
          recursive: true,
        },
      );
    }
    // Compile the plugin from source too; a checked-in build must not mask a
    // missing or broken published plugin.
    fs.rmSync(path.join(buildDir, 'plugin/build'), {
      recursive: true,
      force: true,
    });
    for (const file of [
      'package.json',
      'app.plugin.js',
      '.npmignore',
      'tsconfig.json',
      'tsconfig.build.json',
    ]) {
      fs.copyFileSync(path.join(projectRoot, file), path.join(buildDir, file));
    }
    fs.symlinkSync(
      path.join(projectRoot, 'node_modules'),
      path.join(buildDir, 'node_modules'),
      'junction',
    );

    execFileSync(
      process.execPath,
      [require.resolve('typescript/bin/tsc'), '--build', 'plugin'],
      { cwd: buildDir, env, timeout: 60000 },
    );
    const bob = require.resolve('react-native-builder-bob/bin/bob');
    for (const target of targets) {
      execFileSync(process.execPath, [bob, 'build', '--target', target], {
        cwd: buildDir,
        env,
        timeout: 60000,
      });
    }
    // npm 10 runs prepare even with --ignore-scripts. The real build targets
    // already ran above; prevent a second build (and npx/network access) only
    // in this disposable fixture. Keep exports and file selection unchanged.
    const manifestPath = path.join(buildDir, 'package.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    delete manifest.scripts.prepare;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const packed = JSON.parse(
      execFileSync(
        'npm',
        [
          'pack',
          '--ignore-scripts',
          '--offline',
          '--json',
          '--pack-destination',
          consumerDir,
        ],
        { cwd: buildDir, env, timeout: 30000, encoding: 'utf8' },
      ),
    );
    execFileSync('tar', [
      '-xzf',
      path.join(consumerDir, packed[0].filename),
      '--strip-components=1',
      '-C',
      packageDir,
    ]);

    return { consumerDir, packageDir, projectRoot };
  } catch (error) {
    fs.rmSync(consumerDir, { recursive: true, force: true });
    throw error;
  }
}
