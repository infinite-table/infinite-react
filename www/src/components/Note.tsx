import * as React from 'react';
import { cn } from '../lib/utils';
import { IconInfo } from './icons/IconInfo';

interface NoteProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  icon?: React.ReactNode | false;
}

export function Note({ children, className, title, icon = true }: NoteProps) {
  return (
    <div className={cn('docs-note', className)}>
      {icon && <IconInfo size={16} className="docs-note__icon" />}
      <div className="docs-note__body">
        {title && <h4 className="docs-note__title">{title}</h4>}
        {children}
      </div>
    </div>
  );
}
