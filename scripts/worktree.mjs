#!/usr/bin/env node
// Git worktrees for Infinite Table development. Used by the
// infinite-dev-tree skill and as the worktree setup script of tools that
// create worktrees themselves (T3 Code, Cursor, ...).
//
//   node scripts/worktree.mjs create <branch> [--base <ref>] [--path <dir>]
//                                    [--no-install] [--no-build]
//   node scripts/worktree.mjs setup [<worktree path>] [--no-install] [--no-build]
//   node scripts/worktree.mjs sync [<worktree path>]
//   node scripts/worktree.mjs remove <branch|path> [--force] [--delete-branch]
//   node scripts/worktree.mjs list
//
// create: adds a worktree (default: <repo>-worktrees/<branch> next to the
//   main checkout) and sets it up.
// setup: makes an existing worktree (default: the one this script is in)
//   ready to work in:
//   - copies the local files git doesn't track from the main checkout
//     (every .env file in any folder, Claude local settings), never
//     overwriting
//   - links /plans (a private nested repo in the main checkout, where the
//     agent instructions live) into the worktree
//   - installs the dependencies (pnpm, hard-linked from the global store)
//   - builds the library (source/dist and source/dist-vue), which the
//     examples and the docs site read
// sync: only the first two steps of setup.
//
// Dev servers pick free ports when they start (dev-ports.cjs), so the ones
// of a worktree run next to the ones of the main checkout.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Env files: .env, .env.local, .env.<anything>, .envlocal, in any folder
const ENV_FILE = /^\.env(\..+)?$|^\.envlocal$/;
// Folders that are not searched for env files (dependencies, build output)
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.next-benchmark',
  'dist',
  'dist-vue',
  'dist-declarations',
  'dist-deepmap',
  'out',
  'out-vue',
  'test-results',
  'benchmark-results',
  '.logs',
  '.cache',
  '.turbo',
  '.parcel-cache',
  '.contentlayer',
  '.netlify',
  'plans',
]);

// Other untracked local files and folders worth carrying over
const LOCAL_FILES = [
  // Claude Code local settings, e.g. .claude/settings.local.json (the skills
  // in .claude/skills are in git, so only untracked files get copied)
  '.claude',
];

// Gitignored folder of the main checkout that worktrees get as a symlink
const PLANS_DIR = 'plans';

const scriptRepo = path.dirname(import.meta.dirname);

function git(args, cwd = scriptRepo) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function run(command, args, cwd) {
  console.log(`\n\x1b[36m$ ${[command, ...args].join(' ')}\x1b[0m  (${cwd})`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function worktrees() {
  const list = [];
  let current = null;
  for (const line of git(['worktree', 'list', '--porcelain']).split('\n')) {
    if (line.startsWith('worktree ')) {
      current = { path: line.slice('worktree '.length) };
      list.push(current);
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice('branch refs/heads/'.length);
    } else if (line === 'detached') {
      current.branch = null;
    }
  }
  return list;
}

const mainWorktree = () => worktrees()[0];
const samePath = (a, b) => fs.realpathSync(a) === fs.realpathSync(b);

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function slugify(branch) {
  return branch.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Every env file under `root`, in any folder, tracked or not */
function envFiles(root, dir = '', found = []) {
  let entries;
  try {
    entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) envFiles(root, rel, found);
    } else if (entry.isFile() && ENV_FILE.test(entry.name)) {
      found.push(rel);
    }
  }
  return found;
}

function filesUnder(root, rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) return [];
  if (!fs.statSync(abs).isDirectory()) return [rel];
  return fs
    .readdirSync(abs, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(root, path.join(entry.parentPath, entry.name)),
    );
}

/** The candidates that git doesn't track in `root` */
function untracked(root, files) {
  if (!files.length) return [];
  const tracked = new Set(
    git(['ls-files', '--', ...files], root)
      .split('\n')
      .filter(Boolean),
  );
  return files.filter((file) => !tracked.has(file));
}

/** The untracked local files of `root` that worktrees get a copy of */
function localFiles(root) {
  const candidates = envFiles(root);
  for (const rel of LOCAL_FILES) candidates.push(...filesUnder(root, rel));
  return untracked(root, candidates);
}

/** Copies untracked local files from the main checkout into `target` (never overwrites) */
function syncLocalFiles(target) {
  const source = mainWorktree().path;
  if (samePath(source, target)) {
    console.log('This is the main checkout: no local files to copy.');
    return;
  }
  const copied = [];
  const skipped = [];
  for (const rel of localFiles(source)) {
    const to = path.join(target, rel);
    if (fs.existsSync(to)) {
      skipped.push(rel);
      continue;
    }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(source, rel), to);
    copied.push(rel);
  }
  console.log(`\nCopied ${copied.length} local file(s) from ${source}:`);
  for (const rel of copied) console.log(`  + ${rel}`);
  if (skipped.length) {
    console.log(`Already present, left as they are:`);
    for (const rel of skipped) console.log(`  = ${rel}`);
  }

  // /plans is a private nested git repo in the main checkout: one copy,
  // shared by all worktrees
  const plans = path.join(source, PLANS_DIR);
  const link = path.join(target, PLANS_DIR);
  if (fs.existsSync(plans) && !fs.lstatSync(link, { throwIfNoEntry: false })) {
    fs.symlinkSync(plans, link, 'dir');
    console.log(`Linked ${PLANS_DIR} -> ${plans}`);
  }
}

function install(target, { noBuild }) {
  if (!fs.existsSync(path.join(target, 'scripts', 'install-all.mjs'))) {
    console.log(
      `\n\x1b[33m${target} is on a branch from before the switch to pnpm: ` +
        `not installing. Merge master into it, or install with npm as before.\x1b[0m`,
    );
    return false;
  }
  // The root's postinstall installs the other folders (scripts/install-all.mjs)
  run('pnpm', ['install', '--prefer-offline'], target);
  if (!noBuild) {
    // source/dist and source/dist-vue: read by the examples and the docs site
    run('pnpm', ['run', 'build'], target);
  }
  return true;
}

function printReady(target, installed) {
  console.log(`\nReady: ${target}`);
  if (!installed) return;
  console.log(
    'Start the servers there with: pnpm -C www run serve:data, pnpm -C examples run dev',
  );
  console.log(
    'They take the default ports (5555, 5556, 3002, ...) when free, otherwise the next free set (5655, 5656, 3102, ...).',
  );
}

function setup(target, flags) {
  target = path.resolve(target);
  if (!worktrees().some((w) => samePath(w.path, target))) {
    throw new Error(`${target} is not a checkout of this repository`);
  }
  syncLocalFiles(target);
  const installed = flags.noInstall ? false : install(target, flags);
  printReady(target, installed);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) positional.push(arg);
    else if (['--base', '--path'].includes(arg))
      flags[arg.slice(2)] = argv[++i];
    else
      flags[arg.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = true;
  }
  return { positional, flags };
}

function refExists(ref) {
  try {
    git(['rev-parse', '--verify', '--quiet', ref]);
    return true;
  } catch {
    return false;
  }
}

function create(branch, flags) {
  if (!branch)
    throw new Error(
      'usage: worktree.mjs create <branch> [--base <ref>] [--path <dir>]',
    );
  const main = mainWorktree();
  const existing = worktrees().find((w) => w.branch === branch);
  if (existing) {
    throw new Error(
      `Branch ${branch} is already checked out at ${existing.path}`,
    );
  }
  const target = path.resolve(
    flags.path ??
      path.join(
        path.dirname(main.path),
        `${path.basename(main.path)}-worktrees`,
        slugify(branch),
      ),
  );
  if (fs.existsSync(target)) throw new Error(`${target} already exists`);

  if (refExists(`refs/heads/${branch}`)) {
    git(['worktree', 'add', target, branch]);
  } else if (!flags.base && refExists(`refs/remotes/origin/${branch}`)) {
    git([
      'worktree',
      'add',
      '--track',
      '-b',
      branch,
      target,
      `origin/${branch}`,
    ]);
  } else {
    const base = flags.base ?? main.branch ?? 'HEAD';
    git(['worktree', 'add', '-b', branch, target, base]);
  }
  console.log(`Worktree for ${branch}: ${target}`);
  setup(target, flags);
}

function remove(which, flags) {
  if (!which)
    throw new Error(
      'usage: worktree.mjs remove <branch|path> [--force] [--delete-branch]',
    );
  const list = worktrees();
  const found =
    list.find((w) => w.branch === which) ??
    list.find((w) => path.resolve(w.path) === path.resolve(which));
  if (!found) throw new Error(`No worktree for ${which}`);
  if (found === list[0])
    throw new Error('Refusing to remove the main checkout');

  // Files copied by syncLocalFiles show up as untracked and would block
  // `git worktree remove`; anything else that changed needs --force.
  const main = list[0].path;
  const dirty = execFileSync(
    'git',
    ['status', '--porcelain', '--untracked-files=all'],
    { cwd: found.path, encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean)
    .filter((line) => {
      const rel = line.slice(3);
      const copy = path.join(main, rel);
      const isSyncedCopy =
        line.startsWith('??') &&
        fs.existsSync(copy) &&
        fs.statSync(copy).isFile() &&
        fs
          .readFileSync(copy)
          .equals(fs.readFileSync(path.join(found.path, rel)));
      return !isSyncedCopy;
    });
  if (dirty.length && !flags.force) {
    throw new Error(
      `${found.path} has changes that would be lost:\n  ${dirty.join(
        '\n  ',
      )}\nCommit them, or pass --force.`,
    );
  }
  // Only the link: the plans themselves stay in the main checkout
  const link = path.join(found.path, PLANS_DIR);
  if (fs.lstatSync(link, { throwIfNoEntry: false })?.isSymbolicLink()) {
    fs.unlinkSync(link);
  }
  git(['worktree', 'remove', '--force', found.path]);
  console.log(`Removed worktree ${found.path}`);
  if (flags.deleteBranch && found.branch) {
    git(['branch', flags.force ? '-D' : '-d', found.branch]);
    console.log(`Deleted branch ${found.branch}`);
  }
}

function list() {
  for (const w of worktrees()) {
    // The dev servers that checkout is running (its .dev-ports.json)
    const running = [];
    try {
      const { services } = JSON.parse(
        fs.readFileSync(path.join(w.path, '.dev-ports.json'), 'utf8'),
      );
      for (const [service, { port, pid }] of Object.entries(services ?? {})) {
        if (isAlive(pid)) running.push(`${service}:${port}`);
      }
    } catch {}
    console.log(
      `${w.path}  [${w.branch ?? 'detached'}]${
        running.length ? `  running ${running.join(' ')}` : ''
      }`,
    );
  }
}

const [command, ...rest] = process.argv.slice(2);
const { positional, flags } = parseArgs(rest);

try {
  if (command === 'create') create(positional[0], flags);
  else if (command === 'setup') setup(positional[0] ?? scriptRepo, flags);
  else if (command === 'sync') {
    syncLocalFiles(path.resolve(positional[0] ?? scriptRepo));
  } else if (command === 'remove') remove(positional[0], flags);
  else if (command === 'list') list();
  else {
    console.error(
      'usage: worktree.mjs <create|setup|sync|remove|list> ...  (see the header of this file)',
    );
    process.exit(1);
  }
} catch (error) {
  console.error(`\x1b[31m${error.message}\x1b[0m`);
  process.exit(1);
}
