/**
 * @jest-environment jsdom
 *
 * The AutoScroller scrolls once per animation frame while the pointer is
 * near an edge, and stops when a frame does not scroll. These tests run its
 * frames by hand, on a clock they control.
 */
import { AutoScroller, defaultAutoScrollerConfig } from './AutoScroller';

const { accelerateAt } = defaultAutoScrollerConfig.durationDampening;

describe('AutoScroller', () => {
  let now = 0;
  let frames: FrameRequestCallback[] = [];

  const runFrameAt = (time: number) => {
    now = time;
    const callbacks = frames;
    frames = [];
    callbacks.forEach((callback) => callback(time));
  };

  // a list in a container 200px high, with 2000px of content
  const createList = () => {
    const container = document.createElement('div');
    container.style.overflowY = 'auto';

    let scrollTop = 0;
    Object.defineProperties(container, {
      clientHeight: { value: 200 },
      scrollHeight: { value: 2000 },
      scrollTop: {
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = value;
        },
      },
    });
    container.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 200,
        width: 100,
        height: 200,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect);

    const list = document.createElement('div');
    container.appendChild(list);
    document.body.appendChild(container);

    return { container, list };
  };

  beforeEach(() => {
    now = 0;
    frames = [];
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    window.requestAnimationFrame = (callback) => frames.push(callback);
    window.cancelAnimationFrame = () => {
      frames = [];
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('scrolls on every frame while the pointer stays near the edge, including the frame at which it starts to accelerate', () => {
    const { container, list } = createList();
    const autoScroller = new AutoScroller({
      orientation: 'vertical',
      onScroll: () => {},
    });

    autoScroller.start(list);
    // near the bottom edge, and then the pointer does not move
    autoScroller.updatePointer({ left: 50, top: 195 });

    // before accelerateAt, one pixel per frame
    runFrameAt(accelerateAt - 60);
    expect(container.scrollTop).toBe(1);

    // a frame exactly at accelerateAt
    runFrameAt(accelerateAt);
    expect(container.scrollTop).toBe(2);
    expect(frames).toHaveLength(1);

    // and it goes on, faster
    runFrameAt(accelerateAt + 200);
    expect(container.scrollTop).toBeGreaterThan(3);
    expect(frames).toHaveLength(1);

    autoScroller.stop();
  });

  test('stops when the container cannot scroll further', () => {
    const { container, list } = createList();
    const autoScroller = new AutoScroller({
      orientation: 'vertical',
      onScroll: () => {},
    });

    autoScroller.start(list);
    container.scrollTop = 1800;
    autoScroller.updatePointer({ left: 50, top: 195 });

    runFrameAt(2000);

    expect(container.scrollTop).toBe(1800);
    expect(frames).toHaveLength(0);

    autoScroller.stop();
  });
});
