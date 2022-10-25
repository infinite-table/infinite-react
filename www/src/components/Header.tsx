import { ReactNode } from '@mdx-js/react/lib';
import Link from 'next/link';
import * as React from 'react';

import {
  fontSize,
  marginBottom,
  marginTop,
  paddingY,
  fontWeight,
  zIndex,
  centeredFlexColumn,
  position,
  shadow,
  wwwVars,
  textAlign,
} from '../styles/www-utils.css';

import { title, width100 } from './components.css';
import { ExternalLink } from './ExternalLink';
import { IceCls, NavBarCls, NavBarWrapCls } from './Header.css';

export const NavBar = () => {
  const itemCls = ` inline-flex ml-1 md:ml-3 first:ml-1 first:md:mr-3 last:mr-1 last:md:mr-3 pointer hover:opacity-75 text-base md:text-lg`;
  return (
    <ul
      className={`${NavBarCls} flex flex-row items-center `}
      style={{ flexWrap: 'wrap' }}
    >
      <li
        className={`${itemCls} font-bold text-base md:text-xl`}
        style={{ letterSpacing: '1px' }}
      >
        <Link href="/">
          <a
            data-logo
            className="inline-flex items-center "
            style={{ width: 'max-content' }}
          >
            <img
              style={{
                height: wwwVars.header.lineHeight,
                maxWidth: '90px',
              }}
              className={`py-4 px-2`}
              src={'/logo-infinite.svg'}
              title="Infinite Table Logo"
            />
            <span className="whitespace-nowrap">Infinite Table</span>
          </a>
        </Link>
      </li>
      <li
        className={`${itemCls} `}
        style={{ flex: 1, margin: 0, marginLeft: 0 }}
      ></li>
      <li className={`${itemCls} `}>
        <Link href="/pricing">
          <a>Pricing</a>
        </Link>
      </li>
      <li className={`${itemCls} `}>
        <Link href="/docs">
          <a>Docs</a>
        </Link>
      </li>
      <li className={`${itemCls} `}>
        <Link href="/blog">
          <a>Blog</a>
        </Link>
      </li>

      <li className={`${itemCls} `}>
        <ExternalLink
          href="https://twitter.com/get_infinite"
          aria-label="InfiniteTable on Twitter"
          className="ml-2 md:ml-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1.33rem"
            height="1.33rem"
            fill="currentColor"
          >
            <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
          </svg>
        </ExternalLink>
      </li>
      <div className={IceCls} />
      <li className={`${itemCls} whitespace-nowrap`}>
        <ExternalLink
          href="https://github.com/infinite-table/infinite-react"
          className="inline-flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.33rem"
            height="1.33rem"
            viewBox="0 0 1024 1024"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
              transform="scale(64)"
              fill="currentColor"
            />
          </svg>{' '}
        </ExternalLink>
      </li>
    </ul>
  );
};

export const NavBarWrap = () => {
  return (
    <nav className={`${NavBarWrapCls} bg-black`}>
      <NavBar />
    </nav>
  );
};
export const Header = (props: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <>
      <NavBarWrap />
      <div className={['relative', width100, centeredFlexColumn].join(' ')}>
        <h1
          style={{
            letterSpacing: '-2.8px',
            zIndex: 1,
          }}
          className={[
            title,
            marginTop[36],
            textAlign.center,
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black opacity-70',
          ].join(' ')}
        >
          {props.title}
        </h1>
        {props.subtitle ? (
          <h2
            className={`text-2xl leading-relaxed mt-20 text-center font-bold text-white justify-center opacity-70`}
            style={{
              zIndex: 2,
              maxWidth: '80%',
              letterSpacing: '-1px',
              lineHeight: 1.3,
            }}
          >
            {props.subtitle}
          </h2>
        ) : null}
        {props.children}
      </div>
    </>
  );
};
