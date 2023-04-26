import cn from 'classnames';
import * as React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  as?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  active?: boolean;
  className?: string;
  style?: Record<string, string>;
}

export function Button({
  children,
  onClick,
  active = false,
  className,
  style = {},
  as,
}: ButtonProps) {
  const Cmp = as || 'button';
  return (
    //@ts-ignore
    <Cmp
      style={style}
      onMouseDown={(evt: any) => {
        evt.preventDefault();
        evt.stopPropagation();
      }}
      onClick={onClick}
      className={cn(
        className,
        'text-base leading-tight font-bold text-content-color border border-dark-custom rounded-lg py-2 px-4 focus:ring-1 focus:ring-offset-2 focus:ring-link   active:ring-0 active:ring-offset-0 outline-none inline-flex items-center my-1',
        {
          'bg-brand-dark   hover:bg-opacity-80 focus:bg-secondary active:bg-opacity-100':
            active,
          'bg-transparent bg-secondary-button-dark hover:bg-opacity-80 border-transparent':
            !active,
        },
      )}
    >
      {children}
    </Cmp>
  );
}

export default Button;
