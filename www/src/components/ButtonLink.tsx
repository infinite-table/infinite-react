import cn from 'classnames';
import NextLink from 'next/link';
import * as React from 'react';

interface ButtonLinkProps {
  size?: 'md' | 'lg';
  type?: 'primary' | 'secondary';
  label?: string;
  target?: '_self' | '_blank';
}

function ButtonLink({
  href,
  className,
  children,
  type = 'primary',
  size = 'md',
  label,
  target = '_self',
  ...props
}: JSX.IntrinsicElements['a'] & ButtonLinkProps) {
  const classes = cn(
    className,
    'inline-flex font-bold items-center border-2 border-transparent outline-none focus:ring-1 focus:ring-offset-2 focus:ring-link active:bg-link active:text-white active:ring-0 active:ring-offset-0 leading-normal',
    {
      'bg-highlight text-darkcustom hover:bg-highlight/80': type === 'primary',
      'bg-secondary-button-dark text-primary-dark hover:text-link focus:bg-link focus:text-white focus:border-link focus:border-2':
        type === 'secondary',
      'text-lg rounded-lg p-4': size === 'lg',
      'text-base rounded-lg px-4 py-1.5': size === 'md',
    },
  );
  return (
    //@ts-ignore
    <NextLink
      href={href as string}
      className={classes}
      {...props}
      aria-label={label}
      target={target}
    >
      {children}
    </NextLink>
  );
}

export default ButtonLink;
