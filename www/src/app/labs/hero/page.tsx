import type { Metadata } from 'next';

import { HeroLabsClient } from './HeroLabsClient';

export const metadata: Metadata = {
  title: 'Labs · live hero demo',
  description: 'Work-in-progress preview of the live homepage demo.',
  robots: { index: false, follow: false, nocache: true },
};

export default function HeroLabsPage() {
  return <HeroLabsClient />;
}
