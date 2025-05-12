import cn from 'classnames';
import * as React from 'react';

import { IconError } from '../Icon/IconError';
import { IconWarning } from '../Icon/IconWarning';

type LogLevel = 'info' | 'warning' | 'error';

interface ConsoleBlockProps {
  level?: LogLevel;
  children: React.JSX.Element;
}

const Box = ({
  width = '60px',
  height = '17px',
  className,
  customStyles,
}: {
  width?: string;
  height?: string;
  className?: string;
  customStyles?: Record<string, string>;
}) => (
  <div className={className} style={{ width, height, ...customStyles }}></div>
);
Box.displayName = 'Box';

function ConsoleBlock({ level = 'info', children }: ConsoleBlockProps) {
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
    <div className="mb-4" translate="no">
      <div className="flex w-full rounded-t-lg bg-gray-80">
        <div className="px-4 py-2 border-gray-90 border-r">
          <Box className="bg-gray-90" width="15px" />
        </div>
        <div className="flex text-sm px-4">
          <div className="border-b-2 border-gray-90">Console</div>
          <div className="px-4 py-2 flex">
            <Box className="mr-2 bg-gray-90" />
            <Box className="mr-2 hidden md:block bg-gray-90" />
            <Box className="hidden md:block bg-gray-90" />
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex px-4 pt-4 pb-6 items-center content-center font-mono text-code rounded-b-md',
          {
            'bg-red-30/25 text-red-40': level === 'error',
            'bg-yellow-5 text-yellow-50': level === 'warning',
            'bg-gray-5 text-secondary-dark': level === 'info',
          },
        )}
      >
        {level === 'error' && <IconError className="self-start mt-1.5" />}
        {level === 'warning' && <IconWarning className="self-start mt-1" />}
        <div className="px-3">{message}</div>
      </div>
    </div>
  );
}

export default ConsoleBlock;
