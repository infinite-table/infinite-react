import { light } from '@www/styles/utils.css';
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
      className={`${
        className || ''
      } ${appClassName} ${light} bg-wash dark:bg-wash-dark`}
    >
      {children}
    </div>
  );
}
