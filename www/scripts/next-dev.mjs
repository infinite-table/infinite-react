// `next dev` on the first free port from PREFERRED_PORT (3001) upwards, since
// Next.js only retries ports by itself when no port is given.
import { spawn } from 'node:child_process';
import net from 'node:net';

const PREFERRED_PORT = Number(process.env.PORT) || 3001;
const MAX_ATTEMPTS = 20;
// 3002 belongs to `serve:data`, which kills whatever is listening on it.
const RESERVED_PORTS = new Set([3002]);

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
