import { cn } from '@www/lib/utils';

export const GradientText = ({
  children,
  bold = true,
  className,
  style,
}: {
  children?: React.ReactNode;
  bold?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <span
    className={cn(
      'bg-gradient-to-r from-datagrid-blue to-datagrid-purple bg-clip-text text-transparent',
      bold ? 'font-bold' : '',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);
