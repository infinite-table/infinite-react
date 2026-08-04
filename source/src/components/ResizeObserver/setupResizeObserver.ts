import { OnResizeFn } from '../types/Size';
import { debounce } from '../utils/debounce';

/**
 * Framework-neutral ResizeObserver setup - extracted from the React
 * ResizeObserver component so Vue (and future frameworks) can import it
 * without pulling the React module graph into their bundle.
 */
export const setupResizeObserver = (
  node: HTMLElement,
  callback: OnResizeFn,
  config: { debounce?: number } = { debounce: 0 },
): (() => void) => {
  const debounceTime = config.debounce ?? 0;
  const RO = (window as any).ResizeObserver;

  const onResizeCallback = debounceTime
    ? debounce(callback, { wait: debounceTime })
    : callback;

  const observer = new RO((entries: any[]) => {
    const entry = entries[0];

    let { width, height } = entry.contentRect;

    if (entry.borderBoxSize?.[0]) {
      height = entry.borderBoxSize[0].blockSize;
      width = entry.borderBoxSize[0].inlineSize;
    } else {
      // this is needed for Safari and other browsers that don't have borderBoxSize on the entry object
      const rect = node.getBoundingClientRect();
      height = rect.height;
      width = rect.width;
    }

    onResizeCallback({ width, height });
  });

  observer.observe(node);

  return () => {
    observer.disconnect();
  };
};
