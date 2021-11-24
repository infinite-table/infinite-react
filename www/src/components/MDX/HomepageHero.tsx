import * as React from 'react';
import { Logo } from '@www/components/Logo';
import YouWillLearnCard from '@www/components/MDX/YouWillLearnCard';
import HeroCards from './HeroCards';

function HomepageHero() {
  return (
    <>
      <div className="mt-8 lg:mt-10 mb-0 sm:mt-8 sm:mb-8 lg:mb-6 flex-col sm:flex-row flex flex-grow items-start sm:items-center justify-start mx-auto max-w-4xl">
        <Logo className="text-link dark:text-link-dark w-20 sm:w-28 mr-4 mb-4 sm:mb-0 h-auto" />
        <div className="flex flex-wrap">
          <h1 className="text-5xl mr-4 -mt-1 flex wrap font-bold leading-tight text-primary dark:text-primary-dark">
            Infinite Table Docs
          </h1>
          <div className="inline-flex self-center px-2 mt-1 bg-highlight dark:bg-highlight-dark w-auto rounded text-link dark:text-link-dark uppercase font-bold tracking-wide text-base whitespace-nowrap">
            Beta
          </div>
        </div>
      </div>
      <HeroCards
        cards={[
          {
            title: 'Learn Infinite Table',
            description:
              'Learn & unleash the power of Infinite Table',
            link: '/docs/latest/learn/getting-started',
          },
          {
            title: 'API Reference',
            description: 'Look up the component props',
            link: '"/docs/latest/reference"',
          },
        ]}
      />
    </>
  );
}

export default HomepageHero;
