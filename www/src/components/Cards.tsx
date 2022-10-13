import * as React from 'react';
import { ReactNode } from 'react';

import {
  colorWhite,
  backgroundColorBlue700,
  borderRadius,
  fontSize,
  display,
  centeredFlexProps,
  flexWrap,
  maxWidth,
  marginY,
  shadow,
} from '../styles/utils.css';

import { card, grid } from './components.css';

const Card = ({
  href,
  title,
  children,
}: {
  href: string;
  title: ReactNode;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      className={`${card}
      text-wash dark:text-wash hover:text-wash-dark hover:bg-wash dark:hover:bg-wash-dark bg-blue-700  ${shadow.md} ${borderRadius.default}`}
    >
      <h3>{title} &rarr;</h3>
      <p className={fontSize.lg}>{children}</p>
    </a>
  );
};
export const Cards = () => {
  return (
    <div
      className={`${display.flex} ${grid} ${centeredFlexProps} ${flexWrap.wrap} ${maxWidth['5xl']} ${marginY[16]} `}
      style={{
        gridGap: '1.5rem',
        alignItems: 'stretch',
      }}
    >
      <Card title="📃 Documentation" href="/docs">
        Find in-depth information about <b>REACT INFINITE TABLE</b>.
      </Card>

      <Card title="🔎 Examples" href="/docs/latest/learn/getting-started">
        Discover practical examples to help you get started
      </Card>

      <Card title="📢 Blog" href="/blog">
        Read our articles to help you get the most of the Infinite Table
      </Card>

      <Card title="🧪 API Reference" href="/docs/latest/reference">
        Thorough documentation for all properties
      </Card>
    </div>
  );
};
