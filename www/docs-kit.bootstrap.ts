// Runs inside every docs demo iframe before the demo mounts (see docs-kit.config.mjs).
import { InfiniteTable } from '@infinite-table/infinite-react';

/**
 * The `infinite-table` layer goes after Tailwind's `base`, so the Tailwind
 * resets don't affect the component, and before `components` / `utilities`,
 * so Tailwind classes can override the component's styles.
 */
const TAILWIND_LAYER_ORDER =
  '@layer theme, base, infinite-table, components, utilities;';

export async function setup() {
  // Demos omit the licenseKey prop; the static fallback keeps the code clean.
  const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
  if (licenseKey) {
    InfiniteTable.licenseKey = licenseKey;
  }

  // a demo named `<name>-tailwind.demo.tsx`: its page is
  // /gen/demos/<folder>/<name>-tailwind/index.html (which a host may serve as
  // `…/<name>-tailwind/` or `…/<name>-tailwind/index`)
  if (/-tailwind(?:\/(?:index(?:\.html)?)?)?$/.test(location.pathname)) {
    await setupTailwind();
  }
}

/** Tailwind in the browser: it generates the CSS for the classes the demo uses, also after an edit. */
async function setupTailwind() {
  // the layer order is fixed by the first stylesheet that names the layers,
  // so this has to come before the library's CSS
  const layerOrder = document.createElement('style');
  layerOrder.textContent = TAILWIND_LAYER_ORDER;
  document.head.prepend(layerOrder);

  const style = document.createElement('style');
  style.setAttribute('type', 'text/tailwindcss');
  // docs-kit.tailwind.css (see docs-kit.config.mjs)
  style.textContent = process.env.DOCS_TAILWIND_STYLE || '';
  document.head.append(style);

  // @ts-ignore the package is a script: no exports, no types
  await import('@tailwindcss/browser');
}
