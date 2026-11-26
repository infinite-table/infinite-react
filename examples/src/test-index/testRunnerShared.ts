import type { TestRunnerProject } from './testRunnerCore';

// the framework-free part of the client, for the existing imports
export * from './testRunnerCore';

export const TEST_RUNNER_PORT = Number(
  import.meta.env.VITE_TEST_RUNNER_PORT || 5599,
);

const TEST_PROJECT = import.meta.env.VITE_TEST_PROJECT;

export const TEST_RUNNER_PROJECT: TestRunnerProject =
  TEST_PROJECT === 'vue' || TEST_PROJECT === 'angular' ? TEST_PROJECT : 'react';

export const testRunnerBaseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;
