import { HTMLAttributes, RefObject, useRef } from 'react';
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
  const domRef = useRef<HTMLDivElement>(null);

  useGridScroll(
    (scrollPos) => {
      if (domRef.current && props.scrollable !== false) {
        domRef.current.style.transform = `translate3d(${-scrollPos.scrollLeft}px, 0px, 0px)`;
      }
    },
    [props.scrollable],
  );

  const style = { ...props.style };

  if (props.width === 'column') {
    style.width = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (props.width === 'viewport') {
    style.width = ThemeVars.runtime.bodyWidth;
  }
  if (props.minWidth === 'column') {
    style.minWidth = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (props.minWidth === 'viewport') {
    style.minWidth = ThemeVars.runtime.bodyWidth;
  }
  if (props.maxWidth === 'column') {
    style.maxWidth = ThemeVars.runtime.totalVisibleColumnsWidth;
  } else if (props.maxWidth === 'viewport') {
    style.maxWidth = ThemeVars.runtime.bodyWidth;
  }

  return (
    <div
      ref={domRef}
      {...props}
      className={join(props.className, HScrollSyncContentCls)}
      style={style}
    >
      {props.children}
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
