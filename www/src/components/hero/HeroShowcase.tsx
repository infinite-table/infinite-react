'use client';

import { LazyShowcase } from '../showcase/LazyShowcase';
import type { HeroDemoProps } from './HeroDemo';
import { HeroPoster } from './HeroPoster';

import '../showcase/showcase.css';
import './hero-frame.css';

const loadHeroDemo = () => import('./HeroDemo');

/**
 * The hero as it goes on a page: a static poster paints first, the live demo
 * (grid, worker, charts) is imported when the frame nears the viewport and
 * the browser is idle, then cross-fades in. The frame height is fixed in CSS,
 * so nothing shifts.
 */
export function HeroShowcase(props: Omit<HeroDemoProps, 'onReady'>) {
  return (
    <LazyShowcase<Omit<HeroDemoProps, 'onReady'>>
      className="hero-frame"
      load={loadHeroDemo}
      props={props}
      poster={<HeroPoster mode={props.mode} />}
    />
  );
}
