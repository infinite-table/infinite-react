import { wwwVars } from '@www/styles/www-utils.css';
import Link, { LinkProps } from 'next/link';
import * as React from 'react';
import { CSSProperties, ReactNode } from 'react';
import { buttonPositionWithTransition } from './components.css';

type SecondaryButtonProps = {
  children: ReactNode;
  className?: string;
  href?: LinkProps['href'];
  style?: CSSProperties;
};
export function SecondaryButton(props: SecondaryButtonProps) {
  const { children, className, style, href } = props;
  const Parent = href ? Link : React.Fragment;
  const Cmp = href ? 'a' : 'button';
  const parentProps: any = {};
  if (href) {
    parentProps['href'] = href;
  }
  return (
    <Parent {...parentProps}>
      <Cmp
        className={`text-white rounded-lg inline-block text-xl border border-gray-50 font-normal py-2 px-5 hover:bg-opacity-90 bg-dark-custom ${buttonPositionWithTransition} ${
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
