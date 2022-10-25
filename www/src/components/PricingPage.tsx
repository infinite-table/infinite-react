import { Card, Cards } from '@www/components/Cards';
import { GetAccessForm } from '@www/components/GetAccessForm';
import { MainLayout } from '@www/layouts/MainLayout';

import * as React from 'react';
import { HighlightTextBackground } from './components.css';
import { HeroHeader } from './Header';

import IndexWrapper, { HeroPicture, MainContent } from './IndexWrapper';

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
          Coming <span className={HighlightTextBackground}>soon</span>
        </>
      }
    >
      <HeroPicture />
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
