export class Indexer<PrimaryKeyType = string> {
  indexToPrimaryKey: Map<number, PrimaryKeyType> = new Map();
  primaryKeyToIndex: Map<string, number> = new Map();

  add(index: number, primaryKey: PrimaryKeyType) {
    this.indexToPrimaryKey.set(index, primaryKey);
    this.primaryKeyToIndex.set(`${primaryKey}`, index);
  }

  clear() {
    this.indexToPrimaryKey.clear();
    this.primaryKeyToIndex.clear();
  }

  getIndexOf(primaryKey: PrimaryKeyType) {
    return this.primaryKeyToIndex.get(`${primaryKey}`);
  }

  getPrimaryKeyFor(index: number) {
    return this.indexToPrimaryKey.get(index);
  }
}
