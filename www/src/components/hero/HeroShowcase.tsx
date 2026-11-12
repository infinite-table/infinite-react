'use client';

import { LazyShowcase } from '@thedatagrid/docs-kit/showcase';
import type { HeroDemoProps } from './HeroDemo';
import { HeroPoster } from './HeroPoster';

import '@thedatagrid/docs-kit/showcase/styles.css';
import './hero-frame.css';

const loadHeroDemo = () => import('./HeroDemo');

/**
 * The hero as it goes on a page: a static poster paints first, the live demo
 * (grid, worker, charts) is imported when the frame nears the viewport and
 * the browser is idle, then cross-fades in. The frame height is fixed in CSS,
 * so nothing shifts.
 */
export function HeroShowcase({
  className,
  ...props
}: Omit<HeroDemoProps, 'onReady'> & {
  /** Extra frame classes, e.g. `hero-frame--page` for the full-page demo. */
  className?: string;
}) {
  return (
    <LazyShowcase<Omit<HeroDemoProps, 'onReady'>>
      className={className ? `hero-frame ${className}` : 'hero-frame'}
      load={loadHeroDemo}
      props={props}
      poster={<HeroPoster mode={props.mode} />}
    />
  );
}
