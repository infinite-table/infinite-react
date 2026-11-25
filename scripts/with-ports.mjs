#!/usr/bin/env node
// Runs a command with this checkout's dev ports (see dev-ports.cjs).
//
//   node scripts/with-ports.mjs [options] <command> [args...]
//   node scripts/with-ports.mjs --print
//
// `{service}` tokens in the args are replaced by that service's port, e.g.
//   node ../scripts/with-ports.mjs --for examples next dev -p {examples}
//
// The command also gets the ports as env vars (INFINITE_PORT_EXAMPLES, ...,
// plus the ones the apps read: TEST_RUNNER_PORT, NEXT_PUBLIC_EXAMPLES_PORT,
// and NEXT_PUBLIC_BASE_URL when the local env file points at the local data
// server).
//
// Options:
//   --for a,b       services the command starts: their ports must be free.
//                   When a default is taken they all move up by 100 (5655,
//                   5656, ...), and so on
//   --replace a     like --for, but a server of this checkout that is
//                   already running on the port is stopped first
//   --with a,b      services the command talks to (e.g. the data server)
//   --env K=V       set an extra env var; V may contain {tokens}
//   --print         print this checkout's ports and exit
//
// Without --for / --replace / --with nothing is picked: the command gets the
// ports of the servers that are running (for clients such as Playwright).
// A command started by another with-ports call inherits that one's ports.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import os from 'node:os';

const require = createRequire(import.meta.url);
const {
  SERVICES,
  allocatePorts,
  currentPorts,
  envForPorts,
  readRecord,
  runningServices,
} = require('./dev-ports.cjs');

const argv = process.argv.slice(2);
const extraEnv = [];
const wanted = { listen: [], replace: [], use: [] };
let print = false;

const list = (value) => (value ?? '').split(',').filter(Boolean);

while (argv[0]?.startsWith('--')) {
  const flag = argv.shift();
  if (flag === '--') break;
  if (flag === '--env') extraEnv.push(argv.shift());
  else if (flag === '--for') wanted.listen.push(...list(argv.shift()));
  else if (flag === '--replace') wanted.replace.push(...list(argv.shift()));
  else if (flag === '--with') wanted.use.push(...list(argv.shift()));
  else if (flag === '--print') print = true;
  else {
    console.error(`[ports] unknown option ${flag}`);
    process.exit(1);
  }
}

if (print) {
  const running = runningServices();
  const width = Math.max(...Object.keys(SERVICES).map((name) => name.length));
  for (const [service, port] of Object.entries(currentPorts())) {
    const state = service in running ? 'running' : '';
    console.log(`${service.padEnd(width)} ${String(port).padEnd(6)} ${state}`);
  }
  process.exit(0);
}

if (!argv.length) {
  console.error(
    '[ports] usage: with-ports.mjs [--for a,b] [--replace a] [--with a] [--env K=V] <command> [args...]  |  with-ports.mjs --print',
  );
  process.exit(1);
}

let slot;
let ports;
const picks = wanted.listen.length + wanted.replace.length + wanted.use.length;
try {
  if (process.env.INFINITE_PORTS_SLOT || !picks) {
    // Inherited from an outer with-ports call, or a client: the ports as they are
    slot = Number(process.env.INFINITE_PORTS_SLOT ?? readRecord()?.slot ?? 0);
    ports = currentPorts();
  } else {
    const running = runningServices();
    ({ slot, ports } = await allocatePorts(wanted));
    // Always say where things start, and where the services they use are
    const started = [...new Set([...wanted.listen, ...wanted.replace])];
    const used = wanted.use.filter((name) => !started.includes(name));
    const tag = '\x1b[36m[ports]\x1b[0m';
    const width = Math.max(...[...started, ...used].map((name) => name.length));
    const line = (name, note) =>
      console.log(
        `${tag} ${name.padEnd(width)}  http://localhost:${ports[name]}${
          note ? `  \x1b[2m${note}\x1b[0m` : ''
        }`,
      );
    for (const name of started) {
      line(
        name,
        ports[name] === SERVICES[name] ? '' : `(instead of ${SERVICES[name]})`,
      );
    }
    // Only worth a line when something starts, or when it isn't the default
    for (const name of used) {
      if (!started.length && ports[name] === SERVICES[name]) continue;
      line(
        name,
        name in running
          ? '(used, running)'
          : `(used, not running in this checkout${
              ports[name] === SERVICES[name]
                ? ''
                : `: ${SERVICES[name]} is another checkout's`
            })`,
      );
    }
  }
} catch (error) {
  console.error(`[ports] ${error.message}`);
  process.exit(1);
}

const TOKEN = /\{(\w+)\}/g;
const fill = (value) =>
  value.replace(TOKEN, (match, name) =>
    name in ports ? String(ports[name]) : match,
  );

const env = { ...process.env, ...envForPorts(slot, ports) };
for (const assignment of extraEnv) {
  const eq = assignment.indexOf('=');
  env[assignment.slice(0, eq)] = fill(assignment.slice(eq + 1));
}

const [command, ...args] = argv.map(fill);
const child = spawn(command, args, {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {
  console.error(`[ports] failed to start ${command}: ${error.message}`);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  process.exit(signal ? 128 + (os.constants.signals[signal] ?? 1) : code ?? 1);
});
