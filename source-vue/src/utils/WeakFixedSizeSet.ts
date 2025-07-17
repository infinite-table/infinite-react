export class WeakFixedSizeSet<T extends object> {
  private currentSet: Set<T>;
  private maxSize: number;
  private orderRefs: WeakRef<T>[] = [];

  static DEFAULT_SIZE: number = 10;

  constructor(clone?: readonly T[] | null | number, size?: number) {
    if (typeof clone === 'number') {
      this.maxSize = clone;
      this.currentSet = new Set();
    } else {
      this.maxSize = size ?? WeakFixedSizeSet.DEFAULT_SIZE;
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
      this.orderRefs = this.orderRefs.filter((ref) => ref.deref() !== el);

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
      const removed = removedRef.deref();
      if (removed) {
        this.currentSet.delete(removed);
      }
    }

    this.orderRefs.push(new WeakRef(el));
    this.currentSet.add(el);
    return this;
  }
}
