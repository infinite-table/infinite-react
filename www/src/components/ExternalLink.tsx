import classNames from 'classnames';

export function ExternalLink({
  href,
  target,
  children,
  glow,
  ...props
}: React.JSX.IntrinsicElements['a'] & { glow?: boolean }) {
  return (
    <a
      href={href}
      target={target ?? '_blank'}
      rel="noopener"
      {...props}
      className={classNames(props.className || '', glow ? 'text-glow' : '')}
    >
      {children}
    </a>
  );
}

ExternalLink.displayName = 'ExternalLink';
