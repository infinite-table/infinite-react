import Link, { LinkProps } from 'next/link';
import React from 'react';
import { CSSProperties, ReactNode } from 'react';

type AccentButtonProps = {
  children: ReactNode;
  onClick?: VoidFunction;
  className?: string;
  disabled?: boolean;
  glow?: boolean;
  href?: LinkProps['href'];
  style?: CSSProperties;
  size?: 'big' | 'small';
};
export function AccentButton(props: AccentButtonProps) {
  const {
    glow,
    children,
    disabled,
    className,
    style,
    href,
    size = 'big',
  } = props;

  // the site's primary key (docs.css); `glow` marks it ready to click
  const cmpProps = {
    disabled: disabled,
    onClick: props.onClick,
    className: `site-key site-key--primary ${
      size === 'big' ? 'site-key--lg' : ''
    } ${glow ? 'site-key--ready' : ''} disabled:opacity-40 ${className || ''}`,
    style,
  };

  if (href) {
    return (
      <Link href={href} {...cmpProps}>
        {children}
      </Link>
    );
  }
  return (
    <React.Fragment>
      <button {...cmpProps}>{children}</button>
    </React.Fragment>
  );
}
