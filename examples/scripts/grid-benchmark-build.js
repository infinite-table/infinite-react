#!/usr/bin/env node

/**
 * Builds the grid benchmark app (src/pages/**\/*.bench.tsx only) as a
 * production build into .next-benchmark - see src/benchmark/README.md
 *
 * `next build` rewrites next-env.d.ts to point to the benchmark distDir,
 * so we restore it afterwards.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nextEnvFile = path.join(root, 'next-env.d.ts');
const nextEnv = fs.readFileSync(nextEnvFile, 'utf8');

try {
  execSync('npx --no-install next build', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, GRID_BENCHMARK: '1', NODE_ENV: 'production' },
  });
} finally {
  fs.writeFileSync(nextEnvFile, nextEnv);
}
