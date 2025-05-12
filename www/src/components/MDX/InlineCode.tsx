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
      className={cn(
        'inline text-code text-content-color px-1 rounded-md no-underline',
        {
          'bg-card-dark py-px': !isLink,
          'bg-card-dark py-0': isLink,
        },
      )}
      {...props}
    />
  );
}

InlineCode.displayName = 'InlineCode';

export default InlineCode;
