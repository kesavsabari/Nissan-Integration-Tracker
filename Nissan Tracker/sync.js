const { execSync } = require('child_process');

/**
 * Nissan Tracker - Auto-Sync Utility
 * Periodically checks for remote changes and pulls them if the local state is clean.
 */

const INTERVAL_MS = 30000; // 30 seconds
const REMOTE = 'origin';
const BRANCH = 'main';

function log(msg) {
  console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function isWorkingTreeClean() {
  try {
    const status = execSync('git status --porcelain').toString();
    return status.trim() === '';
  } catch (e) {
    return false;
  }
}

function sync() {
  log(`Checking for updates on ${REMOTE}/${BRANCH}...`);

  try {
    // 1. Fetch remote changes
    execSync(`git fetch ${REMOTE}`);

    // 2. Check if local branch is behind
    const local = execSync(`git rev-parse ${BRANCH}`).toString().trim();
    const remote = execSync(`git rev-parse ${REMOTE}/${BRANCH}`).toString().trim();

    if (local === remote) {
      log('Local is up to date.');
      return;
    }

    log('Remote changes detected.');

    // 3. Safety Check: Only pull if no uncommitted changes
    if (!isWorkingTreeClean()) {
      log('WARNING: Local changes detected. Skipping auto-pull to avoid conflicts.');
      log('Please commit or stash your changes to resume auto-sync.');
      return;
    }

    // 4. Pull
    log('Pulling changes...');
    const output = execSync(`git pull ${REMOTE} ${BRANCH}`).toString();
    console.log(output);
    log('Sync successful.');

  } catch (error) {
    log(`ERROR: Sync failed. ${error.message}`);
  }
}

console.log('--- Nissan Tracker Auto-Sync Started ---');
console.log(`Interval: ${INTERVAL_MS / 1000}s`);
console.log('Monitoring for collaborator changes...\n');

// Run immediately on start
sync();

// Set interval
setInterval(sync, INTERVAL_MS);
