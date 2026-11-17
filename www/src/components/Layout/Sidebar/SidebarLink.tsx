/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { IconNavArrow } from '@www/components/Icon/IconNavArrow';
import Link from 'next/link';
import * as React from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useIsMobile } from '../useMediaQuery';

interface SidebarLinkProps {
  href: string;
  selected?: boolean;
  title: string;
  badge?: string;
  /** The page only exists for this framework (e.g. "React") - shown as a small marker. */
  frameworkFallback?: string;
  level: number;
  icon?: React.ReactNode;
  heading?: boolean;
  isExpanded?: boolean;
  isBreadcrumb?: boolean;
  hideArrow?: boolean;
}

export function SidebarLink({
  href,
  selected = false,
  title,
  badge,
  frameworkFallback,
  level,
  heading = false,
  isExpanded,
  isBreadcrumb: _,
  hideArrow,
}: SidebarLinkProps) {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (ref && ref.current && !!selected && !isMobile) {
      scrollIntoView(ref.current, {
        scrollMode: 'if-needed',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [ref, selected, isMobile]);

  return (
    <Link
      href={href}
      ref={ref}
      title={title}
      aria-current={selected ? 'page' : undefined}
      data-level={Math.min(level, 2)}
      data-open={isExpanded ? '' : undefined}
      data-heading={heading ? '' : undefined}
      className="docs-side-link"
    >
      <span className="docs-side-link__title">
        {title}
        {frameworkFallback ? (
          <span
            className="docs-framework-marker"
            title={`${frameworkFallback} only for now`}
          >
            {frameworkFallback}
          </span>
        ) : null}
        {badge ? <span className="docs-side-badge">{badge}</span> : null}
      </span>
      {isExpanded != null && !heading && !hideArrow && (
        <IconNavArrow
          className="docs-side-link__arrow"
          displayDirection={isExpanded ? 'down' : 'right'}
        />
      )}
    </Link>
  );
}
