import cn from 'classnames';

interface InlineCodeProps {
  isLink: boolean;
}
function InlineCode({
  isLink,
  ...props
}: React.JSX.IntrinsicElements['code'] & InlineCodeProps) {
  return (
    <code
      className={cn('docs-code-inline', { 'docs-code-inline--link': isLink })}
      {...props}
    />
  );
}

InlineCode.displayName = 'InlineCode';

export default InlineCode;
