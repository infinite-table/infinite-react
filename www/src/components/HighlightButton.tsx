import { newvars } from '@www/styles/www-utils';
import { ReactNode } from 'react';

type HighlightButtonProps = {
  children: ReactNode;
  glow?: boolean;
  className?: string;
};

export function getHighlightShadowStyle({ glow }: { glow?: boolean } = {}) {
  return {
    boxShadow: `0px 0px 10px 1px ${
      glow ? newvars.color.glow : newvars.color.highlight
    }`,
  };
}
export function HighlightButton(props: HighlightButtonProps) {
  const { children, glow, className } = props;
  return (
    <button
      className={`${className} bg-brand-dark bg-opacity-90 shadow-xl shadow-highlight-100 rounded-lg inline-block text-xl py-2 px-5 text-highlight font-bold tracking-wide`}
      style={{
        ...getHighlightShadowStyle({ glow }),
      }}
    >
      {children}
    </button>
  );
}
