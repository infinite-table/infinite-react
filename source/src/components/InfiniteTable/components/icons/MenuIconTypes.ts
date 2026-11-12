import type {
  CSSProperties,
  HTMLAttributes,
  Renderable,
} from '../../../types/FrameworkTypes';

export type MenuIconProps = {
  lineWidth?: number;
  lineStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
  domProps?: HTMLAttributes<HTMLDivElement>;
  reserveSpaceWhenHidden?: boolean;
  menuVisible?: boolean;
  children?: Renderable;
};
