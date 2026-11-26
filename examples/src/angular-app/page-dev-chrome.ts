import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

import {
  buildFrameworkSiblingHref,
  EXAMPLES_FRAMEWORKS,
  type ExamplesFramework,
  FRAMEWORK_LABELS,
  hasFrameworkSibling,
  appPathname,
  isAutomationEnvironment,
  withBasePath,
} from '../test-index/frameworkLinkShared';
import {
  type ExamplesTheme,
  onThemeChange,
  readTheme,
  themeToggleLabel,
  themeToggleTitle,
  toggleTheme,
} from '../test-index/examplesTheme';
import { RunTestButton } from './test-runner';

// the test-runner sidecar (scripts/test-runner-server.js), on this checkout's
// port (env.generated.ts)
const TEST_RUNNER_PORT =
  Number(process.env.NEXT_PUBLIC_TEST_RUNNER_PORT) || 5599;

function parentHrefOf(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  parts.pop();
  return parts.length === 0 ? '/' : `/${parts.join('/')}`;
}

/**
 * The bottom right bar of every page of the Angular examples app, as in the
 * React and Vue apps (src/test-index/PageDevChrome.*): a link back to the
 * page's folder and links to the same page in the React and Vue apps (when
 * they have it), and the "Run test" button (test-runner.ts). Not shown
 * under Playwright.
 */
@Component({
  selector: 'page-dev-chrome',
  imports: [RunTestButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // the bar's look: index.global.css (.ex-chrome), as in the React and Vue
  // apps
  template: `
    @if (!automation) {
      <div class="ex-chrome">
        @if (parentHref(); as href) {
          <a
            [href]="href"
            data-testid="infinite-page-back-link"
            [title]="'Back to ' + href"
            [attr.aria-label]="'Back to ' + href"
            class="ex-chrome-item ex-chrome-icon"
            >←</a
          >
        }
        <run-test-button [pathname]="pathname()" />
        @for (link of links(); track link.target) {
          <a
            [href]="link.href"
            data-testid="infinite-page-framework-link"
            [title]="
              'Open this page in the ' + labels[link.target] + ' examples app'
            "
            class="ex-chrome-item ex-chrome-link"
            >See {{ labels[link.target] }}</a
          >
        }
        <button
          type="button"
          class="ex-chrome-item ex-chrome-icon"
          [title]="themeTitle()"
          [attr.aria-label]="themeTitle()"
          (click)="toggleTheme()"
        >
          {{ themeLabel() }}
        </button>
      </div>
    }
  `,
})
export class PageDevChrome {
  protected readonly automation = isAutomationEnvironment();

  // the light / dark choice (examplesTheme.ts), shared by the three apps
  private readonly theme = signal<ExamplesTheme>(readTheme());
  protected readonly themeLabel = computed(() => themeToggleLabel(this.theme()));
  protected readonly themeTitle = computed(() => themeToggleTitle(this.theme()));
  protected readonly toggleTheme = toggleTheme;
  protected readonly labels = FRAMEWORK_LABELS;

  private readonly router = inject(Router);
  protected readonly pathname = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => appPathname()),
    ),
    // the page's path in the app, without the /angular base path of dev
    { initialValue: appPathname() },
  );

  protected readonly parentHref = computed(() => {
    const parent = parentHrefOf(this.pathname());
    return parent === null ? null : withBasePath(parent);
  });

  protected readonly links = signal<
    { target: ExamplesFramework; href: string }[]
  >([]);

  constructor() {
    inject(DestroyRef).onDestroy(
      onThemeChange((theme) => this.theme.set(theme)),
    );
    effect((onCleanup) => {
      const pathname = this.pathname();
      this.links.set([]);
      if (this.automation || !pathname) return;

      const controller = new AbortController();
      onCleanup(() => controller.abort());
      const base = `${window.location.protocol}//${window.location.hostname}:${TEST_RUNNER_PORT}`;
      fetch(`${base}/check?pathname=${encodeURIComponent(pathname)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data) => {
          this.links.set(
            EXAMPLES_FRAMEWORKS.filter(
              (framework) =>
                framework !== 'angular' && hasFrameworkSibling(data, framework),
            ).map((target) => ({
              target,
              href: buildFrameworkSiblingHref(pathname, target),
            })),
          );
        })
        .catch(() => {
          // the sidecar isn't running (production build, ...)
        });
    });
  }
}
