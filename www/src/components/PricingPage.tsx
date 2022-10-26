import { Card, Cards } from '@www/components/Cards';

import { MainContent, MainLayout } from '@www/layouts/MainLayout';

import * as React from 'react';
import { GradientTextBackground } from './components.css';
import { HeroImage, HeroPicture } from './HeroPicture';

export function PricingPage() {
  return (
    <MainLayout
      title={
        <>
          <span className={``}>One Pricing</span> — Infinite Applications
        </>
      }
      subtitle={
        <>
          Coming <span className={GradientTextBackground}>soon</span>
        </>
      }
    >
      <div className="w-1/2 mt-20">{HeroImage}</div>
      <MainContent overline={false}>
        <Cards title="" spotlight={false}>
          <Card title="A licensing model that's easy to understand">
            One license per developer - it's that easy!
          </Card>
          <Card title="Flexible team bundles">
            We sell licenses in bundles, which are flexible to allow your team
            to expand.
          </Card>
        </Cards>
      </MainContent>
    </MainLayout>
  );
}
