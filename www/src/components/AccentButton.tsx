import { newvars } from '@www/styles/www-utils';
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { CSSProperties, ReactNode } from 'react';
import styles from './components.module.css';

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

  const cmpProps = {
    disabled: disabled,
    onClick: props.onClick,
    className: `whitespace-nowrap disabled:opacity-40 ${
      glow ? 'bg-glow hover:bg-glow/90' : 'bg-highlight hover:bg-highlight/90'
    } rounded-lg inline-flex items-center font-bold text-darkcustom ${
      styles.buttonPositionWithTransition
    } ${className || ''} ${
      size === 'big' ? 'text-xl  py-2 px-5' : 'text-base py-1 px-3'
    }`,
    style: {
      boxShadow: `0px 0px 10px 1px ${newvars.color.darkCustom}`,
      ...style,
    },
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
