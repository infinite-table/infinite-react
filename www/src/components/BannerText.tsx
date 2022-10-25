import React, { useEffect } from 'react';
import {
  BannerTextCurrentCls,
  BannerTextNextCls,
  BannerTextPrevCls,
} from './components.css';

export function BannerText(props: {
  contents: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
  timeout?: number;
  setFixedWidth?: boolean;
}) {
  const { contents, className, style, timeout, setFixedWidth = true } = props;
  const [index, setIndex] = React.useState(0);
  const [width, setWidth] = React.useState<string | number>('auto');

  const [transitioning, setTransitioning] = React.useState(false);

  const [paused, setPaused] = React.useState(false);

  const pausedRef = React.useRef(paused);
  pausedRef.current = paused;

  React.useLayoutEffect(() => {
    setTimeout(() => {
      if (pausedRef.current) {
        // return;
      }
      setIndex((index + 1) % contents.length);
      setTransitioning(true);
    }, timeout ?? 3000);
  }, [index, paused]);

  React.useLayoutEffect(() => {
    const children = Array.from(
      domRef.current!.querySelectorAll('[data-text]'),
    );

    const width = Math.max(...children.map((c) => c.scrollWidth));

    if (setFixedWidth) {
      setWidth(width);
    }
  }, [setFixedWidth]);

  const domRef = React.useRef<HTMLDivElement | null>(null);

  const prevIndex = index - 1 < 0 ? contents.length - 1 : index - 1;

  return (
    <div
      className={`inline-flex flex-col text-left relative`}
      ref={domRef}
      style={{ width, lineHeight: 0 }}
      onClick={() => {
        setPaused((paused) => !paused);
      }}
    >
      {contents.map((text, i) => {
        return (
          <span
            key={i}
            className={`${className} inline-block whitespace-nowrap ${
              i == prevIndex
                ? BannerTextPrevCls
                : i == index
                ? BannerTextCurrentCls
                : BannerTextNextCls
            }`}
            style={style}
          >
            {text}
          </span>
        );
      })}

      {contents.map((child, index) => {
        return (
          <div
            data-text
            className="inline-block"
            key={typeof child === 'string' ? child : index + ''}
            style={{
              overflow: 'hidden',
              visibility: 'hidden',
              width: 0,
              height: 0,
            }}
          >
            <span>{child}</span>
          </div>
        );
      })}
    </div>
  );
}
