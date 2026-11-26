import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import {
  labelFor,
  outputParts,
  TestRunnerClient,
  type TestRunnerState,
} from '../test-index/testRunnerCore';

// the test-runner sidecar (scripts/test-runner-server.js), on this checkout's
// port (env.generated.ts)
const TEST_RUNNER_PORT =
  Number(process.env.NEXT_PUBLIC_TEST_RUNNER_PORT) || 5599;

export const testRunnerBaseUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;

/**
 * Runs the Playwright spec of a page or a folder on the `angular` project,
 * in watch mode, through the sidecar: the shared client of
 * src/test-index/testRunnerCore.ts, as signals. Create it in an injection
 * context.
 */
export class TestRunner {
  private readonly client = new TestRunnerClient('angular', testRunnerBaseUrl);
  private readonly state = signal<TestRunnerState>(this.client.state);

  readonly enabled = computed(() => this.state().enabled);
  readonly mode = computed(() => this.state().mode);
  readonly specCount = computed(() => this.state().specCount);
  readonly status = computed(() => this.state().status);
  readonly active = computed(() => this.state().active);
  readonly output = computed(() => this.state().output);
  readonly showOutput = computed(() => this.state().showOutput);
  readonly openStatus = computed(() => this.state().openStatus);

  readonly label = computed(() =>
    this.active()
      ? '■ Stop'
      : labelFor(this.status(), this.mode(), this.specCount()),
  );

  /** `pathname`: the page or folder whose specs the button runs (null: none) */
  constructor(pathname?: () => string | null) {
    const unsubscribe = this.client.subscribe((state) => this.state.set(state));
    if (pathname) {
      effect(() => void this.client.check(pathname()));
    }
    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      this.client.dispose();
    });
  }

  start(pathname: string | null) {
    return this.client.start(pathname);
  }

  stop() {
    this.client.stop();
  }

  rerun() {
    return this.client.rerun();
  }

  openInEditor(file: string, line: number, col?: number) {
    this.client.openInEditor(file, line, col);
  }

  clearOutput() {
    this.client.set({ output: '' });
  }

  closeOutput() {
    this.client.set({ showOutput: false });
  }
}

/** the Playwright output of a TestRunner, fixed above the bottom right bar */
@Component({
  selector: 'test-runner-output-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <div class="panel-header">
        <span>
          playwright ·
          {{
            labels.labelFor(
              runner().status(),
              runner().mode(),
              runner().specCount()
            )
          }}
          @if (runner().active() && runner().status() !== 'running') {
            <span> · watching</span>
          }
          @let open = runner().openStatus();
          @if (open.kind !== 'idle') {
            <span [class]="'open-status--' + open.kind">
              ·
              @switch (open.kind) {
                @case ('opening') {
                  opening {{ open.file }}…
                }
                @case ('ok') {
                  opened {{ open.file }}
                  @if (open.editor) {
                    ({{ open.editor }})
                  }
                }
                @case ('err') {
                  open failed: {{ open.error }}
                }
              }
            </span>
          }
        </span>
        <div class="panel-actions">
          <button
            type="button"
            class="panel-btn"
            title="Clear output"
            (click)="runner().clearOutput()"
          >
            clear
          </button>
          <button
            type="button"
            class="panel-btn panel-btn--icon"
            title="Re-run test"
            aria-label="Re-run test"
            (click)="runner().rerun()"
          >
            ↻
          </button>
          <button
            type="button"
            class="panel-btn panel-btn--icon"
            title="Close panel"
            aria-label="Close panel"
            (click)="runner().closeOutput()"
          >
            ×
          </button>
        </div>
      </div>
      <!-- on one line: whitespace would show (white-space: pre-wrap) -->
      <div #body class="panel-body">@if (runner().output()) {@for (part of parts(); track $index) {@if (part.kind === 'link') {<a href="#" class="file-link" [title]="'Open ' + part.file + ':' + part.line + (part.col ? ':' + part.col : '') + ' in editor'" (click)="onOpenClick($event, part.file, part.line, part.col)">{{ part.value }}</a>} @else {<span>{{ part.value }}</span>}}} @else {<span>{{ runner().active() ? '(starting…)' : '(no output yet)' }}</span>}</div>
    </div>
  `,
  styles: `
    .panel {
      position: fixed;
      bottom: 38px;
      right: 6px;
      width: 540px;
      max-width: calc(100vw - 24px);
      max-height: 50vh;
      display: flex;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      font:
        11px ui-monospace,
        SFMono-Regular,
        Menlo,
        monospace;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      opacity: 0.85;
    }
    .panel-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .panel-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      cursor: pointer;
      padding: 4px 8px;
      font: inherit;
      opacity: 0.8;
      border-radius: 4px;
    }
    .panel-btn--icon {
      width: 28px;
      height: 28px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
    }
    .panel-body {
      padding: 8px;
      overflow: auto;
      white-space: pre-wrap;
      flex: 1;
    }
    .file-link {
      color: #7dd3fc;
      text-decoration: underline;
      cursor: pointer;
    }
    .open-status--ok {
      color: #86efac;
    }
    .open-status--err {
      color: #fca5a5;
    }
    .open-status--opening {
      color: #bfdbfe;
    }
  `,
})
export class TestRunnerOutputPanel {
  readonly runner = input.required<TestRunner>();
  readonly pathname = input<string | null>(null);

  protected readonly labels = { labelFor };
  protected readonly parts = computed(() => outputParts(this.runner().output()));

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  constructor() {
    // keep the latest output in view
    afterRenderEffect(() => {
      this.runner().output();
      const el = this.body()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  protected onOpenClick(
    event: MouseEvent,
    file: string,
    line: number,
    col?: number,
  ) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    this.runner().openInEditor(file, line, col);
  }
}

/**
 * The "Run test" button of the bottom right bar (PageDevChrome): runs the
 * spec of the page, or every spec of the folder on an index, on the
 * `angular` project, in watch mode. Shown only when the sidecar finds a
 * spec for the URL.
 */
@Component({
  selector: 'run-test-button',
  imports: [TestRunnerOutputPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // an item of the dev chrome's flex row
  host: { style: 'display: contents' },
  template: `
    @if (runner.enabled() && pathname()) {
      <button
        type="button"
        data-testid="infinite-page-run-test"
        class="ex-chrome-item ex-chrome-run"
        [class]="'tone-' + tone()"
        [title]="title()"
        (click)="runner.active() ? runner.stop() : runner.start(pathname())"
      >
        {{ runner.label() }}
      </button>
      @if (runner.showOutput()) {
        <test-runner-output-panel [runner]="runner" [pathname]="pathname()" />
      }
    }
  `,
  // its look: index.global.css (.ex-chrome-run)
})
export class RunTestButton {
  readonly pathname = input<string | null>(null);

  protected readonly tone = computed(() => {
    const status = this.runner.status();
    return status === 'pass' || status === 'fail' || status === 'idle'
      ? status
      : 'running';
  });
  protected readonly runner = new TestRunner(() => this.pathname());

  protected readonly title = computed(() => {
    const folder = this.runner.mode() === 'folder';
    if (this.runner.active()) {
      return folder ? 'Stop watching this folder' : 'Stop watching this test';
    }
    return folder
      ? 'Run all Playwright tests in this folder (watch mode)'
      : 'Run Playwright test for this page (watch mode)';
  });
}
