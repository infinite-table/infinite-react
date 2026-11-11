// Runs inside every docs demo iframe before the demo mounts (see docs-kit.config.mjs).
import { InfiniteTable } from '@infinite-table/infinite-react';

export function setup() {
  // Demos omit the licenseKey prop; the static fallback keeps the code clean.
  const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
  if (licenseKey) {
    InfiniteTable.licenseKey = licenseKey;
  }
}
