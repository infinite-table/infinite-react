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
};
export function AccentButton(props: AccentButtonProps) {
  const { children, disabled, className, style, href } = props;
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
        className={`disabled:opacity-40 bg-highlight rounded-lg inline-flex items-center text-xl font-bold py-2 px-5 hover:bg-opacity-90 text-dark-custom ${buttonPositionWithTransition} ${
          className || ''
        }`}
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
