import { UnstyledOpenInCodeSandboxButton } from '@codesandbox/sandpack-react';
import cn from 'classnames';
import * as React from 'react';

import { IconNewPage } from '../../Icon/IconNewPage';

export const OpenInCodeSandboxButton = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <UnstyledOpenInCodeSandboxButton
      title="Open in CodeSandbox"
      className={cn(
        'text-sm text-content-color inline-flex items-center hover:text-link duration-100 ease-in transition mx-1',
        className,
      )}
    >
      <span className="hidden md:inline">
        <IconNewPage className="inline mb-0.5 text-base" /> Fork
      </span>
      <span className="inline md:hidden">
        <IconNewPage className="inline mb-0.5 text-base" /> Fork
      </span>
    </UnstyledOpenInCodeSandboxButton>
  );
};
