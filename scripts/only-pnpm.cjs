// The `preinstall` of every folder that is installed with pnpm (see FOLDERS
// in install-all.mjs): stops `npm install` / `npm ci` and says what to run
// instead. `npm run <script>` is not affected.
//
// npm runs a project's preinstall only after it has written its own
// lockfile, and doesn't run it at all for `npm install <package>`. So this
// also removes the lockfiles npm leaves behind, both right away and, for
// the case npm never asked, on the next pnpm install.
const fs = require('node:fs');
const path = require('node:path');

// npm and pnpm run lifecycle scripts in the folder of the package.json
const folder = process.cwd();
const root = path.dirname(__dirname);
const name = path.relative(root, folder) || 'the repo root';

// Never present in a folder that is installed with pnpm
const removed = ['package-lock.json', 'node_modules/.package-lock.json'].filter(
  (file) => {
    const target = path.join(folder, file);
    if (!fs.existsSync(target)) return false;
    fs.rmSync(target);
    return true;
  },
);

const withPnpm = (process.env.npm_config_user_agent ?? '').startsWith('pnpm/');

if (withPnpm) {
  if (removed.includes('package-lock.json')) {
    console.warn(
      `\n[pnpm] Removed ${name}/package-lock.json: npm was used to install in this folder, which is installed with pnpm.\n`,
    );
  }
  return;
}

const bold = (text) => `\x1b[1m${text}\x1b[0m`;
console.error(`
\x1b[31m✖ ${bold('This repo is installed with pnpm, not npm.')}\x1b[0m

  Instead of npm install / npm ci, run:

    ${bold('pnpm install')}             at the repo root: installs every folder
    ${bold('pnpm add <package>')}       in a folder: adds a dependency there

  No pnpm yet? npm install -g pnpm, or corepack enable pnpm.
  npm run <script> keeps working.
${
  removed.length
    ? `
  npm had already started: removed what it wrote in ${name} (${removed.join(
        ', ',
      )}).
  It may also have moved packages inside node_modules: pnpm install puts them back.
`
    : ''
}`);
process.exit(1);
