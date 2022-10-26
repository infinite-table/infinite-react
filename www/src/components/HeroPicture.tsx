import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import demoImage from '../../public/full-demo-image.png';
import { HeroImageCls, HeroImageNormalCls } from './components.css';
import { HighlightButton } from './HighlightButton';
const debounce = require('debounce');

export const HeroImage = <Image src={demoImage} />;

export const HeroPicture = () => {
  const heroImageContainerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const heroImageContainer = heroImageContainerRef.current;
    let hasPerspective = true;
    const fn = debounce(() => {
      const limit = window.innerWidth < 700 ? 150 : 200;
      const shouldHavePerspective = window.scrollY < limit;

      if (shouldHavePerspective != hasPerspective) {
        hasPerspective = shouldHavePerspective;
        heroImageContainer?.classList[shouldHavePerspective ? 'remove' : 'add'](
          HeroImageNormalCls,
        );
      }
    }, 50);
    window.addEventListener('scroll', fn);

    return () => {
      window.removeEventListener('scroll', fn);
    };
  }, []);
  return (
    <Link href="/docs/latest/learn/getting-started/full-demo">
      <a className="cursor-pointer outline-none relative my-20" tabIndex={-1}>
        <div
          ref={heroImageContainerRef}
          className={`${HeroImageCls}`}
          style={{ zIndex: 10 }}
        >
          {HeroImage}
          <div className="absolute top-0 left-0 right-0 bottom-0 opacity-70 hover:opacity-90 bg-white hover:bg-white bg-opacity-0 hover:bg-opacity-10 z-10 cursor-pointer flex items-center justify-center"></div>
        </div>

        <div
          className="absolute top-0 left-0 right-0 bottom-0 z-10 cursor-pointer flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <HighlightButton>See live demo</HighlightButton>
        </div>
      </a>
    </Link>
  );
};
