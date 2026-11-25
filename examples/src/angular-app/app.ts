import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

/**
 * The shell of the Angular examples app: one route per .page.angular.ts
 * test page (routes.generated.ts), with the URL the Next.js app gives its
 * .page.tsx sibling, so one Playwright spec runs against both.
 *
 * The host has the class of Next's #__next root (the same 100vh flex
 * column, src/index.global.css). The router-outlet and the page hosts are
 * `display: contents` (styles.css), so the page roots are its flex items,
 * as in the React and Vue apps.
 */
@Component({
  selector: 'examples-app',
  imports: [RouterOutlet],
  host: { class: '__next' },
  template: `<router-outlet />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}

/** any URL without an Angular page */
@Component({
  template: `<p data-testid="angular-no-page">
    No Angular test page at {{ url }}
  </p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoPage {
  protected readonly url = inject(Router).url;
}
