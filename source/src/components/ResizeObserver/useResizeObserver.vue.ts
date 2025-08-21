import { ref, onMounted, onUnmounted, watch, Ref } from 'vue';
import { Size, OnResizeFn } from '../types/Size';
import { debounce } from '../utils/debounce';

// Shared utility function - same as React version
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
      if (entry.borderBoxSize && entry.borderBoxSize.blockSize) {
        height = entry.borderBoxSize.blockSize;
        width = entry.borderBoxSize.inlineSize;
      }
    }

    onResizeCallback({
      width,
      height,
    });
  });

  observer.observe(node);

  return () => {
    observer.disconnect();
  };
};

export function useResizeObserver(
  targetRef: Ref<HTMLElement | null | undefined>,
  callback: OnResizeFn,
  config: { earlyAttach?: boolean; debounce?: number } = {
    earlyAttach: false,
    debounce: 0,
  },
) {
  const sizeRef = ref<Size>({
    width: 0,
    height: 0,
  });

  let disconnect: (() => void) | null = null;

  const setupObserver = (callback: OnResizeFn) => {
    if (disconnect) {
      disconnect();
      disconnect = null;
    }

    if (targetRef.value) {
      disconnect = setupResizeObserver(
        targetRef.value,
        (size) => {
          size = {
            width: Math.round(size.width),
            height: Math.round(size.height),
          };
          const prevSize = sizeRef.value;
          if (
            prevSize.width !== size.width ||
            prevSize.height !== size.height
          ) {
            sizeRef.value = size;
            callback(size);
          }
        },
        { debounce: config.debounce },
      );
    }
  };

  // Watch for element changes
  watch(() => targetRef.value, () => {
    setupObserver(callback);
  }, { immediate: config.earlyAttach });

  // Setup observer on mount if not early attach
  if (!config.earlyAttach) {
    onMounted(() => {
      setupObserver(callback);
    });
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (disconnect) {
      disconnect();
    }
  });
}