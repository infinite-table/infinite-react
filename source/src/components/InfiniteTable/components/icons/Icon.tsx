import * as React from 'react';
export type TableIconProps = {
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  viewBox?: string;
};

export const Icon = (props: TableIconProps) => {
  const size = props.size ?? `var(--infinite-icon-size)`;
  const style = {
    flex: 'none',
    width: size,
    height: size,
    fill: 'currentColor',
    ...props.style,
  };
  return (
    //@ts-ignore
    <svg viewBox="0 0 24 24" {...props} style={style}>
      {props.children}
    </svg>
  );
};
