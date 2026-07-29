const { execSync } = require('child_process');
const fetch = require('node-fetch');
const path = require('node:path');
const process = require('node:process');

const RELEASE = process.env.BUILD_VERSION || 'development';
const DEFAULT_BID = 'gmpt_infra';

const startupTimestamp = `${Math.random()}-${Date.now()}`;

const SLARDAR_WEB_REPORT_API_URL = 'https://mon.tiktokv.com/monitor_browser/collect/batch/';

async function doReport(eventInfo) {
  if (!eventInfo) {
    return;
  }

  const timestamp = Date.now();

  const event = {
    ev_type: 'batch',
    list: [eventInfo].map(({ name, categories = {}, metrics = {}, common = {} }) => ({
      ev_type: 'custom',
      payload: {
        name,
        metrics,
        categories,
        type: 'event',
      },
      context: {},
      common: {
        bid: DEFAULT_BID,
        user_id: startupTimestamp,
        session_id: startupTimestamp,
        device_id: startupTimestamp,
        pid: '/',
        url: '/',
        release: RELEASE,
        env: 'production',
        timestamp,
        sdk_version: '0.8.0',
        sdk_name: 'SDK_SLARDAR_WEB',
        sample_rate: 1,
        network_type: '4g', // Slardar 缺省
        ...common,
      },
    })),
  };

  return fetch(SLARDAR_WEB_REPORT_API_URL, {
    method: 'POST',
    body: JSON.stringify(event),
  }).catch((e) => {
    console.error('keystoneInstall report error:');
    console.error(e);
  });
}

const NOT_GIT_REPO_TAG = '<Not Git Repo>';

function getGitOutputByCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (e) {
    return NOT_GIT_REPO_TAG;
  }
}

const gitRepo = getGitOutputByCommand('git config --get remote.origin.url')
  .replace(/^https?:\/\/.*?\//i, '')
  .replace(/^git@.*?:/i, '')
  .replace(/\.git$/i, '');

const gitBranch = getGitOutputByCommand('git branch --show-current');

const gitUser = getGitOutputByCommand('git config user.email').replace(/@bytedance\.com$/i, '');

function getRelativePathFromGitRoot() {
  const repoRoot = getGitOutputByCommand('git rev-parse --show-toplevel');
  if (repoRoot === NOT_GIT_REPO_TAG) {
    return NOT_GIT_REPO_TAG;
  }
  const currentDir = process.cwd();
  const relativePath = path.relative(repoRoot, currentDir);
  return relativePath;
}

const relativePathFromGitRoot = getRelativePathFromGitRoot();

const gitPreviewUrl =
  gitRepo === NOT_GIT_REPO_TAG
    ? NOT_GIT_REPO_TAG
    : `https://code.byted.org/${gitRepo}/tree/${gitBranch}/${relativePathFromGitRoot}`;

function getPkgVersion() {
  try {
    const pkg = require(path.resolve(__dirname, 'package.json'));
    return pkg.version;
  } catch (e) {
    return 'unknown';
  }
}

const version = getPkgVersion();

const timeout = setTimeout(() => {
  console.log('keystoneInstall report timeout.');
  process.exit(0);
}, 5000);

doReport({
  name: 'keystoneInstall',
  categories: {
    version,
    gitRepo,
    gitUser,
    gitBranch,
    relativePathFromGitRoot,
    gitPreviewUrl,
  },
}).then(() => clearTimeout(timeout));
