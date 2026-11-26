/*
 * The page side of the Vue home page demos (vue-home-*.demo.vue), as
 * composables: the framework-neutral code is in ../home-demo/frame.ts (the
 * site's fonts, light / dark mode, the height of the card for the iframe).
 */
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

import type { ColorMode } from '../../../src/components/home/demos/theme';
import {
  observeSiteMode,
  readSiteMode,
  reportHeight,
} from '../home-demo/frame';

/** Light / dark, as the page that embeds the demo says (`<html data-theme>`). */
export function useSiteMode() {
  const mode = ref<ColorMode>(readSiteMode());
  onBeforeUnmount(observeSiteMode((next) => (mode.value = next)));
  return mode;
}

/** Posts the height of `target` to the page, so it sizes the iframe to it. */
export function useReportHeight(target: Ref<HTMLElement | null>) {
  let stop: (() => void) | null = null;
  onMounted(() => {
    if (target.value) stop = reportHeight(target.value);
  });
  onBeforeUnmount(() => stop?.());
}
