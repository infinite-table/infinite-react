import { wwwVars } from '@www/styles/www-utils.css';
import { ReactNode } from 'react';

type HighlightButtonProps = {
  children: ReactNode;
  glow?: boolean;
};

export function getHighlightShadowStyle({ glow }: { glow?: boolean } = {}) {
  return {
    boxShadow: `0px 0px 10px 1px ${
      glow ? wwwVars.color.glow : wwwVars.color.highlight
    }`,
  };
}
export function HighlightButton(props: HighlightButtonProps) {
  const { children, glow } = props;
  return (
    <button
      className="bg-brand-dark bg-opacity-90 shadow-xl shadow-highlight-100 rounded-lg inline-block text-xl font-black py-2 px-5 text-highlight"
      style={{
        ...getHighlightShadowStyle({ glow }),
      }}
    >
      {children}
    </button>
  );
}
