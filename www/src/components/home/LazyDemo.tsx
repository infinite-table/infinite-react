'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

const DEMOS = {
  million: dynamic(() => import('./demos/MillionRowsDemo'), { ssr: false }),
  themes: dynamic(() => import('./demos/ThemesDemo'), { ssr: false }),
  pivot: dynamic(() => import('./demos/PivotDemo'), { ssr: false }),
};

/**
 * A live grid that loads when it nears the viewport. The placeholder has the
 * demo's size (set in home.css per demo), so nothing moves when it mounts.
 */
export function LazyDemo({ name }: { name: keyof typeof DEMOS }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Demo = DEMOS[name];
  return (
    <div ref={ref} className={`home-demo home-demo--${name}`}>
      {visible ? <Demo /> : <div className="home-demo__placeholder" />}
    </div>
  );
}
