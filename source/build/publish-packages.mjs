/**
 * Publishes the React, Vue and Angular packages together, all at the
 * version of source/package.json. Run by the release workflow
 * (`npm run registry-publish` / `registry-publish-canary`), after the bump
 * and the build.
 *
 *   node build/publish-packages.mjs [--tag canary] [--dry-run]
 *
 * - Nothing is published unless all three build folders are there, with
 *   the right package names and the version of source/package.json - a
 *   missing or stale build fails the release before any package is out.
 * - A package already on npm at that version is skipped, so after a
 *   partial failure (React out, Vue failed) re-running the publish
 *   finishes the release instead of failing on React.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PACKAGES = [
  { folder: 'dist', name: '@infinite-table/infinite-react' },
  { folder: 'dist-vue', name: '@infinite-table/infinite-vue' },
  { folder: 'dist-angular', name: '@infinite-table/infinite-angular' },
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tagIndex = args.indexOf('--tag');
const tag = tagIndex === -1 ? undefined : args[tagIndex + 1];
if (tagIndex !== -1 && !tag) {
  throw new Error('--tag needs a value');
}

const { version } = JSON.parse(
  fs.readFileSync(path.join(sourceDir, 'package.json'), 'utf8'),
);

const problems = [];
for (const pkg of PACKAGES) {
  const file = path.join(sourceDir, pkg.folder, 'package.json');
  if (!fs.existsSync(file)) {
    problems.push(`${pkg.folder}/package.json is missing - was the package built?`);
    continue;
  }
  const built = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (built.name !== pkg.name) {
    problems.push(`${pkg.folder} is ${built.name}, expected ${pkg.name}`);
  }
  if (built.version !== version) {
    problems.push(
      `${pkg.folder} is version ${built.version}, source/package.json is ${version} - rebuild after the bump`,
    );
  }
}
if (problems.length) {
  console.error(`Not publishing anything:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

function isPublished(name) {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return out.trim() === version;
  } catch (error) {
    // E404: the package (or this version of it) isn't on npm yet
    if (String(error.stderr).includes('E404')) {
      return false;
    }
    throw error;
  }
}

for (const pkg of PACKAGES) {
  if (isPublished(pkg.name)) {
    console.log(`${pkg.name}@${version} is already on npm - skipped`);
    continue;
  }
  const publishArgs = ['publish', '--access', 'public'];
  if (tag) {
    publishArgs.push('--tag', tag);
  }
  if (dryRun) {
    publishArgs.push('--dry-run');
  }
  console.log(`${pkg.name}@${version}: npm ${publishArgs.join(' ')}`);
  execFileSync('npm', publishArgs, {
    cwd: path.join(sourceDir, pkg.folder),
    stdio: 'inherit',
  });
}

console.log(
  `${dryRun ? 'Dry run: ' : ''}${PACKAGES.map((p) => p.name).join(', ')} at ${version}${tag ? ` (tag ${tag})` : ''}`,
);
