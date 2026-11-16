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
    <div className="docs-terminal mt-4" translate="no">
      <div className="docs-terminal__bar">
        <div className="flex items-center">
          <IconTerminal className="inline-flex mr-2 self-center" /> Terminal
        </div>
      </div>
      <div className="docs-terminal__body">
        {message}
      </div>
    </div>
  );
}

export default TerminalBlock;
