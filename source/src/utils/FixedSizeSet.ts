export class FixedSizeSet<T> {
  private currentSet: Set<T>;
  private maxSize: number;
  private orderRefs: T[] = [];

  static DEFAULT_SIZE: number = 10;

  constructor(clone?: readonly T[] | null | number, size?: number) {
    if (typeof clone === 'number') {
      this.maxSize = clone;
      this.currentSet = new Set();
    } else {
      this.maxSize = size ?? FixedSizeSet.DEFAULT_SIZE;
      if (clone) {
        const arr = Array.from(clone);

        // only take the last maxSize elements
        if (this.maxSize < arr.length) {
          arr.slice(arr.length - this.maxSize);
        }

        this.currentSet = new Set();
        arr.forEach((el) => {
          this.add(el);
        });
      } else {
        this.currentSet = new Set();
      }
    }
  }

  values() {
    return this.currentSet.values();
  }

  get size() {
    return this.currentSet.size;
  }

  delete(el: T) {
    if (this.currentSet.has(el)) {
      this.currentSet.delete(el);
      this.orderRefs = this.orderRefs.filter((ref) => ref !== el);

      return true;
    }
    return false;
  }

  has(el: T) {
    return this.currentSet.has(el);
  }

  add(el: T) {
    if (this.currentSet.has(el)) {
      return this;
    }

    const canAddCount = this.maxSize - this.currentSet.size;

    if (canAddCount <= 0) {
      // delete the oldest
      const [removedRef] = this.orderRefs.splice(0, 1);

      if (removedRef) {
        this.currentSet.delete(removedRef);
      }
    }

    this.orderRefs.push(el);
    this.currentSet.add(el);
    return this;
  }
}
