// Runs inside every Angular docs demo iframe (see `frameworks.angular.bootstrap`
// in docs-kit.config.mjs): its providers go into each demo's application.
import type { EnvironmentProviders, Provider } from '@angular/core';
import { provideInfiniteTable } from '@infinite-table/infinite-angular';

export function providers(): (Provider | EnvironmentProviders)[] {
  // Demos omit the licenseKey input; the global config keeps the code clean.
  const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
  return licenseKey ? [provideInfiniteTable({ licenseKey })] : [];
}
