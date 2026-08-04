import { CSSProperties } from '@vanilla-extract/css';

export const expandCollapseIconPath =
  'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z';

export type ExpandCollapseIconProps<TStyle = CSSProperties> = {
  size?: number;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onChange?: (expanded: boolean) => void;
  style?: TStyle;
  disabled?: boolean;
  className?: string;
  direction?: 'end' | 'start';
};

export const expandCollapseIconPropNames = Object.keys({
  size: 1,
  expanded: 1,
  defaultExpanded: 1,
  onChange: 1,
  style: 1,
  disabled: 1,
  className: 1,
  direction: 1,
} satisfies Record<keyof ExpandCollapseIconProps, 1>) as (keyof ExpandCollapseIconProps)[];
