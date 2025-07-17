export class FixedSizeMap<K, T> {
  private currentMap: Map<K, T>;
  private maxSize: number;
  private keysInOrder: K[] = [];

  static DEFAULT_SIZE: number = 10;

  constructor(
    clone?: readonly (readonly [K, T])[] | null | number,
    size?: number,
  ) {
    if (typeof clone === 'number') {
      this.maxSize = clone;
      this.currentMap = new Map();
    } else {
      this.maxSize = size ?? FixedSizeMap.DEFAULT_SIZE;
      if (clone) {
        const arr = Array.from(clone);

        // only take the last maxSize elements
        if (this.maxSize < arr.length) {
          arr.slice(arr.length - this.maxSize);
        }

        this.currentMap = new Map();
        arr.forEach(([k, v]) => {
          this.set(k, v);
        });
      } else {
        this.currentMap = new Map();
      }
    }
  }

  values() {
    return this.currentMap.values();
  }

  get size() {
    return this.currentMap.size;
  }

  delete(key: K) {
    if (this.currentMap.has(key)) {
      this.currentMap.delete(key);
      this.keysInOrder = this.keysInOrder.filter((k) => k !== key);

      return true;
    }
    return false;
  }

  has(key: K) {
    return this.currentMap.has(key);
  }

  get(key: K) {
    return this.currentMap.get(key);
  }

  set(key: K, el: T) {
    if (this.has(key)) {
      this.delete(key);
    }

    const canAddCount = this.maxSize - this.currentMap.size;

    if (canAddCount <= 0) {
      // delete the oldest
      const [removedKey] = this.keysInOrder.splice(0, 1);

      if (removedKey != undefined) {
        this.currentMap.delete(removedKey);
      }
    }

    this.keysInOrder.push(key);
    this.currentMap.set(key, el);
    return this;
  }
}
