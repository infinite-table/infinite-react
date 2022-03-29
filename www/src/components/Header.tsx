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
} from '../styles/utils.css';

import { title, width100 } from './components.css';
import { ExternalLink } from './ExternalLink';
import { IconOpenInWindow } from './Icon/IconOpenInWindow';
import { darkIcon, lightIcon } from './Layout/Nav/Nav';
import { OpenInWindowButton } from './MDX/Sandpack/OpenInWindowButton';

export const Header = (props: { title: string }) => {
  return (
    <div
      className={[
        position.relative,
        // backgroundColorWhite,
        // shadow.md,
        marginBottom[10],
        paddingY[16],
        width100,
        centeredFlexColumn,
        'bg-wash dark:bg-wash-dark',
        'text-primary',
        'dark:text-primary-dark',
      ].join(' ')}>
      <div className="absolute flex flex-row items-center top-10 right-10 ">
        <div className="block dark:hidden ">
          <button
            type="button"
            aria-label="Use Dark Mode"
            onClick={() => {
              window.__setPreferredTheme('dark');
            }}
            className=" lg:flex items-center h-full pr-2">
            {darkIcon}
          </button>
        </div>
        <div className="hidden dark:block">
          <button
            type="button"
            aria-label="Use Light Mode"
            onClick={() => {
              window.__setPreferredTheme('light');
            }}
            className=" lg:flex items-center h-full pr-2">
            {lightIcon}
          </button>
        </div>{' '}
        <ExternalLink
          href="https://twitter.com/get_infinite"
          aria-label="InfiniteTable on Twitter"
          className="ml-3 hover:text-link dark:hover:text-link ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1.33em"
            height="1.33em"
            fill="currentColor">
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
          </svg>
        </ExternalLink>
        <ExternalLink
          className="ml-3 hover:text-link dark:hover:text-link "
          href="https://github.com/infinite-table/infinite-react">
          GitHub{' '}
          <IconOpenInWindow className="inline mb-2 mr-1 mt-1 text-sm" />{' '}
        </ExternalLink>
      </div>
      <a className={`${position.relative}`} href="/">
        <img
          width={150}
          height={70}
          src="/logo-infinite.svg"
          className={zIndex[10]}
        />
      </a>

      <h1
        className={[
          title,
          marginTop[8],
          marginBottom[0],
          fontSize['4xl'],
          fontWeight.inherit,
        ].join(' ')}>
        {props.title}
      </h1>
    </div>
  );
};
