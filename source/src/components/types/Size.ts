export interface Size {
  width: number;
  height: number;
}

export type OnResizeFn = (size: { width: number; height: number }) => void;
