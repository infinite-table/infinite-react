import cn from 'classnames';
import * as React from 'react';

interface InlineCodeProps {
  isLink: boolean;
}
function InlineCode({
  isLink,
  ...props
}: JSX.IntrinsicElements['code'] & InlineCodeProps) {
  return (
    <code
      className={cn(
        'inline text-code text-content-color px-1 rounded-md no-underline',
        {
          'bg-dark-custom py-px': !isLink,
          'bg-highlight-dark py-0': isLink,
        },
      )}
      {...props}
    />
  );
}

InlineCode.displayName = 'InlineCode';

export default InlineCode;
