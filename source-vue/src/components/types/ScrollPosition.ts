export interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}

export type OnScrollFn = (scrollPosition: ScrollPosition) => void;
export type SetScrollPosition = OnScrollFn;
