import * as React from 'react';

import { IconTerminal } from '../Icon/IconTerminal';

interface TerminalBlockProps {
  children: React.ReactNode;
}

function TerminalBlock({ children }: TerminalBlockProps) {
  let message: string | undefined;
  if (typeof children === 'string') {
    message = children;
  } else if (
    React.isValidElement(children) &&
    // @ts-ignore
    typeof children.props.children === 'string'
  ) {
    // @ts-ignore
    message = children.props.children;
  }

  return (
    <div className="rounded-lg bg-darkcustom h-full mt-4" translate="no">
      <div className=" w-full bg-brand-dark rounded-t-lg">
        <div className="text-primary-dark flex text-base px-4 py-0.5 relative">
          <IconTerminal className="inline-flex mr-2 self-center" /> Terminal
        </div>
      </div>
      <div className="px-3 sm:px-8 pt-4 pb-6 text-primary-dark font-mono text-code whitespace-pre">
        {message}
      </div>
    </div>
  );
}

export default TerminalBlock;
