<script setup lang="ts">
/**
 * The Vue counterpart of the kit's `AutomatedDemo` (a React component): a
 * scripted cursor drives the LIVE demo in its slot while it is in view, and
 * the first real interaction (click / wheel / touch / key) hands control to
 * the user, leaving the demo where the script left it. A broken script ends
 * quietly - it must never break the page.
 *
 * The cursor and the helpers are the kit's own, framework-neutral ones.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
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

const props = withDefaults(
  defineProps<{
    /** The demo is mounted and can be driven. */
    ready: boolean;
    /** One full pass of the show. Must honour `signal` (use the kit's helpers). */
    run: (context: ShowcaseScriptContext) => Promise<void>;
    /** Puts the demo back to its initial state; called before every pass. */
    reset?: (context: ShowcaseScriptContext) => void | Promise<void>;
    /** Wait for this selector inside the root before the first pass. */
    waitForSelector?: string;
    /** Pause between passes, in ms. */
    loopPause?: number;
    /** No show below this viewport width (and never on touch / reduced motion). */
    minViewportWidth?: number;
    /** IntersectionObserver threshold for "in view". */
    threshold?: number;
    runningLabel?: string;
    userLabel?: string;
  }>(),
  {
    loopPause: 2600,
    minViewportWidth: 768,
    threshold: 0.35,
    runningLabel: 'live demo — click anywhere to take over',
    userLabel: 'you’re in control — replay demo ↻',
  },
);

const wrapper = ref<HTMLElement | null>(null);
const overlay = ref<HTMLElement | null>(null);
const status = ref<Status>('idle');

let cursor: ScriptedCursor | null = null;
let abort: AbortController | null = null;
let intersecting = false;
let observer: IntersectionObserver | null = null;

/** Not on touch-only devices, small viewports, or with reduced motion. */
const canRunShow = () =>
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.innerWidth >= props.minViewportWidth;

const stop = (next: Status) => {
  abort?.abort();
  abort = null;
  cursor?.hide();
  status.value = next;
};

const tryStart = () => {
  if (status.value !== 'idle') return;
  if (!intersecting || !props.ready) return;
  if (document.visibilityState === 'hidden') return;
  const root = wrapper.value;
  if (!root || !overlay.value) return;
  // the show is pointless (and annoying) on touch / small / reduced-motion
  if (!canRunShow()) return;

  cursor ??= createScriptedCursor(overlay.value);
  const activeCursor = cursor;
  const controller = new AbortController();
  abort = controller;
  status.value = 'running';

  void (async () => {
    const { signal } = controller;
    const context: ShowcaseScriptContext = {
      root,
      cursor: activeCursor,
      signal,
    };
    try {
      if (props.waitForSelector) {
        const selector = props.waitForSelector;
        const found = await waitFor(
          () => root.querySelector(selector),
          signal,
          { timeout: 20000 },
        );
        if (!found) throw new ScriptCancelled();
      }
      for (;;) {
        await props.reset?.(context);
        await sleep(700, signal);
        await props.run(context);
        activeCursor.hide();
        await sleep(props.loopPause, signal);
      }
    } catch (error) {
      activeCursor.hide();
      if (!(error instanceof ScriptCancelled)) {
        // a broken show must never break the page - just end it quietly
        console.warn('[automated-demo]', error);
        if (status.value === 'running') stop('user');
      }
    }
  })();
};

watch(
  () => props.ready,
  (ready) => {
    if (ready) tryStart();
    else if (status.value === 'running') stop('idle');
  },
);

// a hidden tab is as good as off-screen
const onVisibility = () => {
  if (document.visibilityState === 'hidden') {
    if (status.value === 'running') stop('idle');
  } else {
    tryStart();
  }
};

// The first REAL interaction anywhere on the demo = takeover. The script's
// own dispatched events are untrusted, which is how we tell them apart.
const onInteract = (event: Event) => {
  if (!event.isTrusted) return;
  if (status.value === 'running') stop('user');
  // touched before the show got going: don't start it under the user
  else if (status.value === 'idle' && canRunShow()) stop('user');
};
const INTERACTIONS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

onMounted(() => {
  const root = wrapper.value!;
  // start/pause with viewport visibility
  observer = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      if (intersecting) tryStart();
      else if (status.value === 'running') stop('idle');
    },
    { threshold: props.threshold },
  );
  observer.observe(root);
  document.addEventListener('visibilitychange', onVisibility);
  for (const type of INTERACTIONS) {
    root.addEventListener(type, onInteract, { capture: true, passive: true });
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener('visibilitychange', onVisibility);
  for (const type of INTERACTIONS) {
    wrapper.value?.removeEventListener(type, onInteract, { capture: true });
  }
  abort?.abort();
  cursor?.destroy();
  cursor = null;
});

const replay = () => {
  if (status.value === 'running') return;
  status.value = 'idle';
  // let the status flip settle before the loop re-checks it
  requestAnimationFrame(tryStart);
};
</script>

<template>
  <div ref="wrapper" class="showcase-demo" :data-showcase-status="status">
    <slot />
    <!-- cursor layer: above the demo AND its in-demo popups, but transparent to input -->
    <div ref="overlay" aria-hidden="true" class="showcase-demo__overlay" />
    <div
      v-if="status === 'running'"
      class="showcase-pill showcase-pill--running"
      role="status"
    >
      <span class="showcase-pill__dot" />
      {{ runningLabel }}
    </div>
    <button
      v-if="status === 'user'"
      type="button"
      class="showcase-pill showcase-pill--user"
      @click="replay"
    >
      {{ userLabel }}
    </button>
  </div>
</template>
