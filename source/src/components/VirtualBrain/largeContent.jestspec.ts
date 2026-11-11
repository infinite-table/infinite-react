/**
 * Unit tests for the very-large-content handling - see largeContent.ts.
 * The browser limit is set explicitly (no probing in jest).
 */
import { HorizontalLayoutMatrixBrain } from './HorizontalLayoutMatrixBrain';
import {
  computeScrollOrigin,
  computeScrollRatio,
  isLargeContentSize,
  LARGE_CONTENT_PROBE_THRESHOLD,
  SCROLL_ORIGIN_REBASE_DISTANCE,
  setMaxElementSizeForTesting,
} from './largeContent';
import { MatrixBrain } from './MatrixBrain';

// what the probe gives in Chrome
const MAX = 16_000_000;

describe('largeContent helpers', () => {
  beforeEach(() => setMaxElementSizeForTesting(MAX));
  afterAll(() => setMaxElementSizeForTesting(undefined));

  it('content that fits is never large', () => {
    expect(isLargeContentSize(1_000)).toBe(false);
    expect(isLargeContentSize(MAX)).toBe(false);
    expect(isLargeContentSize(MAX + 1)).toBe(true);
  });

  it('does not need the limit below the probe threshold', () => {
    // even with an absurdly low limit, small content is never large: below
    // the threshold no browser has problems, and we don't probe
    setMaxElementSizeForTesting(1);
    expect(isLargeContentSize(LARGE_CONTENT_PROBE_THRESHOLD)).toBe(false);
  });

  it('computes the ratio so the native range covers all the content', () => {
    expect(computeScrollRatio(1_000_000, 800)).toBe(1);

    const content = 40_000_000;
    const ratio = computeScrollRatio(content, 800);
    expect(ratio).toBeCloseTo((content - 800) / (MAX - 800), 10);
    // native max scroll -> content max scroll
    expect((MAX - 800) * ratio).toBeCloseTo(content - 800, 4);
  });

  it('moves the origin only past the rebase distance (hysteresis)', () => {
    const D = SCROLL_ORIGIN_REBASE_DISTANCE;
    expect(computeScrollOrigin(D, 0)).toBe(0);
    expect(computeScrollOrigin(D + 10.7, 0)).toBe(D + 10);
    // going back towards the origin doesn't move it
    expect(computeScrollOrigin(D + 10 - D / 2, D + 10)).toBe(D + 10);
    expect(computeScrollOrigin(10, D + 10)).toBe(D + 10);
    // ... until it's more than the rebase distance away
    expect(computeScrollOrigin(9, D + 10)).toBe(9);
    // custom alignment
    expect(computeScrollOrigin(2 * D + 123, 0, (v) => v - (v % 500))).toBe(
      2 * D,
    );
  });
});

function createBrain(rows: number) {
  const brain = new MatrixBrain('test');
  brain.update({
    width: 1000,
    height: 800,
    rows,
    cols: 5,
    rowHeight: 40,
    colWidth: 100,
  });
  return brain;
}

describe('MatrixBrain with very large content', () => {
  beforeEach(() => setMaxElementSizeForTesting(MAX));
  afterAll(() => setMaxElementSizeForTesting(undefined));

  it('changes nothing when the content fits', () => {
    const brain = createBrain(100_000); // 4M px

    expect(brain.isLargeContent('vertical')).toBe(false);
    expect(brain.getScrollRatio('vertical')).toBe(1);
    expect(brain.getNativeScrollSize()).toEqual(
      brain.getVirtualizedContentSize(),
    );

    const native = { scrollTop: 3_000_000, scrollLeft: 50 };
    // same object - identity
    expect(brain.toContentScrollPosition(native)).toBe(native);
    expect(brain.toNativeScrollPosition(native)).toBe(native);

    const onOriginChange = jest.fn();
    brain.onScrollOriginChange(onOriginChange);
    brain.setScrollPosition(native);
    expect(brain.getScrollOrigin()).toEqual({ scrollTop: 0, scrollLeft: 0 });
    expect(brain.getDOMScrollPosition()).toBe(native);
    expect(onOriginChange).not.toHaveBeenCalled();

    brain.destroy();
  });

  it('maps the capped native range onto all the content', () => {
    const brain = createBrain(1_000_000); // 40M px

    expect(brain.isLargeContent('vertical')).toBe(true);
    // only the vertical axis is handled in the normal layout
    expect(brain.isLargeContent('horizontal')).toBe(false);

    expect(brain.getNativeScrollSize()).toEqual({
      width: 500,
      height: MAX,
    });

    const nativeMax = MAX - 800;
    const content = brain.toContentScrollPosition({
      scrollTop: nativeMax,
      scrollLeft: 0,
    });
    // the end of the scrollbar is the end of the content
    expect(content.scrollTop).toBeCloseTo(brain.scrollTopMax, 4);
    expect(brain.scrollTopMax).toBe(40_000_000 - 800);

    // and back
    expect(brain.toNativeScrollPosition(content).scrollTop).toBeCloseTo(
      nativeMax,
      4,
    );
    brain.destroy();
  });

  it('keeps DOM offsets small by moving the origin, with hysteresis', () => {
    const brain = createBrain(1_000_000);
    const origins: number[] = [];
    brain.onScrollOriginChange((origin) => origins.push(origin.scrollTop));

    const scrollTo = (scrollTop: number) =>
      brain.setScrollPosition({ scrollTop, scrollLeft: 0 });

    scrollTo(500_000);
    expect(brain.getScrollOrigin().scrollTop).toBe(0);
    expect(origins).toEqual([]);

    scrollTo(30_000_000.5);
    expect(brain.getScrollOrigin().scrollTop).toBe(30_000_000);
    expect(brain.getDOMScrollPosition().scrollTop).toBe(0.5);

    // within the rebase distance - the origin stays
    scrollTo(30_800_000);
    scrollTo(29_300_000);
    expect(brain.getScrollOrigin().scrollTop).toBe(30_000_000);
    expect(brain.getDOMScrollPosition().scrollTop).toBe(-700_000);

    scrollTo(31_500_000);
    expect(brain.getScrollOrigin().scrollTop).toBe(31_500_000);

    expect(origins).toEqual([30_000_000, 31_500_000]);
    brain.destroy();
  });

  it('resets the origin when the content stops being large', () => {
    const brain = createBrain(1_000_000);
    brain.setScrollPosition({ scrollTop: 20_000_000, scrollLeft: 0 });
    expect(brain.getScrollOrigin().scrollTop).toBe(20_000_000);

    const onOriginChange = jest.fn();
    brain.onScrollOriginChange(onOriginChange);

    brain.update({ rows: 1_000 });

    expect(brain.isLargeContent('vertical')).toBe(false);
    expect(brain.getScrollRatio('vertical')).toBe(1);
    expect(brain.getScrollOrigin()).toEqual({ scrollTop: 0, scrollLeft: 0 });
    expect(onOriginChange).toHaveBeenCalledTimes(1);
    brain.destroy();
  });
});

function createHorizontalLayoutBrains(rows: number) {
  const brain = new HorizontalLayoutMatrixBrain('test', { isHeader: false });
  brain.update({
    width: 1000,
    height: 400,
    rows,
    cols: 5,
    rowHeight: 40,
    colWidth: 100,
  });
  const headerBrain = new HorizontalLayoutMatrixBrain('test-header', {
    isHeader: true,
    masterBrain: brain,
  });
  headerBrain.update({
    width: 1000,
    height: 40,
    rows: 1,
    cols: 5,
    rowHeight: 40,
    colWidth: 100,
  });

  return { brain, headerBrain };
}

describe('HorizontalLayoutMatrixBrain with very large content', () => {
  beforeEach(() => setMaxElementSizeForTesting(MAX));
  afterAll(() => setMaxElementSizeForTesting(undefined));

  it('handles the horizontal axis - rows turn into width', () => {
    // 10 rows per page, 500px per page -> 100k pages = 50M px
    const { brain, headerBrain } = createHorizontalLayoutBrains(1_000_000);

    expect(brain.rowsPerPage).toBe(10);
    expect(brain.getVirtualizedContentSize().width).toBe(50_000_000);
    expect(brain.isLargeContent('horizontal')).toBe(true);
    expect(brain.isLargeContent('vertical')).toBe(false);
    expect(brain.getNativeScrollSize()).toEqual({ width: MAX, height: 400 });

    const content = brain.toContentScrollPosition({
      scrollTop: 0,
      scrollLeft: MAX - 1000,
    });
    expect(content.scrollLeft).toBeCloseTo(brain.scrollLeftMax, 4);

    brain.destroy();
    headerBrain.destroy();
  });

  it('keeps the origin on a page boundary', () => {
    const { brain, headerBrain } = createHorizontalLayoutBrains(1_000_000);

    brain.setScrollPosition({ scrollTop: 0, scrollLeft: 1_234_567 });
    expect(brain.getScrollOrigin().scrollLeft).toBe(1_234_500);
    expect(brain.getScrollOriginPageIndex()).toBe(2_469);
    expect(brain.getDOMScrollPosition().scrollLeft).toBe(67);

    brain.destroy();
    headerBrain.destroy();
  });

  it('the header brain follows the body brain origin', () => {
    const { brain, headerBrain } = createHorizontalLayoutBrains(1_000_000);
    const onHeaderOriginChange = jest.fn();
    headerBrain.onScrollOriginChange(onHeaderOriginChange);

    brain.setScrollPosition({ scrollTop: 0, scrollLeft: 7_000_250 });
    headerBrain.setScrollPosition({ scrollTop: 0, scrollLeft: 7_000_250 });

    expect(headerBrain.getScrollOrigin()).toBe(brain.getScrollOrigin());
    expect(headerBrain.getScrollOriginPageIndex()).toBe(14_000);
    expect(headerBrain.getDOMScrollPosition().scrollLeft).toBe(250);
    expect(onHeaderOriginChange).toHaveBeenCalledTimes(1);

    brain.destroy();
    headerBrain.destroy();
  });

  it('changes nothing when the content fits', () => {
    const { brain, headerBrain } = createHorizontalLayoutBrains(10_000);

    expect(brain.isLargeContent('horizontal')).toBe(false);
    brain.setScrollPosition({ scrollTop: 0, scrollLeft: 300_000 });
    expect(brain.getScrollOriginPageIndex()).toBe(0);
    expect(brain.getDOMScrollPosition()).toBe(brain.getScrollPosition());

    brain.destroy();
    headerBrain.destroy();
  });
});
