import { CSSProperties } from '@vanilla-extract/css';

export const defaultLineStyle: CSSProperties = {
  transition: `width 0.25s, opacity 0.25s`,
};

// TStyle: React.CSSProperties in the React sibling, Vue's CSSProperties in
// the Vue one - the two types are not assignable to each other
export type SortIconProps<TStyle = CSSProperties> = {
  direction: 1 | -1 | 0;
  size?: number;
  lineWidth?: number;
  lineStyle?: TStyle;
  style?: TStyle;
  className?: string;
  index?: number;
  forceSize?: boolean;
};

// runtime prop names for the Vue sibling. TS types are erased at runtime,
// so the names have to be written out once - but the `satisfies Record<...>`
// makes the list exhaustive in both directions: a prop missing from this
// object OR an extra/misspelled one is a compile error.
export const sortIconPropNames = Object.keys({
  direction: 1,
  size: 1,
  lineWidth: 1,
  lineStyle: 1,
  style: 1,
  className: 1,
  index: 1,
  forceSize: 1,
} satisfies Record<keyof SortIconProps, 1>) as (keyof SortIconProps)[];
