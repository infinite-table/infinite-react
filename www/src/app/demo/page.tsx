import Link from 'next/link';

import { HeroShowcase } from '@www/components/hero/HeroShowcase';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title: 'Live demo — Infinite Table React DataGrid',
  description:
    'A live trading blotter built with Infinite Table: ticking prices from a Web Worker, sorting, grouping and pivoting while the data updates, up to a million rows, and charts fed by the same stream.',
});

export default function LiveDemoPage() {
  return (
    <div className="w-full px-4 md:px-8 pt-6 pb-16">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Live demo
        </h1>
        <p className="text-sm opacity-60">
          Ticking data, grouping, pivoting and a million rows. Click anywhere
          to take over.{' '}
          <Link href="/docs" className="underline hover:opacity-100">
            Read the docs
          </Link>
        </p>
      </div>
      <HeroShowcase className="hero-frame--page" />
    </div>
  );
}
