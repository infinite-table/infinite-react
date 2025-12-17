const core = require('@actions/core');
const fs = require('fs');

const { context } = require('@actions/github');

async function run() {
  try {
    const { payload } = context;
    const commit = payload.commits.filter((commit) =>
      commit.message.toLowerCase().includes('release version'),
    )[0];

    let type;

    if (commit && commit.message) {
      const message = commit.message.toLowerCase();

      const isCanary = message.includes('canary');
      if (message.includes('patch')) {
        type = 'patch';
      } else if (message.includes('minor')) {
        type = 'minor';
      } else if (message.includes('major')) {
        type = 'major';
      }

      if (type || isCanary) {
        const versionbump =
          type && isCanary ? `${type}:canary` : type ? type : 'canary';
        const releasecmd = isCanary ? 'canary-nobump' : 'nobump';

        core.exportVariable(
          'WILL_RELEASE_CMD',
          `npm run release:${releasecmd}`,
        );
        core.exportVariable('WILL_RELEASE_VERSION', versionbump);
        core.exportVariable('WILL_RELEASE', 'true');

        core.info(
          'set env var WILL_RELEASE_CMD = ' + `npm run release:${releasecmd}`,
        );
        return;
      }
    }

    feedback = !type
      ? `ambigous release commit message: should have the format "release version <canary|patch|minor|major>"`
      : 'no release will happen';

    core.info(feedback);
    core.exportVariable('CHECK_COMMIT_FEEDBACK', feedback);
    core.exportVariable('WILL_RELEASE', 'false');
    process.exitCode = 1;
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
