import { OnScrollFn, ScrollPosition } from '../types/ScrollPosition';

const initialScrollPosition = {
  scrollLeft: 0,
  scrollTop: 0,
};
export class ScrollListener {
  private scrollPosition: ScrollPosition = initialScrollPosition;
  private onScrollFns: OnScrollFn[] = [];

  public getScrollPosition = () => {
    return this.scrollPosition;
  };

  public onScroll = (fn: OnScrollFn) => {
    this.onScrollFns.push(fn);
    return () => {
      this.onScrollFns = this.onScrollFns.filter((f) => f !== fn);
    };
  };
  public setScrollPosition = (scrollPosition: ScrollPosition) => {
    this.scrollPosition = scrollPosition;

    this.notifyScrollChange();
  };

  private notifyScrollChange() {
    const { scrollPosition } = this;

    const fns = this.onScrollFns;
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i](scrollPosition);
    }
  }

  destroy = () => {
    this.onScrollFns = [];
  };
}
