import { HTMLAttributes, RefObject, useRef } from 'react';
import * as React from 'react';
import { join } from '../../../utils/join';
import { useGridScroll } from '../hooks/useGridScroll';
import { ThemeVars } from '../vars.css';
import { HScrollSyncContentCls } from './HScrollSyncContent.css';

export function HScrollSyncContent(
  props: HTMLAttributes<HTMLDivElement> & {
    width?: 'viewport' | 'column';
    maxWidth?: 'viewport' | 'column';
    minWidth?: 'viewport' | 'column';
    scrollable?: boolean;
  },
) {
  const { width, maxWidth, minWidth, scrollable, ...domProps } = props;
  const domRef = useRef<HTMLDivElement>(null);

  useGridScroll(
    (scrollPos) => {
      if (domRef.current && scrollable !== false) {
        domRef.current.style.transform = `translate3d(${-scrollPos.scrollLeft}px, 0px, 0px)`;
      }
    },
    [scrollable],
  );

  const style = { ...domProps.style };

  if (width === 'column') {
    style.width = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (width === 'viewport') {
    style.width = ThemeVars.runtime.bodyWidth;
  }
  if (minWidth === 'column') {
    style.minWidth = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (minWidth === 'viewport') {
    style.minWidth = ThemeVars.runtime.bodyWidth;
  }
  if (maxWidth === 'column') {
    style.maxWidth = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (maxWidth === 'viewport') {
    style.maxWidth = ThemeVars.runtime.bodyWidth;
  }

  return (
    <div
      ref={domRef}
      {...domProps}
      className={
        domProps.className
          ? join(domProps.className, HScrollSyncContentCls)
          : HScrollSyncContentCls
      }
      style={style}
    >
      {domProps.children}
    </div>
  );
}

export function useHScrollSync(ref: RefObject<HTMLDivElement>) {
  useGridScroll((scrollPos) => {
    if (ref.current) {
      ref.current.style.transform = `translate3d(${-scrollPos.scrollLeft}px, 0px, 0px)`;
    }
  }, []);
}
