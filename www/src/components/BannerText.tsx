import React from 'react';

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

  const [paused, setPaused] = React.useState(false);

  const pausedRef = React.useRef(paused);
  pausedRef.current = paused;

  React.useLayoutEffect(() => {
    setTimeout(() => {
      if (pausedRef.current) {
        // return;
      }
      setIndex((index + 1) % contents.length);
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

  return (
    <div
      className={`inline-block text-left`}
      ref={domRef}
      style={{ width, lineHeight: 0 }}
      onClick={() => {
        setPaused((paused) => !paused);
      }}
    >
      <span className={`${className} inline whitespace-nowrap`} style={style}>
        {contents[index]}
      </span>
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
