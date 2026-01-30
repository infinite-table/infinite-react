#!/usr/bin/env node

/**
 * CLI tool for managing performance baselines
 *
 * Usage:
 *   node scripts/perf-baseline.js list          - List all baseline files
 *   node scripts/perf-baseline.js copy-to-ci    - Copy your dev baselines to CI file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASELINES_DIR = path.resolve(__dirname, '..');
const CI_PATH = path.resolve(BASELINES_DIR, 'perf-baselines.ci.json');

function getDevName() {
  if (process.env.PERF_DEV_NAME) {
    return process.env.PERF_DEV_NAME;
  }
  try {
    const gitUser = execSync('git config user.name', {
      encoding: 'utf-8',
    }).trim();
    return gitUser
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
  } catch {
    return 'local';
  }
}

function getDevPath() {
  return path.resolve(BASELINES_DIR, `perf-baselines.${getDevName()}.json`);
}

function loadBaselines(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function saveBaselines(filePath, baselines) {
  fs.writeFileSync(filePath, JSON.stringify(baselines, null, 2) + '\n');
}

function printBaselines(baselines, title) {
  const entries = Object.entries(baselines);

  if (entries.length === 0) {
    console.log(`${title}: No baselines found.\n`);
    return;
  }

  console.log(`\n${title}:\n`);

  for (const [name, baseline] of entries) {
    // Extract just the test name part after the colon
    const testNameParts = name.split(':');
    const shortPath = testNameParts[0].replace('tests/', '');
    const testTitle = testNameParts.slice(1).join(':');

    console.log(`📊 ${shortPath}`);
    console.log(`   "${testTitle}"`);
    console.log(`   ┌──────────────────────────────────┐`);
    console.log(
      `   │ Scripting: ${String(baseline.scriptingTime + 'ms').padEnd(
        10,
      )} (threshold: ${baseline.threshold}%)`,
    );
    if (baseline.renderingTime !== undefined) {
      console.log(
        `   │ Rendering: ${String(baseline.renderingTime + 'ms').padEnd(10)} │`,
      );
      console.log(
        `   │ Painting:  ${String(baseline.paintingTime + 'ms').padEnd(10)} │`,
      );
      console.log(
        `   │ Total:     ${String(baseline.totalTime + 'ms').padEnd(10)} │`,
      );
    }
    console.log(`   └──────────────────────────────────┘`);
    console.log('');
  }

  console.log(`Total: ${entries.length} baseline(s)\n`);
}

function listBaselines() {
  // Find all baseline files
  const files = fs
    .readdirSync(BASELINES_DIR)
    .filter((f) => f.startsWith('perf-baselines.') && f.endsWith('.json'));

  const devName = getDevName();

  console.log(`\nYour dev name: ${devName}`);
  console.log(`Your baseline file: perf-baselines.${devName}.json\n`);

  // Show CI baselines first
  if (files.includes('perf-baselines.ci.json')) {
    printBaselines(loadBaselines(CI_PATH), '🔄 CI Baselines');
  }

  // Show all dev baselines
  for (const file of files.sort()) {
    if (file === 'perf-baselines.ci.json') continue;

    const devMatch = file.match(/^perf-baselines\.(.+)\.json$/);
    if (devMatch) {
      const name = devMatch[1];
      const isYou = name === devName ? ' (you)' : '';
      const filePath = path.resolve(BASELINES_DIR, file);
      printBaselines(loadBaselines(filePath), `👤 ${name}${isYou}`);
    }
  }
}

function copyToCi() {
  const devPath = getDevPath();
  const devBaselines = loadBaselines(devPath);
  const ciBaselines = loadBaselines(CI_PATH);

  if (Object.keys(devBaselines).length === 0) {
    console.log('❌ No dev baselines to copy.');
    return;
  }

  // Merge dev into CI (dev overwrites CI for matching keys)
  const merged = { ...ciBaselines, ...devBaselines };
  saveBaselines(CI_PATH, merged);

  console.log(
    `✅ Copied ${Object.keys(devBaselines).length} baseline(s) to CI file.`,
  );
  console.log('   Remember to commit perf-baselines.ci.json');
}

// CLI handling
const [, , command] = process.argv;

switch (command) {
  case 'list':
    listBaselines();
    break;
  case 'copy-to-ci':
    copyToCi();
    break;
  default:
    console.log(`
Performance Baseline Manager

Usage:
  node scripts/perf-baseline.js <command>

Commands:
  list           List all baseline files (CI and all devs)
  copy-to-ci     Copy your dev baselines to CI file (then commit)

Files:
  perf-baselines.<your-name>.json  - Your personal baselines (auto-updated, committed)
  perf-baselines.ci.json           - CI baselines (committed, used in CI)
`);
    process.exit(command ? 1 : 0);
}
