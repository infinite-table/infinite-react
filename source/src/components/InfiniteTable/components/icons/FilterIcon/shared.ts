import { CSSProperties } from '@vanilla-extract/css';

export const defaultLineStyle: CSSProperties = {
  transition: `width 0.25s, opacity 0.25s`,
};

export type FilterIconProps<TStyle = CSSProperties> = {
  size?: number;
  lineWidth?: number;
  lineStyle?: TStyle;
  style?: TStyle;
  className?: string;
  index?: number;
};

export const filterIconPropNames = Object.keys({
  size: 1,
  lineWidth: 1,
  lineStyle: 1,
  style: 1,
  className: 1,
  index: 1,
} satisfies Record<keyof FilterIconProps, 1>) as (keyof FilterIconProps)[];
