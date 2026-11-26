// The test-runner client (RunTestButton.*, TestRunnerOutputPanel.*) without
// any framework or bundler: imported by the Angular app too, where
// testRunnerShared.ts can't go (it reads Vite's import.meta.env).
export type TestRunnerProject = 'react' | 'vue' | 'angular';

export type TestRunnerStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'pass'
  | 'fail';

export type TestRunnerMode = 'page' | 'folder';

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

// `path/to/file.ts:12:3` in the Playwright output: links that open the editor
const FILE_REF_RE =
  /((?:\/|\.{0,2}\/)?[\w@.\-/]+\.(?:tsx?|jsx?|mjs|cjs|vue)):(\d+)(?::(\d+))?/g;

export type OutputPart =
  | { kind: 'text'; value: string }
  | { kind: 'link'; value: string; file: string; line: number; col?: number };

export const outputParts = (raw: string): OutputPart[] => {
  const text = stripAnsi(raw);
  const parts: OutputPart[] = [];
  const re = new RegExp(FILE_REF_RE.source, 'g');
  let lastIdx = 0;
  while (true) {
    const match = re.exec(text);
    if (match === null) {
      break;
    }
    const [full, file, lineStr, colStr] = match;
    if (match.index > lastIdx) {
      parts.push({ kind: 'text', value: text.slice(lastIdx, match.index) });
    }
    parts.push({
      kind: 'link',
      value: full,
      file,
      line: Number(lineStr),
      col: colStr ? Number(colStr) : undefined,
    });
    lastIdx = match.index + full.length;
  }
  if (lastIdx < text.length) {
    parts.push({ kind: 'text', value: text.slice(lastIdx) });
  }
  return parts;
};

// ------------------------------------------------------------ the client

export type OpenStatus =
  | { kind: 'idle' }
  | { kind: 'opening'; file: string; line: number; col?: number }
  | { kind: 'ok'; file: string; line: number; col?: number; editor?: string }
  | { kind: 'err'; file: string; line: number; col?: number; error: string };

export type TestRunnerState = {
  /** the sidecar has a spec for the pathname (`check`) */
  enabled: boolean;
  mode: TestRunnerMode;
  specCount: number | undefined;
  status: TestRunnerStatus;
  /** a watch session is open */
  active: boolean;
  /** what the session runs */
  pathname: string | null;
  output: string;
  showOutput: boolean;
  openStatus: OpenStatus;
};

/** a pass / fail of a spec or a folder run (test-runner-results.js) */
export type TestResult = { status: 'pass' | 'fail'; ts: number };

export type TestResults = {
  pages: Record<string, TestResult>;
  folders: Record<string, TestResult>;
};

/** a recently changed page (test-runner-results.js) */
export type RecentChange = {
  pathname: string;
  ts: number;
  /** when each of its files changed */
  kinds: Partial<Record<'spec' | TestRunnerProject, number>>;
  /** which files it has */
  files: Record<'spec' | TestRunnerProject, boolean>;
};

/**
 * A watch session of the test-runner sidecar, without a framework: the
 * React, Vue and Angular wrappers subscribe to its state. Runs the specs of
 * a page or a folder on one Playwright project.
 */
export class TestRunnerClient {
  state: TestRunnerState = {
    enabled: false,
    mode: 'page',
    specCount: undefined,
    status: 'idle',
    active: false,
    pathname: null,
    output: '',
    showOutput: false,
    openStatus: { kind: 'idle' },
  };

  private listeners = new Set<(state: TestRunnerState) => void>();
  private abortController: AbortController | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    readonly project: TestRunnerProject,
    readonly baseUrl: () => string,
  ) {}

  subscribe(listener: (state: TestRunnerState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  set(partial: Partial<TestRunnerState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) listener(this.state);
  }

  /** whether the sidecar has a spec for `pathname`, and its last result */
  async check(pathname: string | null) {
    if (
      !pathname ||
      (typeof navigator !== 'undefined' && (navigator as any).webdriver)
    ) {
      this.set({ enabled: false });
      return;
    }
    try {
      const response = await fetch(
        `${this.baseUrl()}/check?pathname=${encodeURIComponent(
          pathname,
        )}&project=${this.project}`,
      );
      const data = await response.json();
      const last = data?.lastResult?.status;
      this.set({
        enabled: !!data?.exists,
        mode: data?.mode === 'folder' ? 'folder' : 'page',
        specCount:
          typeof data?.specCount === 'number' ? data.specCount : undefined,
        ...(!this.state.active && (last === 'pass' || last === 'fail')
          ? { status: last }
          : {}),
      });
    } catch {
      this.set({ enabled: false });
    }
  }

  private append(text: string) {
    this.set({ output: trimOutput(this.state.output + text) });
  }

  private handleEvent(event: any) {
    switch (event?.type) {
      case 'run-start':
        this.set({
          status: 'running',
          output: this.state.output ? this.state.output + SEPARATOR : '',
        });
        break;
      case 'stdout':
      case 'stderr':
        this.append(event.data ?? '');
        break;
      case 'run-end':
        this.set({ status: event.status === 'pass' ? 'pass' : 'fail' });
        break;
      case 'change':
        this.append(`\n[changed] ${event.file}\n`);
        break;
      case 'trigger':
        this.append(`\n[triggered] ${event.reason || 'manual'}\n`);
        break;
      case 'watching':
        this.append(
          `[watching] ${(event.files || []).join(', ') || '(no files)'}\n`,
        );
        break;
    }
  }

  /** opens a watch session for `pathname` (stops the open one first) */
  async start(pathname: string | null, mode?: TestRunnerMode) {
    if (!pathname) return;
    if (this.state.active) {
      this.stop();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const controller = new AbortController();
    this.abortController = controller;
    this.set({
      active: true,
      pathname,
      ...(mode ? { mode } : {}),
      status: 'starting',
      output: '',
      showOutput: true,
    });

    try {
      const response = await fetch(`${this.baseUrl()}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname, watch: true, project: this.project }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        this.set({
          status: 'fail',
          output: `HTTP ${response.status} ${response.statusText}`,
        });
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            this.handleEvent(JSON.parse(trimmed));
          } catch {
            // a malformed line
          }
        }
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        this.set({ status: 'fail' });
        this.append('\n[error] ' + String(err));
      }
    } finally {
      if (this.abortController === controller) {
        this.abortController = null;
        this.set({ active: false });
      }
    }
  }

  stop() {
    this.abortController?.abort();
    this.abortController = null;
    this.set({ status: 'idle', active: false });
  }

  /** a new run in the open session, or a new session */
  async rerun() {
    const { pathname, active } = this.state;
    if (!pathname) return;
    if (!active) {
      void this.start(pathname);
      return;
    }
    try {
      const response = await fetch(`${this.baseUrl()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname, project: this.project }),
      });
      if (response.ok) return;
    } catch {}
    // the sidecar doesn't know the session any more: a new one
    void this.start(pathname);
  }

  openInEditor(file: string, line: number, col?: number) {
    this.set({ openStatus: { kind: 'opening', file, line, col } });
    if (this.openTimer !== null) clearTimeout(this.openTimer);
    fetch(`${this.baseUrl()}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, col }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        this.set({
          openStatus:
            response.ok && data?.ok
              ? { kind: 'ok', file, line, col, editor: data.editor }
              : {
                  kind: 'err',
                  file,
                  line,
                  col,
                  error: data?.error || `HTTP ${response.status}`,
                },
        });
      })
      .catch((err) => {
        this.set({
          openStatus: {
            kind: 'err',
            file,
            line,
            col,
            error: String((err && (err as Error).message) || err),
          },
        });
      })
      .finally(() => {
        this.openTimer = setTimeout(() => {
          this.set({ openStatus: { kind: 'idle' } });
          this.openTimer = null;
        }, 2500);
      });
  }

  dispose() {
    this.abortController?.abort();
    this.abortController = null;
    if (this.openTimer !== null) clearTimeout(this.openTimer);
    this.listeners.clear();
  }
}
