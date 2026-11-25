// Runs inside every Angular docs demo iframe (see `frameworks.angular.bootstrap`
// in docs-kit.config.mjs): its providers go into each demo's application.
import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideInfiniteTable } from '@infinite-table/infinite-angular';

// keep in sync with docs-kit.config.mjs and docs-kit.bootstrap.ts
const TAILWIND_LAYER_ORDER =
  '@layer theme, base, infinite-table, components, utilities;';

export async function providers(): Promise<
  (Provider | EnvironmentProviders)[]
> {
  // a demo named `<name>-tailwind.demo.angular.ts`: the same Tailwind setup
  // as the React one (docs-kit.bootstrap.ts)
  if (/-tailwind(?:\/(?:index(?:\.html)?)?)?$/.test(location.pathname)) {
    await setupTailwind();
  }
  // Demos omit the licenseKey input; the global config keeps the code clean.
  const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
  return licenseKey ? [provideInfiniteTable({ licenseKey })] : [];
}

/** Tailwind in the browser: it generates the CSS for the classes the demo uses, also after an edit. */
async function setupTailwind() {
  const layerOrder = document.createElement('style');
  layerOrder.textContent = TAILWIND_LAYER_ORDER;
  document.head.prepend(layerOrder);

  const style = document.createElement('style');
  style.setAttribute('type', 'text/tailwindcss');
  style.textContent = process.env.DOCS_TAILWIND_STYLE || '';
  document.head.append(style);

  // @ts-ignore the package is a script: no exports, no types
  await import('@tailwindcss/browser');
}
