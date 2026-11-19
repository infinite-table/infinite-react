// `next dev` on the first free port from PREFERRED_PORT upwards, since
// Next.js only retries ports by itself when no port is given. The preferred
// port is the `www` port picked by scripts/with-ports.mjs (3001 unless
// another checkout has it), or PORT.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';

const { getPort } = createRequire(import.meta.url)(
  '../../scripts/dev-ports.cjs',
);

const PREFERRED_PORT = Number(process.env.PORT) || getPort('www');
const MAX_ATTEMPTS = 20;
// The data port belongs to `serve:data`, which restarts this checkout's data
// server on it.
const RESERVED_PORTS = new Set([getPort('data')]);

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function findFreePort() {
  for (let port = PREFERRED_PORT; port < PREFERRED_PORT + MAX_ATTEMPTS; port++) {
    if (RESERVED_PORTS.has(port)) {
      continue;
    }
    if (await isPortFree(port)) {
      return port;
    }
    console.warn(`Port ${port} is in use, trying the next one...`);
  }
  throw new Error(
    `No free port found between ${PREFERRED_PORT} and ${PREFERRED_PORT + MAX_ATTEMPTS - 1}`,
  );
}

const port = await findFreePort();

const child = spawn(
  'next',
  ['dev', '-p', String(port), ...process.argv.slice(2)],
  { stdio: 'inherit', shell: true },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
