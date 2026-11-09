/**
 * @file Detox test environment that, on CI, snapshots the runner when a test or hook
 * fails, while the app is still in the failing state, into
 * artifacts/diagnostics/ (uploaded with the Detox artifacts).
 */

const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const DetoxCircusEnvironment = require('detox/runners/jest/testEnvironment');

const run = promisify(execFile);

const OUT_DIR = path.join(__dirname, '..', 'artifacts', 'diagnostics');
const MAX_CAPTURES = 3;

async function capture(file, cmd, args, timeout = 20000) {
  let text;
  try {
    const { stdout, stderr } = await run(cmd, args, {
      timeout,
      maxBuffer: 64 * 1024 * 1024,
    });
    text = stdout + stderr;
  } catch (e) {
    text = `${e.stdout || ''}${e.stderr || ''}\n${e.message}`;
  }
  fs.writeFileSync(file, `$ ${cmd} ${args.join(' ')}\n${text}`);
}

class DiagnosticsEnvironment extends DetoxCircusEnvironment {
  constructor(config, context) {
    super(config, context);
    this.captures = 0;
  }

  async handleTestEvent(event, state) {
    await super.handleTestEvent(event, state);
    if (
      process.env.CI &&
      (event.name === 'test_fn_failure' || event.name === 'hook_failure') &&
      this.captures < MAX_CAPTURES
    ) {
      this.captures += 1;
      const name = event.test?.name ?? event.hook?.type ?? 'unknown';
      await this.captureDiagnostics(
        `${path.basename(this.testPath, '.e2e.js')}-${this.captures}-${name}`,
      );
    }
  }

  async captureDiagnostics(label) {
    const dir = path.join(OUT_DIR, label.replace(/[^\w.-]+/g, '_'));
    fs.mkdirSync(dir, { recursive: true });
    const udid = process.env.DETOX_DEVICE_UDID;

    await Promise.all([
      // Host processes by CPU, including any simctl/applesimutils call Detox is stuck on
      capture(path.join(dir, 'ps.txt'), 'ps', [
        '-Ao',
        'pid,ppid,etime,pcpu,pmem,command',
        '-r',
      ]),
      capture(path.join(dir, 'vm_stat.txt'), 'vm_stat', []),
      // Connect/TLS timings from the runner, for map loads stuck on a style request
      capture(path.join(dir, 'curl-api.mapbox.com.txt'), 'curl', [
        '-sS',
        '-o',
        '/dev/null',
        '--max-time',
        '15',
        '-w',
        'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} http=%{http_code} ip=%{remote_ip}\n',
        'https://api.mapbox.com/',
      ]),
      udid &&
        capture(path.join(dir, 'simctl-list.txt'), 'xcrun', [
          'simctl',
          'list',
          'devices',
          'booted',
        ]),
    ]);
  }
}

module.exports = DiagnosticsEnvironment;
