import Head from 'next/head';

import * as React from 'react';

import {
  colorWhite,
  fontSize,
  marginTop,
  padding,
  paddingX,
  maxWidth,
  textAlign,
  display,
} from '@www/styles/utils.css';

import { Cards } from '@www/components/Cards';
import { GetAccessForm } from '@www/components/GetAccessForm';
import { Footer } from '@www/components/Footer';
import IndexWrapper from './IndexWrapper';

const ReactLogo = (
  <img
    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
    alt=""
    height="5"
    width="20"
    className={display.inlineBlock}></img>
);

export function IndexPage() {
  return (
    <IndexWrapper>
      <div
        className={[
          padding[5],
          marginTop[20],
          maxWidth['7xl'],
          paddingX[14],
          textAlign.center,
          colorWhite,
        ].join(' ')}>
        <p className={`${fontSize['2xl']}`}>
          <b>Infinite Table</b> for React {ReactLogo} is a
          UI component for data virtualization.
        </p>
        <p className={`${marginTop[6]} ${fontSize.xl}`}>
          Huge datasets are no longer a problem!
        </p>
      </div>

      <Cards />

      <GetAccessForm />
    </IndexWrapper>
  );
}
