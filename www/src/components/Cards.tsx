import * as React from 'react';
import { ReactNode } from 'react';

import {
  display,
  centeredFlexProps,
  flexWrap,
  maxWidth,
  marginY,
  marginTop,
} from '../styles/www-utils.css';
import { BannerText } from './BannerText';

import { card, grid, SpotlightRadialBackgroundCls } from './components.css';

const titleOpacity = 'opacity-70';
const subtitleOpacity = 'opacity-60';

export const Card = ({
  href,
  title,
  children,
  noBackground,
}: {
  href?: string;
  title: ReactNode;
  children: ReactNode;
  noBackground?: boolean;
}) => {
  let cls = `${card} p-8 py-10 rounded-sm hover:bg-opacity-90 hover:bg-deep-dark`;

  if (!noBackground) {
    cls += ` bg-opacity-60 bg-deep-dark`;
  }

  const content = (
    <>
      <h3 className={titleOpacity}>
        {title} {href ? <>&rarr;</> : null}
      </h3>
      <div className={`${subtitleOpacity} text-md leading-relaxed`}>
        {children}
      </div>
    </>
  );

  if (!href) {
    return <div className={cls}>{content}</div>;
  }
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
};

const defaultTitle = (
  <>
    Built for{' '}
    <BannerText
      contents={['React', 'speed', 'React', 'speed']} // was intently duplicated
      timeout={8000}
      className={'text-glow'}
    />{' '}
    from the ground-up
  </>
);

const defaultChildren = (
  <>
    <Card title="📃 Documentation" href="/docs">
      Check out our in-depth documentation.
    </Card>

    <Card title="🔎 Examples" href="/docs/latest/learn/getting-started">
      Discover practical examples to help you get started
    </Card>

    <Card title="📢 Blog" href="/blog">
      Read our articles to help you get the most of the Infinite Table
    </Card>

    <Card title="🧪 API Reference" href="/docs/latest/reference">
      Thorough documentation for all API properties, with examples
    </Card>
  </>
);

const commonCls = `leading-relaxed text-center  text-white`;

export const CardsTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h3 className={`${commonCls} text-3xl font-bold ${titleOpacity}`}>
      {children}
    </h3>
  );
};
export const Cards = ({
  title,
  subtitle,
  children,
  spotlight = true,
  style,
}: {
  title?: ReactNode;
  style?: React.CSSProperties;
  subtitle?: ReactNode;
  children?: ReactNode;
  spotlight?: boolean;
}) => {
  const before = (
    <>
      {spotlight ? (
        <div
          style={{ position: 'absolute', inset: 0 }}
          className={`${SpotlightRadialBackgroundCls}`}
        ></div>
      ) : null}

      <h3 className={`${commonCls} text-3xl font-bold ${titleOpacity}`}>
        {title ?? defaultTitle}
      </h3>

      {subtitle ? (
        <h4 className={`${commonCls} text-xl ${subtitleOpacity} `}>
          {subtitle}
        </h4>
      ) : null}
    </>
  );
  return (
    <CardsLayout style={style} before={before}>
      {children ?? defaultChildren}
    </CardsLayout>
  );
};

export const CardsLayout = ({
  before,

  children,
  style,
}: {
  before?: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={`${marginTop[28]} relative w-full`} style={style}>
      {before}
      <div style={{ margin: '0 auto' }} className="justify-center flex w-full">
        <div
          className={`${display.flex} ${grid} ${centeredFlexProps} ${flexWrap.wrap} ${maxWidth['5xl']} ${marginY[16]} w-full`}
          style={{
            gridGap: '2.5rem',
            alignItems: 'stretch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
