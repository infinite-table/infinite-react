/**
 * The Angular counterpart of the kit's `AutomatedDemo` (a React component): a
 * scripted cursor drives the LIVE demo inside it while it is in view, and the
 * first real interaction (click / wheel / touch / key) hands control to the
 * user, leaving the demo where the script left it. A broken script ends
 * quietly - it must never break the page.
 *
 * The cursor and the helpers are the kit's own, framework-neutral ones.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  ScriptCancelled,
  createScriptedCursor,
  sleep,
  waitFor,
  type ScriptedCursor,
  type ShowcaseScriptContext,
} from '@thedatagrid/docs-kit/showcase';

type Status =
  /** Not animating: offscreen, before ready, or unsupported device. */
  | 'idle'
  /** The show is running (fake cursor visible). */
  | 'running'
  /** The user interacted - the demo is theirs until they hit replay. */
  | 'user';

const INTERACTIONS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

@Component({
  selector: 'div[heroAutomatedDemo]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'showcase-demo',
    '[attr.data-showcase-status]': 'status()',
  },
  template: `
    <ng-content />
    <!-- cursor layer: above the demo AND its in-demo popups, but transparent to input -->
    <div #overlay aria-hidden="true" class="showcase-demo__overlay"></div>
    @if (status() === 'running') {
      <div class="showcase-pill showcase-pill--running" role="status">
        <span class="showcase-pill__dot"></span>
        {{ runningLabel() }}
      </div>
    }
    @if (status() === 'user') {
      <button
        type="button"
        class="showcase-pill showcase-pill--user"
        (click)="replay()"
      >
        {{ userLabel() }}
      </button>
    }
  `,
})
export class AutomatedDemo {
  /** The demo is mounted and can be driven. */
  readonly ready = input.required<boolean>();
  /** One full pass of the show. Must honour `signal` (use the kit's helpers). */
  readonly run =
    input.required<(context: ShowcaseScriptContext) => Promise<void>>();
  /** Puts the demo back to its initial state; called before every pass. */
  readonly reset =
    input<(context: ShowcaseScriptContext) => void | Promise<void>>();
  /** Wait for this selector inside the root before the first pass. */
  readonly waitForSelector = input<string>();
  /** Pause between passes, in ms. */
  readonly loopPause = input(2600);
  /** No show below this viewport width (and never on touch / reduced motion). */
  readonly minViewportWidth = input(768);
  /** IntersectionObserver threshold for "in view". */
  readonly threshold = input(0.35);
  readonly runningLabel = input('live demo — click anywhere to take over');
  readonly userLabel = input('you’re in control — replay demo ↻');

  protected readonly status = signal<Status>('idle');

  private readonly wrapper: HTMLElement = inject(ElementRef).nativeElement;
  private readonly overlay =
    viewChild.required<ElementRef<HTMLElement>>('overlay');

  private cursor: ScriptedCursor | null = null;
  private abort: AbortController | null = null;
  private intersecting = false;

  constructor() {
    // start when ready, stop when not
    effect(() => {
      const ready = this.ready();
      untracked(() => {
        if (ready) this.tryStart();
        else if (this.status() === 'running') this.stop('idle');
      });
    });

    // a hidden tab is as good as off-screen
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (this.status() === 'running') this.stop('idle');
      } else {
        this.tryStart();
      }
    };

    // The first REAL interaction anywhere on the demo = takeover. The script's
    // own dispatched events are untrusted, which is how we tell them apart.
    const onInteract = (event: Event) => {
      if (!event.isTrusted) return;
      if (this.status() === 'running') this.stop('user');
      // touched before the show got going: don't start it under the user
      else if (this.status() === 'idle' && this.canRunShow()) this.stop('user');
    };

    let observer: IntersectionObserver | null = null;
    afterNextRender(() => {
      // start/pause with viewport visibility
      observer = new IntersectionObserver(
        (entries) => {
          this.intersecting = entries.some((entry) => entry.isIntersecting);
          if (this.intersecting) this.tryStart();
          else if (this.status() === 'running') this.stop('idle');
        },
        { threshold: this.threshold() },
      );
      observer.observe(this.wrapper);
      document.addEventListener('visibilitychange', onVisibility);
      for (const type of INTERACTIONS) {
        this.wrapper.addEventListener(type, onInteract, {
          capture: true,
          passive: true,
        });
      }
    });

    inject(DestroyRef).onDestroy(() => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      for (const type of INTERACTIONS) {
        this.wrapper.removeEventListener(type, onInteract, { capture: true });
      }
      this.abort?.abort();
      this.cursor?.destroy();
      this.cursor = null;
    });
  }

  /** Not on touch-only devices, small viewports, or with reduced motion. */
  private canRunShow() {
    return (
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      window.innerWidth >= this.minViewportWidth()
    );
  }

  private stop(next: Status) {
    this.abort?.abort();
    this.abort = null;
    this.cursor?.hide();
    this.status.set(next);
  }

  private tryStart() {
    if (this.status() !== 'idle') return;
    if (!this.intersecting || !this.ready()) return;
    if (document.visibilityState === 'hidden') return;
    const root = this.wrapper;
    // the show is pointless (and annoying) on touch / small / reduced-motion
    if (!this.canRunShow()) return;

    this.cursor ??= createScriptedCursor(this.overlay().nativeElement);
    const cursor = this.cursor;
    const controller = new AbortController();
    this.abort = controller;
    this.status.set('running');

    void (async () => {
      const { signal } = controller;
      const context: ShowcaseScriptContext = { root, cursor, signal };
      try {
        const selector = this.waitForSelector();
        if (selector) {
          const found = await waitFor(
            () => root.querySelector(selector),
            signal,
            { timeout: 20000 },
          );
          if (!found) throw new ScriptCancelled();
        }
        for (;;) {
          await this.reset()?.(context);
          await sleep(700, signal);
          await this.run()(context);
          cursor.hide();
          await sleep(this.loopPause(), signal);
        }
      } catch (error) {
        cursor.hide();
        if (!(error instanceof ScriptCancelled)) {
          // a broken show must never break the page - just end it quietly
          console.warn('[automated-demo]', error);
          if (this.status() === 'running') this.stop('user');
        }
      }
    })();
  }

  protected replay() {
    if (this.status() === 'running') return;
    this.status.set('idle');
    // let the status flip settle before the loop re-checks it
    requestAnimationFrame(() => this.tryStart());
  }
}
