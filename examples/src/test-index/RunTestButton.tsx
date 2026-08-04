import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

const TEST_RUNNER_PORT =
  (typeof process !== 'undefined' &&
    (process.env as any).NEXT_PUBLIC_TEST_RUNNER_PORT) ||
  5599;

type Status = 'idle' | 'starting' | 'running' | 'pass' | 'fail';
type Mode = 'page' | 'folder';

const COLORS: Record<Status, string> = {
  idle: 'rgba(0, 0, 0, 0.55)',
  starting: '#3b82f6',
  running: '#3b82f6',
  pass: '#16a34a',
  fail: '#dc2626',
};

const labelFor = (status: Status, mode: Mode, specCount?: number): string => {
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

const baseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;

const SEPARATOR = '\n' + '─'.repeat(48) + '\n';

const trimOutput = (out: string, max = 32_000) =>
  out.length <= max ? out : '…(truncated)…\n' + out.slice(out.length - max);

// ESC[…m / cursor-control codes from Playwright's reporter.
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001B\[[0-9;]*[A-Za-z]/g;
const stripAnsi = (s: string) => s.replace(ANSI_RE, '');

// Captures things like:
//   src/pages/tests/table/foo.spec.ts:39:7
//   /Users/me/repo/packages/foo.tsx:11
//   ./src/bar.ts:8:2
const FILE_REF_RE =
  /((?:\/|\.{0,2}\/)?[\w@.\-/]+\.(?:tsx?|jsx?|mjs|cjs)):(\d+)(?::(\d+))?/g;

type OpenHandler = (file: string, line: number, col?: number) => void;

const renderOutputNodes = (
  raw: string,
  onOpen: OpenHandler,
): React.ReactNode[] => {
  const text = stripAnsi(raw);
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(FILE_REF_RE.source, 'g');
  let lastIdx = 0;
  let key = 0;
  while (true) {
    const m = re.exec(text);
    if (m === null) {
      break;
    }
    const [full, file, lineStr, colStr] = m;
    if (m.index > lastIdx) {
      nodes.push(text.slice(lastIdx, m.index));
    }
    const line = Number(lineStr);
    const col = colStr ? Number(colStr) : undefined;
    nodes.push(
      <a
        key={`f-${key++}`}
        href={`#open:${file}:${line}${col ? `:${col}` : ''}`}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          onOpen(file, line, col);
        }}
        title={`Open ${file}:${line}${col ? `:${col}` : ''} in editor`}
        style={{
          color: '#7dd3fc',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        {full}
      </a>,
    );
    lastIdx = m.index + full.length;
  }
  if (lastIdx < text.length) {
    nodes.push(text.slice(lastIdx));
  }
  return nodes;
};

/**
 * Floating "Run test" button rendered next to the BackLink. When clicked, it
 * starts a watch session against the sidecar test-runner server (started by
 * `npm run dev`), streams Playwright output, and shows pass/fail status.
 *
 * Hidden when:
 *  - no spec file exists for the current page
 *  - the sidecar isn't reachable (production / static export)
 *  - the page is loaded under automation (Playwright itself)
 */
type OpenStatus =
  | { kind: 'idle' }
  | { kind: 'opening'; file: string; line: number; col?: number }
  | { kind: 'ok'; file: string; line: number; col?: number; editor?: string }
  | { kind: 'err'; file: string; line: number; col?: number; error: string };

export const RunTestButton: React.FC<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const [pathname, setPathname] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>('page');
  const [specCount, setSpecCount] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<Status>('idle');
  const [active, setActive] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [openStatus, setOpenStatus] = useState<OpenStatus>({ kind: 'idle' });
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);

  const handleOpen: OpenHandler = (file, line, col) => {
    setOpenStatus({ kind: 'opening', file, line, col });
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    fetch(`${baseUrl()}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, col }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.ok) {
          setOpenStatus({ kind: 'ok', file, line, col, editor: data.editor });
        } else {
          setOpenStatus({
            kind: 'err',
            file,
            line,
            col,
            error: data?.error || `HTTP ${response.status}`,
          });
        }
      })
      .catch((err) => {
        setOpenStatus({
          kind: 'err',
          file,
          line,
          col,
          error: String((err && err.message) || err),
        });
      })
      .finally(() => {
        openTimerRef.current = window.setTimeout(() => {
          setOpenStatus({ kind: 'idle' });
          openTimerRef.current = null;
        }, 2500);
      });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (typeof navigator !== 'undefined' && (navigator as any).webdriver) {
      return;
    }

    const url = window.location.pathname;
    setPathname(url);

    fetch(`${baseUrl()}/check?pathname=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        setEnabled(!!data?.exists);
        setMode(data?.mode === 'folder' ? 'folder' : 'page');
        setSpecCount(
          typeof data?.specCount === 'number' ? data.specCount : undefined,
        );
      })
      .catch(() => setEnabled(false));
  }, []);

  // Auto-scroll output panel to the bottom as new lines stream in.
  useEffect(() => {
    if (!showOutput) {
      return;
    }
    const el = outputRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [output, showOutput]);

  // Stop the session when the page is unloaded so the sidecar isn't left
  // running tests after navigation.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleEvent = (event: any) => {
    switch (event?.type) {
      case 'run-start':
        setStatus('running');
        setOutput((prev) => (prev ? prev + SEPARATOR : ''));
        break;
      case 'stdout':
      case 'stderr':
        setOutput((prev) => trimOutput(prev + (event.data ?? '')));
        break;
      case 'run-end':
        setStatus(event.status === 'pass' ? 'pass' : 'fail');
        break;
      case 'change':
        setOutput((prev) => trimOutput(prev + `\n[changed] ${event.file}\n`));
        break;
      case 'trigger':
        setOutput((prev) =>
          trimOutput(prev + `\n[triggered] ${event.reason || 'manual'}\n`),
        );
        break;
      case 'watching':
        setOutput(
          (prev) =>
            prev +
            `[watching] ${(event.files || []).join(', ') || '(no files)'}\n`,
        );
        break;
    }
  };

  const start = async () => {
    if (!pathname || active) {
      return;
    }
    setActive(true);
    setStatus('starting');
    setOutput('');
    setShowOutput(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${baseUrl()}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname, watch: true, project: 'react' }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        setStatus('fail');
        setOutput(`HTTP ${response.status} ${response.statusText}`);
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
        setStatus('fail');
        setOutput((prev) => prev + '\n[error] ' + String(err));
      }
    } finally {
      setActive(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStatus('idle');
    setActive(false);
  };

  // Manual re-run. If a watch session is open, ask the sidecar to re-run
  // in-place over the existing stream (preserves the connection and watchers).
  // If nothing is open — or the server no longer knows about our session
  // (e.g. dev server was restarted, previous /run stream closed) — fall
  // back to starting a fresh session.
  const rerun = async () => {
    if (!pathname) {
      return;
    }
    const startFreshSession = () => {
      abortRef.current?.abort();
      setActive(false);
      // Defer to the next microtask so the abort-driven cleanup in `start`'s
      // finally block has settled before we kick off a new run.
      queueMicrotask(() => {
        void start();
      });
    };
    if (!active) {
      void start();
      return;
    }
    let response: Response | null = null;
    try {
      response = await fetch(`${baseUrl()}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      });
    } catch {
      // network error reaching the sidecar — try a fresh session
      startFreshSession();
      return;
    }
    if (!response.ok) {
      // Most commonly 404 'no active session' when the prior stream is gone.
      startFreshSession();
    }
  };

  if (!enabled || !pathname) {
    return null;
  }

  const buttonLabel = active ? '■ Stop' : labelFor(status, mode, specCount);
  const buttonTitle = active
    ? mode === 'folder'
      ? 'Stop watching this folder'
      : 'Stop watching this test'
    : mode === 'folder'
      ? 'Run all Playwright tests in this folder (watch mode)'
      : 'Run Playwright test for this page (watch mode)';

  return (
    <>
      <button
        type="button"
        onClick={active ? stop : start}
        title={buttonTitle}
        data-testid="infinite-page-run-test"
        style={{
          ...(embedded
            ? {}
            : {
                position: 'fixed',
                bottom: 6,
                right: 38,
                zIndex: 10000,
              }),
          padding: '4px 10px',
          fontSize: 12,
          lineHeight: 1.2,
          border: '1px solid rgba(0, 0, 0, 0.2)',
          borderRadius: 4,
          background: COLORS[status],
          color: '#fff',
          cursor: 'pointer',
          opacity: 0.9,
          minWidth: 84,
          fontFamily: 'inherit',
        }}
      >
        {buttonLabel}
      </button>

      {showOutput && (
        <div
          style={{
            position: 'fixed',
            bottom: 38,
            right: 6,
            width: 540,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            font: '11px ui-monospace, SFMono-Regular, Menlo, monospace',
            borderRadius: 4,
            zIndex: 10000,
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              opacity: 0.85,
            }}
          >
            <span>
              playwright · {labelFor(status, mode, specCount)}
              {active && status !== 'running' ? ' · watching' : ''}
              {openStatus.kind !== 'idle' && (
                <span
                  style={{
                    marginLeft: 8,
                    color:
                      openStatus.kind === 'ok'
                        ? '#86efac'
                        : openStatus.kind === 'err'
                          ? '#fca5a5'
                          : '#bfdbfe',
                  }}
                >
                  ·{' '}
                  {openStatus.kind === 'opening'
                    ? `opening ${openStatus.file}…`
                    : openStatus.kind === 'ok'
                      ? `opened ${openStatus.file}${openStatus.editor ? ` (${openStatus.editor})` : ''}`
                      : `open failed: ${openStatus.error}`}
                </span>
              )}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                onClick={() => setOutput('')}
                title="Clear output"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  font: 'inherit',
                  opacity: 0.8,
                  borderRadius: 4,
                }}
              >
                clear
              </button>
              <button
                type="button"
                onClick={rerun}
                title="Re-run test"
                aria-label="Re-run test"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  borderRadius: 6,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowOutput(false)}
                title="Close panel"
                aria-label="Close panel"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1,
                  borderRadius: 6,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={outputRef}
            style={{
              padding: 8,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              flex: 1,
            }}
          >
            {output
              ? renderOutputNodes(output, handleOpen)
              : active
                ? '(starting…)'
                : '(no output yet)'}
          </div>
        </div>
      )}
    </>
  );
};
