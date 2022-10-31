import { IconOpenInWindow } from '@www/components/Icon/IconOpenInWindow';
import * as React from 'react';
export interface OpenInWindowButtonProps {
  onClick?: () => void;
}

export const OpenInWindowButton: React.FC<OpenInWindowButtonProps> = (
  props,
) => {
  return (
    <button
      onClick={props.onClick}
      className="text-sm text-primary-dark inline-flex items-center hover:text-link duration-100 ease-in transition mx-1"
      title="FullScreen Sandpack"
      type="button"
    >
      <IconOpenInWindow className="inline mb-0.5 mr-1 mt-1" /> Open in New
      Window
    </button>
  );
};
