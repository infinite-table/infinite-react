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
  warning: {
    container:
      'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    content: 'text-yellow-800 dark:text-yellow-200',
  },
  success: {
    container:
      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    content: 'text-green-800 dark:text-green-200',
  },
  error: {
    container:
      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    content: 'text-red-800 dark:text-red-200',
  },
};

export function Note({
  children,
  className,
  variant = 'info',
  title,
  icon = true,
}: NoteProps) {
  const styles = variantStyles[variant];

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
