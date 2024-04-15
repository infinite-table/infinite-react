'use client';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import demoImage from '../../public/full-demo-image.png';
import cmpStyles from './components.module.css';
import { HighlightButton } from './HighlightButton';
const debounce = require('debounce');

export const HeroImage = <Image priority alt="hero image" src={demoImage} />;

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
          cmpStyles.HeroImageNormalCls,
        );
      }
    }, 50);
    window.addEventListener('scroll', fn);

    return () => {
      window.removeEventListener('scroll', fn);
    };
  }, []);
  return (
    <Link
      href="/full-demo"
      className="cursor-pointer outline-none relative flex items-center justify-center"
      tabIndex={-1}
    >
      <div
        ref={heroImageContainerRef}
        className={`${cmpStyles.HeroImageCls} flex items-center justify-center relative`}
        style={{ zIndex: 10 }}
      >
        {HeroImage}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-70 hover:opacity-90 bg-white hover:bg-white bg-opacity-0 hover:bg-opacity-10 z-10 cursor-pointer flex items-center justify-center"></div>
      </div>

      <div
        className="absolute top-0 left-0 right-0 bottom-0 z-1000 cursor-pointer flex items-center justify-center"
        style={{
          pointerEvents: 'none',
          zIndex: 100,
          // transform is needed for safari - for whatever reason, in safari, this layer is displayed under the image
          transform: 'translate3d(0px,0px,1000px)',
        }}
      >
        <HighlightButton>See live demo</HighlightButton>
      </div>
    </Link>
  );
};
