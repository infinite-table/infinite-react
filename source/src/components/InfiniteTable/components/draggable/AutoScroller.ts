import { PointCoords } from '../../../../utils/pageGeometry/Point';

export type AutoScrollerConfig = {
  // what percentage of container size defines the start of the scroll zone
  // e.g. 0.25 = scrolling starts when within 25% of the edge
  startFromPercentage: number;
  // what percentage of container size defines where max scroll speed kicks in
  maxScrollAtPercentage: number;
  // max pixels scrolled per animation frame
  maxPixelScroll: number;
  // easing function applied to scroll speed based on proximity
  ease: (percentage: number) => number;
  // time dampening: prevents instant scrolling when grabbing near an edge
  durationDampening: {
    stopDampeningAt: number;
    accelerateAt: number;
  };
};

export const defaultAutoScrollerConfig: AutoScrollerConfig = {
  startFromPercentage: 0.25,
  maxScrollAtPercentage: 0.05,
  maxPixelScroll: 28,
  ease: (pct: number) => pct ** 2,
  durationDampening: {
    stopDampeningAt: 1200,
    accelerateAt: 360,
  },
};

function isScrollable(
  element: HTMLElement,
  orientation: 'horizontal' | 'vertical',
): boolean {
  const style = getComputedStyle(element);
  const overflowProp =
    orientation === 'vertical' ? style.overflowY : style.overflowX;

  if (overflowProp !== 'auto' && overflowProp !== 'scroll') {
    return false;
  }

  return orientation === 'vertical'
    ? element.scrollHeight > element.clientHeight
    : element.scrollWidth > element.clientWidth;
}

function findScrollableAncestor(
  element: HTMLElement,
  orientation: 'horizontal' | 'vertical',
): HTMLElement | null {
  let current: HTMLElement | null = element;

  while (current) {
    if (current === document.documentElement || current === document.body) {
      break;
    }

    if (isScrollable(current, orientation)) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

interface DistanceThresholds {
  startScrollingFrom: number;
  maxScrollValueAt: number;
}

function getThresholds(
  containerSize: number,
  config: AutoScrollerConfig,
): DistanceThresholds {
  return {
    startScrollingFrom: containerSize * config.startFromPercentage,
    maxScrollValueAt: containerSize * config.maxScrollAtPercentage,
  };
}

const MIN_SCROLL = 1;

function getValueFromDistance(
  distanceToEdge: number,
  thresholds: DistanceThresholds,
  config: AutoScrollerConfig,
): number {
  if (distanceToEdge > thresholds.startScrollingFrom) {
    return 0;
  }

  if (distanceToEdge <= thresholds.maxScrollValueAt) {
    return config.maxPixelScroll;
  }

  if (distanceToEdge === thresholds.startScrollingFrom) {
    return MIN_SCROLL;
  }

  const percentFromMax =
    (distanceToEdge - thresholds.maxScrollValueAt) /
    (thresholds.startScrollingFrom - thresholds.maxScrollValueAt);

  const percentFromStart = 1 - percentFromMax;

  return Math.ceil(config.maxPixelScroll * config.ease(percentFromStart));
}

function dampenByTime(
  proposedScroll: number,
  dragStartTime: number,
  config: AutoScrollerConfig,
): number {
  const { accelerateAt, stopDampeningAt } = config.durationDampening;
  const runTime = Date.now() - dragStartTime;

  if (runTime >= stopDampeningAt) {
    return proposedScroll;
  }

  if (runTime < accelerateAt) {
    return MIN_SCROLL;
  }

  const pct = (runTime - accelerateAt) / (stopDampeningAt - accelerateAt);

  return Math.ceil(proposedScroll * config.ease(pct));
}

function getScrollForAxis(
  point: number,
  containerStart: number,
  containerEnd: number,
  containerSize: number,
  config: AutoScrollerConfig,
  dragStartTime: number,
  shouldUseDampening: boolean,
): number {
  // no auto-scroll when the pointer is outside the container
  if (point < containerStart || point > containerEnd) {
    return 0;
  }

  const thresholds = getThresholds(containerSize, config);
  const distToStart = point - containerStart;
  const distToEnd = containerEnd - point;
  const closerToEnd = distToEnd < distToStart;

  let value: number;
  if (closerToEnd) {
    value = getValueFromDistance(distToEnd, thresholds, config);
  } else {
    value = -getValueFromDistance(distToStart, thresholds, config);
  }

  if (value === 0) {
    return 0;
  }

  if (shouldUseDampening) {
    const sign = value > 0 ? 1 : -1;
    return sign * dampenByTime(Math.abs(value), dragStartTime, config);
  }

  return value;
}

export type AutoScrollerOnScroll = (scrollDelta: PointCoords) => void;

export class AutoScroller {
  private scrollContainer: HTMLElement | null = null;
  private orientation: 'horizontal' | 'vertical';
  private config: AutoScrollerConfig;
  private rafId: number | null = null;
  private lastPointer: PointCoords = { left: 0, top: 0 };
  private dragStartTime: number = 0;
  private shouldUseDampening: boolean = false;
  private onScroll: AutoScrollerOnScroll;
  private active: boolean = false;

  // captured at drag start before transforms inflate scrollHeight
  private maxScrollTop: number = 0;
  private maxScrollLeft: number = 0;

  constructor(options: {
    orientation: 'horizontal' | 'vertical';
    onScroll: AutoScrollerOnScroll;
    config?: Partial<AutoScrollerConfig>;
  }) {
    this.orientation = options.orientation;
    this.onScroll = options.onScroll;
    this.config = { ...defaultAutoScrollerConfig, ...options.config };
  }

  start(listElement: HTMLElement) {
    this.scrollContainer = findScrollableAncestor(
      listElement,
      this.orientation,
    );

    if (this.scrollContainer) {
      // Snapshot the real content extent before CSS transforms inflate it.
      // During drag, transforms on the active item can extend scrollHeight,
      // creating a feedback loop. Clamping to this snapshot prevents that.
      this.maxScrollTop =
        this.scrollContainer.scrollHeight - this.scrollContainer.clientHeight;
      this.maxScrollLeft =
        this.scrollContainer.scrollWidth - this.scrollContainer.clientWidth;
    }

    this.dragStartTime = Date.now();
    this.shouldUseDampening = true;
    this.active = true;
  }

  getScrollContainer(): HTMLElement | null {
    return this.scrollContainer;
  }

  updatePointer(point: PointCoords) {
    this.lastPointer = point;

    if (!this.rafId && this.active) {
      this.scheduleScroll();
    }
  }

  private scheduleScroll() {
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;

      if (!this.active || !this.scrollContainer) {
        return;
      }

      const delta = this.computeScroll();
      if (delta.top === 0 && delta.left === 0) {
        return;
      }

      const scrollBefore = {
        top: this.scrollContainer.scrollTop,
        left: this.scrollContainer.scrollLeft,
      };

      // Clamp so we never scroll past the real content extent
      // captured at drag start (before transforms inflated scrollHeight).
      const clampedTop = Math.max(
        0,
        Math.min(this.maxScrollTop, scrollBefore.top + delta.top),
      );
      const clampedLeft = Math.max(
        0,
        Math.min(this.maxScrollLeft, scrollBefore.left + delta.left),
      );

      this.scrollContainer.scrollTop = clampedTop;
      this.scrollContainer.scrollLeft = clampedLeft;

      const actualDelta = {
        top: this.scrollContainer.scrollTop - scrollBefore.top,
        left: this.scrollContainer.scrollLeft - scrollBefore.left,
      };

      const didScroll = actualDelta.top !== 0 || actualDelta.left !== 0;

      if (didScroll) {
        this.onScroll(actualDelta);
      }

      // Only continue the loop if scrolling actually happened.
      // When the container hits its scroll limit the browser clamps scrollTop,
      // actualDelta becomes 0, and we stop. The next updatePointer() call
      // will restart the loop if the user moves to a scrollable direction.
      if (this.active && didScroll) {
        this.scheduleScroll();
      }
    });
  }

  private computeScroll(): PointCoords {
    if (!this.scrollContainer) {
      return { top: 0, left: 0 };
    }

    const rect = this.scrollContainer.getBoundingClientRect();

    // Only scroll when the pointer is within the container on the cross axis.
    // Without this, dragging an item off to the side of a list still triggers
    // scrolling because the scroll-axis position is near an edge.
    if (this.orientation === 'vertical') {
      if (
        this.lastPointer.left < rect.left ||
        this.lastPointer.left > rect.right
      ) {
        return { top: 0, left: 0 };
      }
    } else {
      if (
        this.lastPointer.top < rect.top ||
        this.lastPointer.top > rect.bottom
      ) {
        return { top: 0, left: 0 };
      }
    }

    let scrollTop = 0;
    let scrollLeft = 0;

    if (this.orientation === 'vertical') {
      scrollTop = getScrollForAxis(
        this.lastPointer.top,
        rect.top,
        rect.bottom,
        rect.height,
        this.config,
        this.dragStartTime,
        this.shouldUseDampening,
      );
    } else {
      scrollLeft = getScrollForAxis(
        this.lastPointer.left,
        rect.left,
        rect.right,
        rect.width,
        this.config,
        this.dragStartTime,
        this.shouldUseDampening,
      );
    }

    return { top: scrollTop, left: scrollLeft };
  }

  stop() {
    this.active = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scrollContainer = null;
  }
}
