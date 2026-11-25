// Dev server ports for this checkout (the main checkout or a git worktree).
//
// Every service has a default port. When a command starts servers and a
// default is taken (typically by the same server of another checkout), the
// services it starts move up together by one "slot": slot N = default +
// N * 100. So several checkouts can run their dev servers and tests at the
// same time, and whoever starts first gets the defaults.
//
// Where the services of this checkout run is recorded in `.dev-ports.json`
// (gitignored), so commands started later (Playwright, a second terminal)
// find them. `with-ports.mjs` picks the ports and passes them to a command
// as `{service}` tokens and env vars. `getPort()` reads one back: env first,
// then the record of a running service, then the default.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

/** service -> default port */
const SERVICES = {
  examples: 5555, // examples: React test app (next dev / http-server)
  examplesVue: 5556, // examples: Vue test app (vite / http-server)
  vuePlayground: 5557, // vue-playground
  examplesAngular: 5558, // examples: Angular test app (ng serve / http-server)
  testRunner: 5599, // examples: test-runner sidecar of the test index
  wwwBuild: 3000, // www: `serve-build` (the static export)
  www: 3001, // www: docs site (next dev)
  data: 3002, // www: `serve:data`, the local data server
  devtoolsWww: 3456, // devtools-www
};

const SLOT_STEP = 100;
const MAX_SLOT = 40;
const ROOT = fs.realpathSync(path.join(__dirname, '..'));
const RECORD_FILE = path.join(ROOT, '.dev-ports.json');

/** `devtoolsWww` -> `INFINITE_PORT_DEVTOOLS_WWW` */
function envName(service) {
  return `INFINITE_PORT_${service
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase()}`;
}

function portsForSlot(slot) {
  return Object.fromEntries(
    Object.entries(SERVICES).map(([name, port]) => [
      name,
      port + slot * SLOT_STEP,
    ]),
  );
}

function assertService(service) {
  if (!(service in SERVICES)) {
    throw new Error(
      `Unknown dev service "${service}". Known: ${Object.keys(SERVICES).join(
        ', ',
      )}`,
    );
  }
}

function isAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

/** `{ slot, services: { name: { port, pid } } }`, or null */
function readRecord() {
  try {
    const record = JSON.parse(fs.readFileSync(RECORD_FILE, 'utf8'));
    if (!Number.isInteger(record.slot)) return null;
    record.services ??= {};
    return record;
  } catch {
    return null;
  }
}

/** service -> port, for the services of this checkout that are running */
function runningServices(record = readRecord()) {
  const running = {};
  for (const [service, entry] of Object.entries(record?.services ?? {})) {
    if (service in SERVICES && isAlive(entry.pid)) {
      running[service] = entry.port;
    }
  }
  return running;
}

/**
 * Port of one service: its env var (set by with-ports.mjs), then where this
 * checkout's service is running, then the port in the last used slot.
 */
function getPort(service) {
  assertService(service);
  const fromEnv = Number(process.env[envName(service)]);
  if (fromEnv) return fromEnv;
  const record = readRecord();
  return (
    runningServices(record)[service] ?? portsForSlot(record?.slot ?? 0)[service]
  );
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(300);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen({ port }, () => server.close(() => resolve(true)));
  });
}

async function isPortFree(port) {
  if (
    (await canConnect(port, '127.0.0.1')) ||
    (await canConnect(port, '::1'))
  ) {
    return false;
  }
  return canListen(port);
}

function lsof(args) {
  return execFileSync('lsof', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function listenerPids(port) {
  try {
    return lsof(['-nP', '-t', `-iTCP:${port}`, '-sTCP:LISTEN'])
      .split('\n')
      .filter(Boolean)
      .map(Number);
  } catch (error) {
    // lsof exits with 1 when nothing matches; ENOENT: no lsof on this machine
    return error.code === 'ENOENT' ? null : [];
  }
}

/** The checkout (folder with a `.git` entry) that `dir` is in */
function checkoutOf(dir) {
  for (let current = dir; ; current = path.dirname(current)) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    if (current === path.dirname(current)) return null;
  }
}

/**
 * Whether the process listening on `port` was started in this checkout:
 * true / false, or null when that can't be found out (no lsof).
 */
function isListenerOurs(port) {
  const pids = listenerPids(port);
  if (pids === null) return null;
  if (!pids.length) return false;
  return pids.every((pid) => {
    try {
      const cwd = lsof(['-a', '-p', String(pid), '-d', 'cwd', '-Fn'])
        .split('\n')
        .find((line) => line.startsWith('n'));
      return !!cwd && checkoutOf(cwd.slice(1)) === ROOT;
    } catch {
      return false;
    }
  });
}

async function stopListener(port) {
  for (const pid of listenerPids(port) ?? []) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {}
  }
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await isPortFree(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

/**
 * Picks the ports for a command.
 *
 * - `listen`: services the command starts. Their ports must be free: the
 *   first slot where all of them are is used.
 * - `replace`: like `listen`, but a server of this checkout that already
 *   runs on the port is stopped first (restart).
 * - `use`: services the command talks to. A running one of this checkout is
 *   used where it is. Otherwise its port in the slot must not belong to
 *   another checkout's server, so that this checkout can start its own there.
 *
 * Slots of the services this checkout already runs are tried first, so that
 * servers started by separate commands end up together. Returns the port of
 * every service and records the ones that are being started.
 */
async function allocatePorts({ listen = [], replace = [], use = [] } = {}) {
  [...listen, ...replace, ...use].forEach(assertService);
  const starting = [...new Set([...listen, ...replace])];
  const record = readRecord();
  const running = runningServices(record);
  // A service that is being (re)started doesn't count as running
  for (const service of starting) delete running[service];

  const runningSlots = Object.entries(running).map(([service, port]) =>
    Math.round((port - SERVICES[service]) / SLOT_STEP),
  );
  const candidates = new Set([
    ...runningSlots,
    ...Array.from({ length: MAX_SLOT + 1 }, (_, slot) => slot),
  ]);

  for (const slot of candidates) {
    if (slot < 0 || slot > MAX_SLOT) continue;
    const ports = portsForSlot(slot);
    let usable = true;
    for (const service of starting) {
      if (await isPortFree(ports[service])) continue;
      const restart =
        replace.includes(service) &&
        isListenerOurs(ports[service]) === true &&
        (await stopListener(ports[service]));
      if (!restart) {
        usable = false;
        break;
      }
    }
    for (const service of usable ? use : []) {
      if (service in running || starting.includes(service)) continue;
      if (
        !(await isPortFree(ports[service])) &&
        isListenerOurs(ports[service]) === false
      ) {
        usable = false;
        break;
      }
    }
    if (!usable) continue;

    const services = {};
    for (const [service, port] of Object.entries(running)) {
      services[service] = record.services[service];
      ports[service] = port;
    }
    for (const service of starting) {
      services[service] = { port: ports[service], pid: process.pid };
    }
    fs.writeFileSync(
      RECORD_FILE,
      JSON.stringify({ slot, services }, null, 2) + '\n',
    );
    return { slot, ports };
  }
  throw new Error(`No free dev ports for: ${starting.join(', ')}`);
}

/** The ports as they are now, without picking any: env, running services, last slot */
function currentPorts() {
  return Object.fromEntries(
    Object.keys(SERVICES).map((service) => [service, getPort(service)]),
  );
}

/** `NEXT_PUBLIC_BASE_URL` as set in the env files of `dir` (.env.local first) */
function baseUrlFromEnvFiles(dir) {
  for (const name of ['.env.local', '.env']) {
    let text;
    try {
      text = fs.readFileSync(path.join(dir, name), 'utf8');
    } catch {
      continue;
    }
    const match = text.match(/^\s*NEXT_PUBLIC_BASE_URL\s*=\s*(.*?)\s*$/m);
    if (match) return match[1].replace(/^(['"])(.*)\1$/, '$2');
  }
  return null;
}

/**
 * The data URL for this checkout. An env file that points at the local data
 * server on its default port (`http://localhost:3002/...`) is redirected to
 * the port this checkout's data server has. A URL that is already in the
 * environment (CI) or that points anywhere else is left alone: returns null.
 */
function localDataUrl(dataPort, dir = process.cwd()) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return null;
  if (dataPort === SERVICES.data) return null;
  const fromFile = baseUrlFromEnvFiles(dir);
  if (!fromFile) return null;
  const local = new RegExp(
    `^(https?://(?:localhost|127\\.0\\.0\\.1)):${SERVICES.data}(?=/|$)`,
  );
  if (!local.test(fromFile)) return null;
  return fromFile.replace(local, `$1:${dataPort}`);
}

/** Env vars that carry the ports down to child processes. */
function envForPorts(slot, ports, dir = process.cwd()) {
  const env = { INFINITE_PORTS_SLOT: String(slot) };
  for (const [service, port] of Object.entries(ports)) {
    env[envName(service)] = String(port);
  }
  // Read by examples/scripts/test-runner-server.js and the test index pages
  env.TEST_RUNNER_PORT = String(ports.testRunner);
  env.NEXT_PUBLIC_TEST_RUNNER_PORT = String(ports.testRunner);
  // The React / Vue / Angular links of the test pages (examples/src/test-index)
  env.NEXT_PUBLIC_EXAMPLES_PORT = String(ports.examples);
  env.NEXT_PUBLIC_EXAMPLES_VUE_PORT = String(ports.examplesVue);
  env.NEXT_PUBLIC_EXAMPLES_ANGULAR_PORT = String(ports.examplesAngular);
  const dataUrl = localDataUrl(ports.data, dir);
  if (dataUrl) env.NEXT_PUBLIC_BASE_URL = dataUrl;
  return env;
}

module.exports = {
  SERVICES,
  SLOT_STEP,
  RECORD_FILE,
  envName,
  portsForSlot,
  readRecord,
  runningServices,
  getPort,
  isPortFree,
  allocatePorts,
  currentPorts,
  localDataUrl,
  envForPorts,
};
