import * as React from 'react';
import { Ref, useEffect } from 'react';

import { useInternalProps } from '../../hooks/useInternalProps';
import { join } from '../../../../utils/join';

import { FooterCls } from '../../InfiniteCls.css';
import {
  enforceLicenseFooterStyle,
  getLicenseFooterStyles,
  LICENSE_FOOTER_INVALID_MESSAGE,
  LICENSE_FOOTER_LINK,
} from './licenseFooterShared';

export type InfiniteTableLicenseFooterProps =
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * true when a license key was given, but it is not valid
     */
    invalid?: boolean;
  };

export const InfiniteTableLicenseFooter = React.forwardRef(
  function InfiniteTableLicenseFooter(
    props: InfiniteTableLicenseFooterProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const { invalid = false, ...domProps } = props;
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
      return enforceLicenseFooterStyle(() => domRef.current, invalid);
    }, [invalid]);

    const styles = getLicenseFooterStyles(invalid);

    return (
      <div
        ref={domCallback}
        {...domProps}
        className={join(
          `${rootClassName}-Footer`,
          invalid ? `${rootClassName}-Footer--invalid` : null,
          FooterCls,

          domProps.className,
        )}
        style={styles.footer as React.CSSProperties}
      >
        {invalid ? `${LICENSE_FOOTER_INVALID_MESSAGE} ` : null}
        Powered by{' '}
        <a
          href={LICENSE_FOOTER_LINK}
          rel="noopener noreferrer"
          role="link"
          target="_blank"
          style={styles.anchor as React.CSSProperties}
        >
          Infinite Table
        </a>
      </div>
    );
  },
);
