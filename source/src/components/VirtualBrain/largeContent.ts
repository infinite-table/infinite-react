/**
 * # Very large content - more pixels than browsers can lay out
 *
 * ## How Infinite scrolls (the part that matters here)
 *
 * The user never scrolls the grid content directly. They scroll an (almost)
 * empty container, whose only job is to have the right scroll range - it
 * contains a spacer (`SpacePlaceholder`) sized like the content. We listen to
 * `scroll` on it and move all the layers (body, header, pinned areas, active
 * indicators) with CSS transforms, in the same frame:
 *  - the body layer (`scroll-transform-target`) gets
 *    `translate3d(-scrollLeft, -scrollTop)`
 *  - every cell gets the absolute offset of its row/column
 *    (`translate3d(x, rowTop)`).
 * The brains (`MatrixBrain` / `HorizontalLayoutMatrixBrain`) work with those
 * absolute ("content") offsets.
 *
 * ## The problem
 *
 * Browsers clamp CSS lengths. Measured in Nov 2026 (Playwright):
 *
 * | engine          | max element height | transforms paint right up to |
 * |-----------------|--------------------|------------------------------|
 * | Chrome 136      | 16,777,214px (~2^24) | 16M (17M is clamped)       |
 * | Safari 18.4     | 33,554,428px (~2^25) | 33M (40M is clamped)       |
 * | Firefox 137     | ~8,947,849px         | 8M (16M is broken)         |
 *
 * Firefox is tricky: up to ~17.9M px a div *reports* the right clientHeight
 * (and a scroll container scrolls that far), but layout positions above
 * ~8.9M are wrong (getBoundingClientRect shows it) and so is painting - so
 * at 300k rows x 40px (12M) rows were not visible at the end, even though
 * the scrollbar got there.
 *
 * Two different things break, at about the same size in each engine:
 *  1. the spacer can't be as tall/wide as the content, so the scrollbar can't
 *     reach the end (1M rows x 40px = 40M px; Chrome stopped at row ~419k,
 *     Safari at ~838k; Firefox doesn't even clamp a 40M spacer - it collapses
 *     and nothing scrolls)
 *  2. transform values above the limit are clamped, so cells far down are
 *     painted at the wrong place (even with a working scrollbar)
 *
 * `calc()` with two big terms that cancel out is not clamped, but Firefox
 * evaluates it with ±1px errors at 20M+, so we never rely on that - all the
 * values we write stay small.
 *
 * In horizontal layout (`wrapRowsHorizontally`) the row count turns into
 * width (`pageWidth x pageCount`), so the limit is hit much earlier there
 * (~106k rows for 20 columns of 150px with 19 rows per page, in Chrome).
 *
 * ## The fix - only when needed
 *
 * When the content fits (by far the most common case), nothing changes: the
 * ratio is 1, the origin is 0 and the DOM output is the same as before.
 *
 * When the content size on an axis is bigger than the limit (see
 * {@link getMaxElementSize}), two things kick in for that axis:
 *
 * ### a) scroll ratio (the scrollbar covers all the content)
 *
 * The spacer is capped at the limit and the native scroll position is
 * multiplied by
 *
 *    ratio = (contentSize - viewportSize) / (nativeSize - viewportSize)
 *
 * to get the content position, which is what the brain and the transforms
 * use. Writes (api.scrollTop = x, scrollRowIntoView...) divide by it.
 * The public API keeps working with content pixels.
 *
 * Consequence (accepted): in this mode, wheel / trackpad / native keyboard
 * scrolling moves the content `ratio` times faster than usual (2.4x for 1M
 * rows of 40px in Chrome) and content moves in `ratio`-px steps. Same as AG
 * Grid's "stretching". We considered a non-passive `wheel` listener to move
 * content 1:1 with the wheel, and decided against it: more moving parts and
 * no gain for touch input.
 *
 * ### b) scroll origin, a.k.a. rebasing (transform values stay small)
 *
 * All DOM offsets are written relative to an origin close to the current
 * scroll position: the body layer gets `-(scroll - origin)` and cells get
 * `offset - origin`. On screen nothing changes (it's the difference that
 * matters), but the numbers stay far below the clamp.
 *
 * The origin does NOT follow the scroll position on every frame - that would
 * mean rewriting every rendered cell's transform on every frame (which is
 * what AG Grid does: it repositions all rows on every scroll). Infinite's
 * scrolling writes only one transform per frame (the layer's), and we keep
 * that: the origin stays fixed while scrolling and only moves when the
 * scroll position gets more than {@link SCROLL_ORIGIN_REBASE_DISTANCE} away
 * from it (hysteresis - so scrolling back and forth around a point doesn't
 * rebase every time). When it moves, all rendered cells are repositioned
 * once, in the same frame as the layer.
 *
 * In horizontal layout the horizontal origin is a whole number of pages, so
 * cell offsets can stay `calc(pageWidth * (pageIndex - originPageIndex))` and
 * keep following column resizes through the CSS var.
 *
 * ### c) content size changes (filtering, more rows loaded, resizing)
 *
 * When the ratio changes, we keep the content position the user was looking
 * at (and rewrite the native scroll position), rather than keep the scrollbar
 * thumb where it was.
 *
 * ## The limit
 *
 * Probed once per page, lazily, only when some content gets bigger than
 * {@link LARGE_CONTENT_PROBE_THRESHOLD} - grids with normal sizes never probe.
 * Like AG Grid's `_getMaxDivHeight`: grow a hidden div (1M, 2M, 4M ... px)
 * until the browser doesn't lay it out at that height anymore - checked with
 * getBoundingClientRect, not clientHeight (see Firefox above; AG Grid
 * instead caps its probe at 6M in Firefox). The result is a power of two
 * times 1M - just below the real limit (16M in Chrome, 32M in Safari, 8M in
 * Firefox), which leaves a safety margin. Transforms break at about the same
 * size as layout positions in each engine (see the table), so the same
 * number is used for both a) and b).
 *
 * Supported axes: vertical for the normal layout, horizontal for the
 * horizontal layout (where its vertical axis always fits the viewport).
 * Column offsets in the normal layout come from CSS vars computed by the
 * table, so >16M px of columns is not supported.
 *
 * Column reorder auto-scroll (reorderColumnsOnDrag / progressiveSpeedScroller)
 * goes through the API (content px), so it follows the mapping. (DragList's
 * own AutoScroller uses native deltas, but it never runs for the header: the
 * header is not inside the scroll container, so it finds nothing to scroll.)
 *
 * On a scaled axis (only a huge horizontal layout) one native px is `ratio`
 * content px, and Firefox and Safari round the native scroll position - so
 * the slowest auto-scroll steps (1-2 content px per frame) would be lost and
 * auto-scroll would not move at all. See {@link createSteppedScrollPosition}.
 */

/**
 * Below this size no browser has trouble (Firefox, the lowest, supports
 * ~8.9M px) - so we don't even need to probe.
 */
export const LARGE_CONTENT_PROBE_THRESHOLD = 4_000_000;

/**
 * How far the scroll position can get from the scroll origin before the
 * origin moves (see "scroll origin" above). Anything well below the limit
 * minus the viewport and the render buffer works; bigger means fewer
 * repositioning passes.
 */
export const SCROLL_ORIGIN_REBASE_DISTANCE = 1_000_000;

const PROBE_START = 1_000_000;
const PROBE_MAX = 64_000_000;

let maxElementSize: number | undefined;

function probeMaxElementSize(): number {
  if (typeof document === 'undefined' || !document.body) {
    // no DOM to measure (SSR) - nothing scrolls there anyway
    return Infinity;
  }
  const div = document.createElement('div');
  div.style.cssText =
    'position:absolute;top:0;left:0;width:1px;visibility:hidden;pointer-events:none';
  document.body.appendChild(div);

  const applies = (size: number) => {
    div.style.height = `${size}px`;
    // NOT clientHeight: Firefox reports clientHeight 16M for a 16M div, while
    // its layout (getBoundingClientRect) - and painting - stop at ~8.9M
    return Math.abs(div.getBoundingClientRect().height - size) < 1;
  };

  let size = PROBE_START;
  if (!applies(size)) {
    // no real layout (e.g. jsdom) - we can't know the limit, so don't
    // pretend there is one
    div.remove();
    return Infinity;
  }
  while (size < PROBE_MAX && applies(size * 2)) {
    size *= 2;
  }
  div.remove();
  return size;
}

/**
 * The largest size (px) we can give to an element - and use in a transform -
 * in this browser. See the notes at the top of this file.
 */
export function getMaxElementSize(): number {
  if (maxElementSize === undefined) {
    maxElementSize = probeMaxElementSize();
  }
  return maxElementSize;
}

/**
 * For tests only - pass undefined to go back to probing.
 */
export function setMaxElementSizeForTesting(size: number | undefined) {
  maxElementSize = size;
}

export function isLargeContentSize(contentSize: number) {
  if (contentSize <= LARGE_CONTENT_PROBE_THRESHOLD) {
    return false;
  }
  return contentSize > getMaxElementSize();
}

/**
 * native scroll px -> content px. 1 unless the content is too large.
 */
export function computeScrollRatio(contentSize: number, viewportSize: number) {
  if (!isLargeContentSize(contentSize)) {
    return 1;
  }
  const nativeScrollMax = getMaxElementSize() - viewportSize;
  const contentScrollMax = contentSize - viewportSize;

  return nativeScrollMax > 0 && contentScrollMax > 0
    ? contentScrollMax / nativeScrollMax
    : 1;
}

/**
 * A scroll position for code that scrolls in small steps and reads the
 * position back before each step - the column reorder auto-scroll
 * (reorderColumnsOnDrag), which adds 1-15 content px per frame.
 *
 * On a scaled axis one native px is `ratio` content px, and Firefox and
 * Safari round the native scroll position - so a step smaller than that is
 * lost: the native position stays the same, no scroll event fires, the next
 * step starts from the same place again and auto-scroll never moves (Chrome
 * keeps fractional scroll offsets, so it's not affected).
 *
 * So we keep the position we asked for (not rounded) and add to it, as long
 * as the real position is still within a native px of it. When it isn't
 * (something else scrolled, or we hit the end), we go back to the real one.
 * When the axis is not scaled (ratio 1), it's simply the real position.
 */
export function createSteppedScrollPosition(options: {
  getScrollPosition: () => number;
  setScrollPosition: (value: number) => void;
  getScrollRatio: () => number;
}) {
  let requested: number | null = null;

  return {
    get value() {
      const actual = options.getScrollPosition();
      const ratio = options.getScrollRatio();
      if (
        ratio > 1 &&
        requested !== null &&
        Math.abs(requested - actual) <= ratio
      ) {
        return requested;
      }
      requested = null;
      return actual;
    },
    set value(value: number) {
      requested = value;
      options.setScrollPosition(value);
    },
  };
}

/**
 * The origin to use, given the current one and the scroll position.
 * Hysteresis: it only moves when the scroll position is more than
 * SCROLL_ORIGIN_REBASE_DISTANCE away from it.
 */
export function computeScrollOrigin(
  scroll: number,
  currentOrigin: number,
  align: (value: number) => number = Math.floor,
) {
  if (Math.abs(scroll - currentOrigin) <= SCROLL_ORIGIN_REBASE_DISTANCE) {
    return currentOrigin;
  }
  return align(scroll);
}
