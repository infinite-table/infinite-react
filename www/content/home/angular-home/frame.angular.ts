/*
 * The page side of the Angular home page demos (angular-home-*.demo.angular.ts),
 * as signals: the framework-neutral code is in ../home-demo/frame.ts (the
 * site's fonts, light / dark mode, the height of the card for the iframe).
 */
import {
  DestroyRef,
  afterNextRender,
  inject,
  signal,
  type Signal,
} from '@angular/core';

import type { ColorMode } from '../../../src/components/home/demos/theme';
import {
  observeSiteMode,
  readSiteMode,
  reportHeight,
} from '../home-demo/frame';

/** Light / dark, as the page that embeds the demo says (`<html data-theme>`). */
export function injectSiteMode(): Signal<ColorMode> {
  const mode = signal<ColorMode>(readSiteMode());
  inject(DestroyRef).onDestroy(observeSiteMode((next) => mode.set(next)));
  return mode.asReadonly();
}

/** Posts the height of `target` to the page, so it sizes the iframe to it. */
export function injectReportHeight(target: () => HTMLElement | undefined) {
  let stop: (() => void) | null = null;
  afterNextRender(() => {
    const element = target();
    if (element) stop = reportHeight(element);
  });
  inject(DestroyRef).onDestroy(() => stop?.());
}
