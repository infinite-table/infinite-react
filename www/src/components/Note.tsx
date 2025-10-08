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

const variantStyles = {
  info: {
    container:
      'border-blue-200 bg-highlight-dark [--text-paragraph:var(--text-lg)]',
    icon: '',
    title: '',
    content: '',
  },
};

export function Note({ children, className, title, icon = true }: NoteProps) {
  const styles = variantStyles.info;

  return (
    <div
      className={cn(
        'my-6 rounded-lg p-4 shadow-sm',
        styles.container,
        className,
      )}
    >
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0', !title && 'mt-4.5')}>
          {icon && <IconInfo size={20} className={cn('mt-0.5', styles.icon)} />}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn(' font-semibold mb-2', styles.title)}>{title}</h4>
          )}
          <div className={cn('leading-relaxed', styles.content)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
