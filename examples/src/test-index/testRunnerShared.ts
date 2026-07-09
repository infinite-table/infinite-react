export type IndexEntry = {
  type: 'folder' | 'page';
  name: string;
  /** Path relative to the current index folder, e.g. `filter-value/client-side` */
  path: string;
  href: string;
  depth: number;
};

export type TestPagesIndexProps = {
  segments: string[];
  parentHref: string | null;
  entries: IndexEntry[];
};

export type TestRunnerProject = 'react' | 'vue';

export type TestRunnerStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'pass'
  | 'fail';

export type TestRunnerMode = 'page' | 'folder';

export const TEST_RUNNER_PORT = Number(
  import.meta.env.VITE_TEST_RUNNER_PORT || 5599,
);

export const TEST_RUNNER_PROJECT: TestRunnerProject =
  import.meta.env.VITE_TEST_PROJECT === 'vue' ? 'vue' : 'react';

export const testRunnerBaseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;

export const SEPARATOR = '\n' + '─'.repeat(48) + '\n';

export const trimOutput = (out: string, max = 32_000) =>
  out.length <= max ? out : '…(truncated)…\n' + out.slice(out.length - max);

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001B\[[0-9;]*[A-Za-z]/g;
export const stripAnsi = (s: string) => s.replace(ANSI_RE, '');

export const STATUS_COLORS: Record<TestRunnerStatus, string> = {
  idle: 'rgba(0, 0, 0, 0.55)',
  starting: '#3b82f6',
  running: '#3b82f6',
  pass: '#16a34a',
  fail: '#dc2626',
};

export const labelFor = (
  status: TestRunnerStatus,
  mode: TestRunnerMode,
  specCount?: number,
): string => {
  switch (status) {
    case 'idle':
      return mode === 'folder'
        ? `▶ Run all tests${specCount ? ` (${specCount})` : ''}`
        : '▶ Run test';
    case 'starting':
      return '⏳ Starting…';
    case 'running':
      return '⏳ Running';
    case 'pass':
      return '✅ Pass';
    case 'fail':
      return '❌ Fail';
  }
};
