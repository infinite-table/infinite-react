import Head from 'next/head';

import * as React from 'react';

import {
  backgroundColorBrand,
  backgroundColorBrandDark,
  borderRadius,
  colorWhite,
  fontSize,
  padding,
  fontWeight,
  zIndex,
  display,
  position,
  shadow,
} from '@www/styles/utils.css';

import {
  fullWidthContainer,
  minHeightFull,
} from '@www/components/components.css';

import { Footer } from '@www/components/Footer';
import { Header } from '@www/components/Header';
import { MainLayout } from '@www/layouts/MainLayout';

const ReactLogo = (
  <img
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
    alt=""
    height="5"
    width="20"
    className={display.inlineBlock}></img>
);

export default function IndexWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div
        className={`${fullWidthContainer} ${minHeightFull}  `}>
        <Head>
          <title>Infinite Table for React</title>
          <link
            rel="icon"
            type="image/svg+xml"
            href="/favicon.svg"></link>
        </Head>

        <Header title="Infinite Table" />
        <main
          className={`flex flex-col flex-1 justify-center  w-full items-center px-5 relative ${backgroundColorBrand} `}>
          <div
            className={[
              shadow.lg,
              position.absolute,
              backgroundColorBrandDark,
              fontWeight.bold,
              colorWhite,
              fontSize.sm,
              padding[3],
              borderRadius.md,
              zIndex['0'],
            ].join(' ')}
            style={{ top: '-1.5rem' }}>
            EARLY ADOPTER version available for REACT{' '}
            {ReactLogo}
          </div>
          {children}
        </main>

        <Footer />
      </div>
    </MainLayout>
  );
}
