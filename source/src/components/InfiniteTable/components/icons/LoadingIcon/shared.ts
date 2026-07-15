import { CSSProperties } from '@vanilla-extract/css';

export const loadingIconStrokeDasharray =
  '164.93361431346415 56.97787143782138';

export const loadingIconSvgStyle = {
  margin: 'auto',
  display: 'block',
  shapeRendering: 'auto',
} as const;

export type LoadingIconProps<TStyle = CSSProperties> = {
  size?: number;
  style?: TStyle;
  className?: string;
  viewBox?: string;
};

export const loadingIconPropNames = Object.keys({
  size: 1,
  style: 1,
  className: 1,
  viewBox: 1,
} satisfies Record<keyof LoadingIconProps, 1>) as (keyof LoadingIconProps)[];
