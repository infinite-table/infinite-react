import { newvars } from '@www/styles/www-utils';
import Link from 'next/link';
import * as React from 'react';
import { CSSProperties, ReactNode } from 'react';
import cmpStyles from './components.module.css';

type SecondaryButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  style?: CSSProperties;
};
export function SecondaryButton(props: SecondaryButtonProps) {
  const { children, className, style, href } = props;

  return (
    <Link
      href={{
        pathname: href,
      }}
      className={`text-white rounded-lg inline-block text-xl border border-gray-50 font-normal py-2 px-5 hover:bg-darkcustom/90 bg-darkcustom ${
        cmpStyles.buttonPositionWithTransition
      } ${className || ''}`}
      style={{
        boxShadow: `0px 0px 10px 1px ${newvars.color.darkCustom}`,
        ...style,
      }}
    >
      {children}
    </Link>
  );
}
