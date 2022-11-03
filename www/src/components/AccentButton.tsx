import { wwwVars } from '@www/styles/www-utils.css';
import Link, { LinkProps } from 'next/link';
import React from 'react';
import { CSSProperties, ReactNode } from 'react';
import { buttonPositionWithTransition } from './components.css';

type AccentButtonProps = {
  children: ReactNode;
  onClick?: VoidFunction;
  className?: string;
  disabled?: boolean;
  href?: LinkProps['href'];
  style?: CSSProperties;
  size?: 'big' | 'small';
};
export function AccentButton(props: AccentButtonProps) {
  const { children, disabled, className, style, href, size = 'big' } = props;
  const Parent = href ? Link : React.Fragment;
  const Cmp = href ? 'a' : 'button';
  const parentProps: any = {};

  if (href) {
    parentProps.href = href;
  }
  return (
    <Parent {...parentProps}>
      <Cmp
        disabled={disabled}
        onClick={props.onClick}
        className={`whitespace-nowrap disabled:opacity-40 bg-highlight rounded-lg inline-flex items-center font-bold hover:bg-opacity-90 text-dark-custom ${buttonPositionWithTransition} ${
          className || ''
        } ${size === 'big' ? 'text-xl  py-2 px-5' : 'text-base py-1 px-3'}`}
        style={{
          boxShadow: `0px 0px 10px 1px ${wwwVars.color.darkBg}`,
          ...style,
        }}
      >
        {children}
      </Cmp>
    </Parent>
  );
}
