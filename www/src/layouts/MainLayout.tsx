import { lightTheme, maxWidth, wwwVars } from '@www/styles/www-utils.css';
import { ReactNode } from 'react';

import { appClassName } from './_app.css';

export function MainLayout({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className || ''} ${appClassName} ${lightTheme}  bg-black `}
    >
      <div
        style={{
          maxWidth: wwwVars.maxSiteWidth,
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
