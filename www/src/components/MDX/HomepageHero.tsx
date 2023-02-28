import * as React from 'react';
import { HighlightBrandToLightBackground } from '../components.css';

import HeroCards from './HeroCards';

function HomepageHero() {
  return (
    <>
      <div className="mt-6 mb-0 sm:mb-8 lg:mb-6 flex-col sm:flex-row flex flex-grow items-start sm:items-center justify-start mx-auto">
        {/* <InfiniteLogo
          color="light"
          className="w-20 sm:w-28 mr-4 mb-4 sm:mb-0 h-auto"
        /> */}
        <div className="flex flex-wrap">
          <h1
            className={`text-5xl mr-4 -mt-1 flex wrap font-bold leading-tight tracking-tighter ${HighlightBrandToLightBackground}`}
          >
            Infinite Table Documentation
          </h1>
        </div>
      </div>
      <HeroCards
        cards={[
          {
            title: 'Learn how to use Infinite Table',
            description: 'Unleash the power of Infinite Table',
            link: '/docs/learn/getting-started',
          },
          {
            title: 'API Reference',
            description: 'Look up the component props',
            link: '/docs/reference',
          },
        ]}
      />
    </>
  );
}

export default HomepageHero;
