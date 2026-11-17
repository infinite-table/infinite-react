/*
 * The page side of the Vue home page demos (vue-home-*.demo.vue). Each demo is
 * a Vue app, so the home page (VueHomePage.tsx) shows its page in an iframe
 * (VueFrameDemo.tsx). Here: the site's fonts and light / dark mode, and the
 * height of the card, posted to the page so the iframe fits it.
 */
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

import type { ColorMode } from '../../../src/components/home/demos/theme';

const embedded = window.parent !== window;

/**
 * The site's fonts are self-hosted by next/font on the page that embeds the
 * demo (same origin): copy its @font-face rules and the font variables, so
 * the card reads as it does on the React home page.
 */
function adoptSiteFonts() {
  if (!embedded) return;
  try {
    const parent = window.parent.document;
    const rules: string[] = [];
    for (const sheet of Array.from(parent.styleSheets)) {
      let cssRules: CSSRuleList;
      try {
        cssRules = sheet.cssRules;
      } catch {
        continue; // a cross-origin sheet
      }
      for (const rule of Array.from(cssRules)) {
        // the rules are the parent's objects: test the type, not instanceof
        if (rule.constructor.name === 'CSSFontFaceRule') {
          // its url()s are relative to the sheet, not to this page
          const base = sheet.href ?? window.parent.location.href;
          rules.push(
            rule.cssText.replace(
              /url\((['"]?)([^'")]+)\1\)/g,
              (_, quote, url) => `url(${quote}${new URL(url, base)}${quote})`,
            ),
          );
        }
      }
    }
    if (rules.length) {
      const style = document.createElement('style');
      style.textContent = rules.join('\n');
      document.head.appendChild(style);
    }
    const computed = window.parent.getComputedStyle(parent.documentElement);
    for (const name of ['--font-plex-sans', '--font-jetbrains-mono']) {
      const value = computed.getPropertyValue(name);
      if (value) document.documentElement.style.setProperty(name, value);
    }
  } catch {
    // not the site: the fallback fonts of tokens.css
  }
}

adoptSiteFonts();

/**
 * Light / dark, from `<html data-theme>`. The page that embeds the demo sets
 * it: `?theme=` on load, then a `set-theme` message whenever the site's mode
 * changes (the demo runtime writes both to the attribute).
 */
export function useSiteMode() {
  const html = document.documentElement;
  const read = (): ColorMode =>
    html.dataset.theme === 'light' ? 'light' : 'dark';
  const mode = ref<ColorMode>(read());
  const observer = new MutationObserver(() => (mode.value = read()));
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  onBeforeUnmount(() => observer.disconnect());
  return mode;
}

/** Posts the height of `target` to the page, so it sizes the iframe to it. */
export function useReportHeight(target: Ref<HTMLElement | null>) {
  let observer: ResizeObserver | null = null;
  onMounted(() => {
    if (!embedded || !target.value) return;
    observer = new ResizeObserver(([entry]) => {
      const height = Math.ceil(
        entry.borderBoxSize?.[0]?.blockSize ??
          entry.target.getBoundingClientRect().height,
      );
      window.parent.postMessage(
        { type: 'home-demo-size', height },
        location.origin,
      );
    });
    observer.observe(target.value);
  });
  onBeforeUnmount(() => observer?.disconnect());
}
