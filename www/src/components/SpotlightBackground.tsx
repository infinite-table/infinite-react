import * as React from 'react';
import { SpotlightHorizontalBackgroundCls } from './components.css';

export function SpotlightBackground() {
  return (
    <div
      className={SpotlightHorizontalBackgroundCls}
      style={{
        height: 500,
        width: 500,
      }}
    ></div>
  );
}

  return (
    <Link href="/docs/latest/learn/getting-started/full-demo">
      <a className="cursor-pointer outline-none relative my-20" tabIndex={-1}>
        <div
          ref={heroImageContainerRef}
          className={`${HeroImageCls}`}
          style={{ zIndex: 10 }}
        >
          <Image src={demoImage} />
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