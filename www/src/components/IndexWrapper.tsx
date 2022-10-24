import {
  DotsBackgroundCls,
  fullWidthContainer,
  HeroImageCls,
  HeroImageNormalCls,
  minHeightFull,
  SpotlightHorizontalBackgroundCls,
  SpotlightRadialBackgroundCls,
  HighlightTextBackground,
  HighlightBrandToLightBackground,
} from '@www/components/components.css';
import { Footer } from '@www/components/Footer';
import { Header } from '@www/components/Header';
import { MainLayout } from '@www/layouts/MainLayout';

import Image from 'next/image';
import * as React from 'react';

import { Seo } from './Seo';

import demoImage from '../../public/full-demo-image.png';
import { OverlineCls } from './Header.css';
import { BannerText } from './BannerText';

const debounce = require('debounce');

const ReactLogo = (
  <img
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
    alt=""
    height="10"
    width="40"
    style={{ top: -2 }}
    className={`inline-block relative`}
  ></img>
);

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

export default function IndexWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
}) {
  const heroImageContainerRef = React.useRef<HTMLDivElement>(null);
  title = title ?? (
    <>
      <span className={`${''}`}>One Table</span> — Infinite Applications <br />
    </>
  );

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
    <MainLayout>
      <div className={`${fullWidthContainer} ${minHeightFull}  `}>
        <Seo
          titleSuffix={false}
          title="Infinite Table for React | the DataGrid component for large datasets"
        >
          <link rel="icon" type="image/svg+xml" href="/favicon.svg"></link>
        </Seo>

        <Header
          title={
            <div className="relative">
              <div
                className={`${SpotlightRadialBackgroundCls}`}
                style={{
                  height: 500,
                  top: '-50%',
                  left: '-30%',
                  opacity: 1,
                  zIndex: -1,
                }}
              />
              <div className={`${HighlightBrandToLightBackground} relative`}>
                {title}
              </div>
            </div>
          }
          subtitle={
            <>
              DataGrid for building{' '}
              <BannerText
                className={` font-black text-left`}
                setFixedWidth
                contents={[
                  <>
                    <span className={`${HighlightTextBackground}`}>
                      declarative
                    </span>{' '}
                    🚀
                  </>,

                  <>
                    <span className={`${HighlightTextBackground}`}>modern</span>{' '}
                    📦
                  </>,

                  <>
                    <span className={`${HighlightTextBackground}`}>
                      lightweight
                    </span>{' '}
                    🪶
                  </>,
                  <>
                    <span className={`${HighlightTextBackground}`}>typed</span>{' '}
                    ❤️
                  </>,
                  <>
                    <span className={`${HighlightTextBackground}`}>
                      extensible
                    </span>{' '}
                    🏗
                  </>,
                ]}
              />
              <br />
              {ReactLogo} React apps — <b className={`font-black`}>faster</b>
            </>
          }
        >
          <div ref={heroImageContainerRef} className={`${HeroImageCls} my-20`}>
            <Image src={demoImage} />
          </div>
        </Header>
        <main
          className={`flex flex-col flex-1 justify-center w-full items-center px-5 relative ${DotsBackgroundCls}  ${OverlineCls}`}
        >
          {children}
        </main>

        <Footer />
      </div>
    </MainLayout>
  );
}
