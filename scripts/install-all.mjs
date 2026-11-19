#!/usr/bin/env node
// Installs the dependencies of every folder that is a pnpm project.
//
//   node scripts/install-all.mjs [options] [-- <pnpm install args>]
//
// `pnpm install` at the repo root runs this as its postinstall (with
// --skip-root), so one command installs everything.
//
// Options:
//   --skip-root      don't install the repo root (it is being installed)
//   --only a,b       only these folders (e.g. --only source,examples)
//   --clean          remove the node_modules of all folders instead
//   --check          verify the setup: identical pnpm-workspace.yaml copies,
//                    a pnpm-lock.yaml and no package-lock.json in each folder
//
// Each folder is a separate pnpm project with its own lockfile and its own
// flat node_modules (see pnpm-workspace.yaml for why). They are installed
// one by one, not with one recursive pnpm install: with the hoisted linker
// that fails in pnpm's rebuild step (ERR_PNPM_MISSING_HOISTED_LOCATIONS).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.dirname(import.meta.dirname);

/** Folders installed with pnpm, relative to the repo root */
export const FOLDERS = [
  '.',
  'source',
  'examples',
  'www',
  'www/dataserver',
  'devtools',
  'devtools-ui',
  'devtools-www',
  'vue-playground',
];

const CONCURRENCY = 3;

function parseArgs(argv) {
  const opts = { skipRoot: false, clean: false, check: false, only: null };
  const pnpmArgs = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--') {
      pnpmArgs.push(...argv.slice(i + 1));
      break;
    } else if (arg === '--skip-root') opts.skipRoot = true;
    else if (arg === '--clean') opts.clean = true;
    else if (arg === '--check') opts.check = true;
    else if (arg === '--only') opts.only = argv[++i].split(',').filter(Boolean);
    // anything else goes to pnpm, e.g. --frozen-lockfile
    else pnpmArgs.push(arg);
  }
  return { opts, pnpmArgs };
}

function selectFolders(opts) {
  let folders = FOLDERS;
  if (opts.only) {
    const unknown = opts.only.filter((folder) => !FOLDERS.includes(folder));
    if (unknown.length) {
      throw new Error(
        `Unknown folder(s): ${unknown.join(', ')}. Known: ${FOLDERS.join(
          ', ',
        )}`,
      );
    }
    folders = FOLDERS.filter((folder) => opts.only.includes(folder));
  }
  return opts.skipRoot ? folders.filter((folder) => folder !== '.') : folders;
}

function pnpmInstall(folder, pnpmArgs) {
  return new Promise((resolve) => {
    const started = Date.now();
    const env = { ...process.env };
    // When this runs as the root's postinstall, pnpm has put the root's
    // script context in the environment: don't hand it to the other installs
    for (const name of Object.keys(env)) {
      if (
        /^(npm_(package|lifecycle)_|PNPM_SCRIPT_SRC_DIR$|INIT_CWD$)/.test(name)
      ) {
        delete env[name];
      }
    }
    const child = spawn('pnpm', ['install', ...pnpmArgs], {
      cwd: path.join(ROOT, folder),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) =>
      resolve({ folder, code: 1, output: String(error), ms: 0 }),
    );
    child.on('exit', (code) =>
      resolve({ folder, code: code ?? 1, output, ms: Date.now() - started }),
    );
  });
}

async function installAll(folders, pnpmArgs) {
  const queue = [...folders];
  const failed = [];
  async function worker() {
    while (queue.length) {
      const folder = queue.shift();
      const result = await pnpmInstall(folder, pnpmArgs);
      const name = folder === '.' ? '(root)' : folder;
      const seconds = (result.ms / 1000).toFixed(1);
      if (result.code === 0) {
        // Warnings worth seeing: build scripts pnpm didn't run
        const ignored = result.output.match(/Ignored build scripts: [^│\n]*/);
        console.log(
          `\x1b[32m✓\x1b[0m ${name.padEnd(16)} ${seconds}s${
            ignored ? `  (${ignored[0].trim()})` : ''
          }`,
        );
      } else {
        failed.push(folder);
        console.log(`\x1b[31m✗\x1b[0m ${name.padEnd(16)} ${seconds}s`);
        console.log(result.output.trimEnd());
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (failed.length) {
    throw new Error(`pnpm install failed in: ${failed.join(', ')}`);
  }
}

function clean() {
  for (const folder of FOLDERS) {
    const dir = path.join(ROOT, folder, 'node_modules');
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`removed ${path.relative(ROOT, dir)}`);
    }
  }
}

function check() {
  const problems = [];
  const settings = fs.readFileSync(
    path.join(ROOT, 'pnpm-workspace.yaml'),
    'utf8',
  );
  for (const folder of FOLDERS) {
    const file = (name) => path.join(ROOT, folder, name);
    const rel = (name) => path.join(folder, name);
    if (!fs.existsSync(file('pnpm-workspace.yaml'))) {
      problems.push(
        `${rel('pnpm-workspace.yaml')} is missing (copy the root one)`,
      );
    } else if (
      fs.readFileSync(file('pnpm-workspace.yaml'), 'utf8') !== settings
    ) {
      problems.push(`${rel('pnpm-workspace.yaml')} differs from the root one`);
    }
    if (!fs.existsSync(file('pnpm-lock.yaml'))) {
      problems.push(`${rel('pnpm-lock.yaml')} is missing`);
    }
    if (fs.existsSync(file('package-lock.json'))) {
      problems.push(
        `${rel(
          'package-lock.json',
        )} exists: this folder is installed with pnpm`,
      );
    }
  }
  if (problems.length) {
    throw new Error(problems.join('\n'));
  }
  console.log(`pnpm setup ok in ${FOLDERS.length} folders`);
}

if (import.meta.filename === process.argv[1]) {
  try {
    const { opts, pnpmArgs } = parseArgs(process.argv.slice(2));
    if (opts.check) check();
    else if (opts.clean) clean();
    else await installAll(selectFolders(opts), pnpmArgs);
  } catch (error) {
    console.error(`\x1b[31m${error.message}\x1b[0m`);
    process.exit(1);
  }
}
