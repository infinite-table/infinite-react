import * as React from 'react';

import { IconTerminal } from '../Icon/IconTerminal';

type LogLevel = 'info' | 'warning' | 'error';

interface TerminalBlockProps {
  level?: LogLevel;
  children: React.ReactNode;
}

function LevelText({ type }: { type: LogLevel }) {
  switch (type) {
    case 'warning':
      return <span className="text-yellow-50 bg-none mr-1">Warning: </span>;
    case 'error':
      return <span className="text-red-40 mr-1">Error: </span>;
    default:
      return null;
  }
}

function TerminalBlock({ level = 'info', children }: TerminalBlockProps) {
  let message: string | undefined;
  if (typeof children === 'string') {
    message = children;
  } else if (
    React.isValidElement(children) &&
    typeof children.props.children === 'string'
  ) {
    message = children.props.children;
  }

  return (
    <div className="rounded-lg bg-dark-custom  h-full" translate="no">
      <div className=" w-full bg-brand-dark rounded-t-lg">
        <div className="text-primary-dark flex text-sm px-4 py-0.5 relative">
          <IconTerminal className="inline-flex mr-2 self-center" /> Terminal
        </div>
      </div>
      <div className="px-3 sm:px-8 pt-4 pb-6 text-primary-dark font-mono text-code whitespace-pre">
        <LevelText type={level} />
        {message}
      </div>
    </div>
  );
}

export default TerminalBlock;
