import Link from 'next/link';
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

const titleOpacity = 'opacity-80';
const subtitleOpacity = 'opacity-70';

export const Card = ({
  href,
  title,
  children,
  className,
  style,
  noBackground,
  noBackgroundOnHover,
  flexContent,
}: {
  flexContent?: boolean;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  title: ReactNode;
  children: ReactNode;
  noBackground?: boolean;
  noBackgroundOnHover?: boolean;
}) => {
  let cls = `${
    className || ''
  } ${card} p-4 sm:p-4 md:p-8 py-10 rounded-sm flex flex-col`;

  if (!noBackgroundOnHover) {
    cls += ` hover:bg-opacity-90 hover:bg-deep-dark `;
  }

  if (!noBackground) {
    cls += ` bg-opacity-60 bg-deep-dark`;
  }

  const content = (
    <>
      <h3 className={titleOpacity}>
        {title} {href ? <>&rarr;</> : null}
      </h3>
      <div
        className={`${subtitleOpacity} text-md flex-1 ${
          flexContent ? 'inline-flex flex-col' : ''
        } leading-relaxed`}
      >
        {children}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className={cls} style={style}>
        {content}
      </div>
    );
  }
  return (
    <Link href={href}>
      <a className={cls} style={style}>
        {content}
      </a>
    </Link>
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

    <Card title="🔎 Examples" href="/docs/learn/getting-started">
      Discover practical examples to help you get started
    </Card>

    <Card title="📢 Blog" href="/blog">
      Read our articles to help you get the most of the Infinite Table
    </Card>

    <Card title="🧪 API Reference" href="/docs/reference">
      Thorough documentation for all API properties, with examples
    </Card>
  </>
);

const commonCls = `leading-relaxed text-center`;

export const CardsTitle = ({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <h3
      className={`${
        className || ''
      } ${commonCls} text-3xl font-bold ${titleOpacity}`}
      style={style}
    >
      {children}
    </h3>
  );
};

export const CardsSubtitle = (props: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?:
    | React.FunctionComponent<
        { children?: ReactNode } & React.HTMLProps<HTMLDivElement>
      >
    | string;
}) => {
  const Cmp = props.as || 'h4';
  const { children, className, style } = props;
  return (
    <Cmp
      className={`${commonCls} text-xl ${subtitleOpacity} ${className || ''}`}
      style={style}
    >
      {children}
    </Cmp>
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

      <CardsTitle>{title ?? defaultTitle}</CardsTitle>

      {subtitle ? <CardsSubtitle as="h4">{subtitle}</CardsSubtitle> : null}
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
    <div className={`mt-24 relative w-full`} style={style}>
      {before}
      <div style={{ margin: '0 auto' }} className="justify-center flex w-full">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 my-20 w-full`}>
          {children}
        </div>
      </div>
    </div>
  );
};
