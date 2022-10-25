import { wwwVars } from '@www/styles/www-utils.css';
import { ReactNode } from 'react';

type HighlightButtonProps = {
  children: ReactNode;
};
export function HighlightButton(props: HighlightButtonProps) {
  const { children } = props;
  return (
    <button
      className="bg-brand-dark bg-opacity-90 shadow-xl shadow-highlight-100 rounded-lg inline-block text-xl font-black py-2 px-5 text-highlight"
      style={{
        boxShadow: `0px 0px 10px 1px ${wwwVars.color.highlight}`,
      }}
    >
      {children}
    </button>
  );
}
