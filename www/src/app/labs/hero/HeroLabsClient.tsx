'use client';

import * as React from 'react';

import { HeroShowcase } from '@www/components/hero/HeroShowcase';
import type { HeroColorMode } from '@www/components/hero/themes';
import { MainLayout } from '@www/layouts/MainLayout';

/** Review page for the live hero. `?mode=light` previews light mode. */
export function HeroLabsClient() {
  const [mode, setMode] = React.useState<HeroColorMode | undefined>(undefined);
  const [autoplay, setAutoplay] = React.useState(true);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('mode');
    if (requested === 'light' || requested === 'dark') setMode(requested);
    if (params.get('autoplay') === '0') setAutoplay(false);
  }, []);

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-[1480px] px-4 md:px-8 pt-6 pb-24">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-white/40">
              labs · not linked anywhere
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">
              Live hero preview
            </h1>
          </div>
          <div className="font-mono text-xs text-white/40">
            ?mode=light · ?autoplay=0
          </div>
        </div>
        <HeroShowcase
          key={`${mode}-${autoplay}`}
          mode={mode}
          autoplay={autoplay}
        />
      </div>
    </MainLayout>
  );
}
