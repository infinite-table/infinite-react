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
}: React.JSX.IntrinsicElements['a'] & ButtonLinkProps) {
  const classes = cn(
    className,
    // the pressed / focused states use the same accent as the site's
    // primary buttons (.site-key--primary): --accent, with --accent-fg text
    'inline-flex font-bold items-center border-2 border-transparent outline-none focus:ring-1 focus:ring-offset-2 focus:ring-accent active:bg-accent active:text-accent-fg active:ring-0 active:ring-offset-0 leading-normal',
    {
      'bg-highlight text-darkcustom hover:bg-highlight/80': type === 'primary',
      'bg-secondary-button-dark text-primary-dark hover:text-accent-text focus:bg-accent focus:text-accent-fg focus:border-accent focus:border-2':
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
