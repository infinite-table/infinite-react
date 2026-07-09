import { onBeforeUnmount, ref, watch } from 'vue';

import {
  labelFor,
  SEPARATOR,
  TEST_RUNNER_PROJECT,
  testRunnerBaseUrl,
  trimOutput,
  type TestRunnerMode,
  type TestRunnerStatus,
} from './testRunnerShared';

type OpenStatus =
  | { kind: 'idle' }
  | { kind: 'opening'; file: string; line: number; col?: number }
  | { kind: 'ok'; file: string; line: number; col?: number; editor?: string }
  | { kind: 'err'; file: string; line: number; col?: number; error: string };

export function useTestRunner(pathnameRef: () => string | null) {
  const enabled = ref(false);
  const mode = ref<TestRunnerMode>('page');
  const specCount = ref<number | undefined>(undefined);
  const status = ref<TestRunnerStatus>('idle');
  const active = ref(false);
  const output = ref('');
  const showOutput = ref(false);
  const openStatus = ref<OpenStatus>({ kind: 'idle' });

  let abortController: AbortController | null = null;
  let openTimer: number | null = null;

  const checkPathname = async (pathname: string | null) => {
    if (!pathname || typeof navigator !== 'undefined' && (navigator as any).webdriver) {
      enabled.value = false;
      return;
    }

    try {
      const response = await fetch(
        `${testRunnerBaseUrl()}/check?pathname=${encodeURIComponent(pathname)}&project=${TEST_RUNNER_PROJECT}`,
      );
      const data = await response.json();
      enabled.value = !!data?.exists;
      mode.value = data?.mode === 'folder' ? 'folder' : 'page';
      specCount.value =
        typeof data?.specCount === 'number' ? data.specCount : undefined;
    } catch {
      enabled.value = false;
    }
  };

  watch(pathnameRef, (pathname) => {
    void checkPathname(pathname);
  }, { immediate: true });

  onBeforeUnmount(() => {
    abortController?.abort();
    if (openTimer !== null) {
      window.clearTimeout(openTimer);
    }
  });

  const handleEvent = (event: any) => {
    switch (event?.type) {
      case 'run-start':
        status.value = 'running';
        output.value = output.value ? output.value + SEPARATOR : '';
        break;
      case 'stdout':
      case 'stderr':
        output.value = trimOutput(output.value + (event.data ?? ''));
        break;
      case 'run-end':
        status.value = event.status === 'pass' ? 'pass' : 'fail';
        break;
      case 'change':
        output.value = trimOutput(
          output.value + `\n[changed] ${event.file}\n`,
        );
        break;
      case 'trigger':
        output.value = trimOutput(
          output.value + `\n[triggered] ${event.reason || 'manual'}\n`,
        );
        break;
      case 'watching':
        output.value =
          output.value +
          `[watching] ${(event.files || []).join(', ') || '(no files)'}\n`;
        break;
    }
  };

  const start = async (pathname: string | null) => {
    if (!pathname || active.value) {
      return;
    }

    active.value = true;
    status.value = 'starting';
    output.value = '';
    showOutput.value = true;

    const controller = new AbortController();
    abortController = controller;

    try {
      const response = await fetch(`${testRunnerBaseUrl()}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname,
          watch: true,
          project: TEST_RUNNER_PROJECT,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        status.value = 'fail';
        output.value = `HTTP ${response.status} ${response.statusText}`;
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }
          try {
            handleEvent(JSON.parse(trimmed));
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        status.value = 'fail';
        output.value = output.value + '\n[error] ' + String(err);
      }
    } finally {
      active.value = false;
      abortController = null;
    }
  };

  const stop = () => {
    abortController?.abort();
    status.value = 'idle';
    active.value = false;
  };

  const rerun = async (pathname: string | null) => {
    if (!pathname) {
      return;
    }

    const startFreshSession = () => {
      abortController?.abort();
      active.value = false;
      queueMicrotask(() => {
        void start(pathname);
      });
    };

    if (!active.value) {
      void start(pathname);
      return;
    }

    try {
      const response = await fetch(`${testRunnerBaseUrl()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      });
      if (!response.ok) {
        startFreshSession();
      }
    } catch {
      startFreshSession();
    }
  };

  const openInEditor = (file: string, line: number, col?: number) => {
    openStatus.value = { kind: 'opening', file, line, col };
    if (openTimer !== null) {
      window.clearTimeout(openTimer);
      openTimer = null;
    }

    fetch(`${testRunnerBaseUrl()}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, col }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.ok) {
          openStatus.value = { kind: 'ok', file, line, col, editor: data.editor };
        } else {
          openStatus.value = {
            kind: 'err',
            file,
            line,
            col,
            error: data?.error || `HTTP ${response.status}`,
          };
        }
      })
      .catch((err) => {
        openStatus.value = {
          kind: 'err',
          file,
          line,
          col,
          error: String((err && (err as Error).message) || err),
        };
      })
      .finally(() => {
        openTimer = window.setTimeout(() => {
          openStatus.value = { kind: 'idle' };
          openTimer = null;
        }, 2500);
      });
  };

  const buttonLabel = (_pathname: string | null) =>
    active.value
      ? '■ Stop'
      : labelFor(status.value, mode.value, specCount.value);

  return {
    enabled,
    mode,
    specCount,
    status,
    active,
    output,
    showOutput,
    openStatus,
    start,
    stop,
    rerun,
    openInEditor,
    buttonLabel,
  };
}
