import * as React from 'react';
import { Ref, useEffect } from 'react';

import { useInternalProps } from '../../hooks/useInternalProps';
import { join } from '../../../../utils/join';

import { decamelize } from '../../../utils/decamelize';
import { ThemeVars } from '../../vars.css';
import { FooterCls } from '../../InfiniteCls.css';

const defaultStyle: React.CSSProperties = {
  padding: ThemeVars.spacing[2],
  textAlign: 'end',
  opacity: '1',
  visibility: 'visible',
  display: 'block',
  fontSize: '0.85rem',
  background: 'white',
  color: 'black',
};

const anchorStyle: React.CSSProperties = {
  opacity: 1,
  visibility: 'visible',
  display: 'inline-block',
  pointerEvents: 'all',
  color: 'black',
  textDecoration: 'underline',
};

const enforceStyle = (node: HTMLElement | null, style: React.CSSProperties) => {
  if (!node) {
    // TODO protect against Footer node removal
    return;
  }
  for (const [propertyName, propertyValue] of Object.entries(style)) {
    node.style.setProperty(
      decamelize(propertyName),
      propertyValue,
      'important',
    );
  }
};

export const InfiniteTableLicenseFooter = React.forwardRef(
  function InfiniteTableLicenseFooter(
    props: React.HTMLAttributes<HTMLDivElement>,
    ref: Ref<HTMLDivElement>,
  ) {
    const { rootClassName } = useInternalProps();

    const domRef = React.useRef<HTMLDivElement | null>(null);
    const domCallback = React.useCallback((node: HTMLDivElement | null) => {
      domRef.current = node;
      if (!ref) {
        return;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }, []);

    useEffect(() => {
      const forceStyle = () => {
        setTimeout(() => {
          enforceStyle(domRef.current, defaultStyle);
          enforceStyle(
            domRef.current?.firstElementChild as HTMLElement | null,
            anchorStyle,
          );
        });
      };

      forceStyle();

      const intervalId = setInterval(forceStyle, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }, []);

    return (
      <div
        ref={domCallback}
        {...props}
        className={join(
          `${rootClassName}-Footer`,
          FooterCls,

          props.className,
        )}
        style={defaultStyle}
      >
        Powered by{' '}
        <a
          href="https://infinite-table.com"
          rel="noopener noreferrer"
          role="link"
          target="_blank"
        >
          Infinite Table
        </a>
      </div>
    );
  },
);
