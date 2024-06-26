import { IconNavArrow } from '@www/components/Icon/IconNavArrow';
import cn from 'classnames';
import * as React from 'react';

interface SidebarButtonProps {
  title: string;
  heading: boolean;
  level: number;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isExpanded?: boolean;
  isBreadcrumb?: boolean;
}

export function SidebarButton({
  title,
  heading,
  level,
  onClick,
  isExpanded,
  isBreadcrumb,
}: SidebarButtonProps) {
  return (
    <div
      className={cn({
        'my-1': heading || level === 1,
        'my-3': level > 1,
      })}
    >
      <button
        className={cn(
          'p-2 pr-2 pl-5 w-full rounded-r-lg text-left hover:bg-gray-80 relative flex items-center justify-between',
          {
            'p-2 text-base': level > 1,
            'text-link bg-highlight-dark text-base font-bold hover:bg-highlight hover:bg-highlight-dark hover:text-link':
              !heading && isBreadcrumb && !isExpanded,
            'p-4 my-6 text-2xl lg:my-auto lg:text-sm font-bold': heading,
            'p-2 hover:text-gray-70 text-base font-bold text-primary-dark':
              !heading && !isBreadcrumb,
            'text-primary-dark': heading && !isBreadcrumb,
            'text-primary-dark text-base font-bold bg-card-dark':
              !heading && isExpanded,
          },
        )}
        onClick={onClick}
      >
        {title}
        {typeof isExpanded && !heading && (
          <span className="pr-2 text-gray-30">
            <IconNavArrow displayDirection={isExpanded ? 'down' : 'right'} />
          </span>
        )}
      </button>
    </div>
  );
}
