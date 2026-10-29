import { DataSourcePropMultiRowSelectionTarget, DataSourceState } from '.';
import { DeepMap } from '../../utils/DeepMap';
import { getGroupKeysForDataItem } from '../../utils/groupAndPivot/getGroupKeysForDataItem';
import { isNotLoadedYetKey } from '../../utils/groupAndPivot/notLoadedYet';

type RowSelectionStateItem = (any | any[])[];

export type RowSelectionStateObject =
  | {
      selectedRows: RowSelectionStateItem;
      deselectedRows: RowSelectionStateItem;
      defaultSelection: boolean;
    }
  | {
      defaultSelection: true;
      deselectedRows: RowSelectionStateItem;
      selectedRows?: RowSelectionStateItem;
    }
  | {
      defaultSelection: false;
      selectedRows: RowSelectionStateItem;
      deselectedRows?: RowSelectionStateItem;
    };

export type RowSelectionStateConfig<T> = {
  groupBy: DataSourceState<T>['groupBy'];
  groupDeepMap: DataSourceState<T>['groupDeepMap'];
  toPrimaryKey: DataSourceState<T>['toPrimaryKey'];
  /**
   * The count of all the rows - for lazy load, after the (remote) filter
   */
  totalCount: number;
  /**
   * Lazy load with grouping: the count of all the (leaf) rows, after the filter, when the server sends it
   */
  lazyGroupedRowCount?: number;
  /**
   * Lazy load: the count of all the rows without the filter, when the server sends it
   */
  lazyUnfilteredCount?: number;
  indexer: DataSourceState<T>['indexer'];
  lazyLoad: boolean;
  onlyUsePrimaryKeys: boolean;
  multiRowSelectionTarget?: DataSourcePropMultiRowSelectionTarget;
  /**
   * Whether the client-side filter hides some of the rows
   */
  someRowsFilteredOut?: boolean;
  originalDataArray?: T[];
  postFilterDataArray?: T[];
};

export type GetRowSelectionStateConfig<T> = () => RowSelectionStateConfig<T>;

type UnfilteredGroup = {
  /**
   * The count of all the rows inside the group, at any depth
   */
  count: number;
  /**
   * Only set for the groups at the last level, to keep the memory linear in the row count
   */
  primaryKeys?: any[];
};

type UnfilteredGroups = {
  groupBy: unknown;
  groups: DeepMap<any, UnfilteredGroup>;
};

const EMPTY_UNFILTERED_GROUPS = new DeepMap<any, UnfilteredGroup>();

const unfilteredGroupsCache = new WeakMap<any[], UnfilteredGroups>();

/**
 * The groups (at any level) of the data as it is before filtering,
 * so the rows that are filtered out are counted as well
 */
function getUnfilteredGroups<T>(
  config: RowSelectionStateConfig<T>,
): DeepMap<any, UnfilteredGroup> {
  const { originalDataArray, groupBy, toPrimaryKey } = config;

  if (!originalDataArray || !groupBy.length) {
    return EMPTY_UNFILTERED_GROUPS;
  }

  const cached = unfilteredGroupsCache.get(originalDataArray);
  if (cached && cached.groupBy === groupBy) {
    return cached.groups;
  }

  const groups = new DeepMap<any, UnfilteredGroup>();
  const lastLevel = groupBy.length;

  // DeepMap does not keep the keys array, so one array is reused for all the levels
  const keys: any[] = [];

  originalDataArray.forEach((data) => {
    const groupKeys = getGroupKeysForDataItem(data, groupBy);

    keys.length = 0;
    for (let i = 0; i < groupKeys.length; i++) {
      keys.push(groupKeys[i]);

      let group = groups.get(keys);
      if (!group) {
        group = { count: 0 };
        if (keys.length === lastLevel) {
          group.primaryKeys = [];
        }
        groups.set(keys, group);
      }
      group.count++;
      group.primaryKeys?.push(toPrimaryKey(data));
    }
  });

  unfilteredGroupsCache.set(originalDataArray, { groupBy, groups });

  return groups;
}

function getUnfilteredPrimaryKeysInsideGroup(
  groups: DeepMap<any, UnfilteredGroup>,
  groupKeys: any[],
) {
  const result: any[] = [];

  groups.getLeafNodesStartingWith(groupKeys, (pair) => {
    const primaryKeys = pair.value?.primaryKeys;
    if (primaryKeys) {
      for (let i = 0; i < primaryKeys.length; i++) {
        result.push(primaryKeys[i]);
      }
    }
  });

  return result;
}

type RowSelectionStateOverride = {
  getGroupKeysForPrimaryKey: RowSelectionState<any>['getGroupKeysForPrimaryKey'];
  getGroupByLength: RowSelectionState<any>['getGroupByLength'];
  getGroupCount: RowSelectionState<any>['getGroupCount'];
  getGroupKeysDirectlyInsideGroup: RowSelectionState<any>['getGroupKeysDirectlyInsideGroup'];
  getAllPrimaryKeysInsideGroup: RowSelectionState<any>['getAllPrimaryKeysInsideGroup'];
};

export class RowSelectionState<T = any> {
  selectedRows: RowSelectionStateItem | null = null;
  deselectedRows: RowSelectionStateItem | null = null;

  defaultSelection: boolean = false;

  selectedMap: DeepMap<any, true> = new DeepMap();
  deselectedMap: DeepMap<any, true> = new DeepMap();

  onlyUsePrimaryKeys: boolean = false;

  // TODO make it easy to share the cache with another instance
  selectionCache: DeepMap<any, boolean | null> = new DeepMap();
  selectionCountCache: DeepMap<
    any,
    { selectedCount: number; deselectedCount: number }
  > = new DeepMap();

  /**
   * Lazy load: the selected (true) and deselected (false) entries, in one map,
   * for the given versions of the selection maps
   */
  private lazyEntries: {
    version: string;
    entries: DeepMap<any, boolean>;
  } | null = null;
  // the caches below depend on the config, so they only live until the next xcache()
  private lazyLoadedRows: DeepMap<
    any,
    { primaryKeys: Set<any>; complete: boolean }
  > | null = null;
  private lazyChildrenLoaded: DeepMap<any, boolean> | null = null;
  private lazyRowCounts: DeepMap<any, number | null> | null = null;

  getConfig: GetRowSelectionStateConfig<T>;

  getGroupKeysForPrimaryKey(pk: any) {
    const { indexer, groupBy } = this.getConfig();

    const data = indexer.getDataForPrimaryKey(pk);

    // if (!data) {
    //   console.error('Cannot find data object for primary key', pk);
    // }

    return data ? getGroupKeysForDataItem(data, groupBy) : [];
  }

  getGroupDeepMap() {
    return this.getConfig().groupDeepMap;
  }

  /**
   * The selection acts only on the rows that pass the filter, and some rows are filtered out
   */
  private targetsVisibleRowsOnly() {
    const { multiRowSelectionTarget, someRowsFilteredOut } = this.getConfig();
    return multiRowSelectionTarget === 'visible' && !!someRowsFilteredOut;
  }

  /**
   * The selection also acts on rows that are filtered out, and some rows are filtered out
   */
  private targetsFilteredOutRows() {
    const { multiRowSelectionTarget, someRowsFilteredOut } = this.getConfig();
    return multiRowSelectionTarget !== 'visible' && !!someRowsFilteredOut;
  }

  private getVisibleDataInsideGroup(groupKeys: any[]): T[] {
    const { postFilterDataArray, groupDeepMap } = this.getConfig();
    if (!groupKeys.length) {
      return postFilterDataArray ?? [];
    }
    return groupDeepMap?.get(groupKeys)?.items ?? [];
  }

  private hasFilteredOutRowsInsideGroup(groupKeys: any[]) {
    const config = this.getConfig();
    if (!config.someRowsFilteredOut) {
      return false;
    }
    const allCount = groupKeys.length
      ? getUnfilteredGroups(config).get(groupKeys)?.count ?? 0
      : config.originalDataArray?.length ?? 0;

    return allCount > this.getVisibleDataInsideGroup(groupKeys).length;
  }

  /**
   * Sets the selection of each visible row inside the group, by its full path,
   * so the rows of the group that are filtered out keep their selection
   */
  private setVisibleRowsSelection(groupKeys: any[], selected: boolean) {
    const { groupBy, toPrimaryKey } = this.getConfig();
    const mapToSet = selected ? this.selectedMap : this.deselectedMap;
    const mapToClear = selected ? this.deselectedMap : this.selectedMap;

    this.xcache();
    this.getVisibleDataInsideGroup(groupKeys).forEach((data) => {
      const rowGroupKeys = getGroupKeysForDataItem(data, groupBy);
      const pk = toPrimaryKey(data);
      const finalKey = [...rowGroupKeys, pk];

      mapToClear.delete(finalKey);
      if (this.isRowSelected(pk, rowGroupKeys) !== selected) {
        mapToSet.set(finalKey, true);
      }
    });
    this.xcache();
  }

  /**
   * Lazy load, when the selection also acts on rows that are filtered out:
   * the count of all the rows inside the group without the filter, if the server sent it
   */
  private getLazyUnfilteredCount(groupKeys: any[]): number | undefined {
    const config = this.getConfig();
    if (!config.lazyLoad || config.multiRowSelectionTarget === 'visible') {
      return undefined;
    }
    if (!groupKeys.length) {
      return config.lazyUnfilteredCount;
    }
    return config.groupDeepMap?.get(groupKeys)?.totalChildrenCountUnfiltered;
  }

  /**
   * Lazy load, when the selection also acts on rows that are filtered out:
   * the count of the rows inside the group (not at the last level) that are not inside
   * its loaded groups - so the rows of the groups hidden by the filter or not loaded yet
   */
  public getLazyHiddenRowsCount(groupKeys: any[]): number {
    const unfilteredCount =
      groupKeys.length < this.getGroupByLength()
        ? this.getLazyUnfilteredCount(groupKeys)
        : undefined;
    if (unfilteredCount === undefined) {
      return 0;
    }
    const { groupDeepMap } = this.getConfig();
    let childrenCount = 0;
    this.getGroupKeysDirectlyInsideGroup(groupKeys).forEach((keys) => {
      childrenCount +=
        this.getLazyUnfilteredCount(keys) ??
        (groupDeepMap?.get(keys)?.totalChildrenCount || 0);
    });
    return Math.max(unfilteredCount - childrenCount, 0);
  }

  private getLazyEntries() {
    const version = `${this.selectedMap.version}:${this.deselectedMap.version}`;
    if (this.lazyEntries?.version !== version) {
      const entries = new DeepMap<any, boolean>();
      this.selectedMap
        .getKeysStartingWith([])
        .forEach((keys) => entries.set(keys, true));
      this.deselectedMap
        .getKeysStartingWith([])
        .forEach((keys) => entries.set(keys, false));
      this.lazyEntries = { version, entries };
    }
    return this.lazyEntries.entries;
  }

  /**
   * Lazy load: the count of the rows inside the group, as the server sent it
   */
  private getLazyRowCount(groupKeys: any[]): number | undefined {
    this.lazyRowCounts = this.lazyRowCounts ?? new DeepMap();
    const cached = this.lazyRowCounts.get(groupKeys);
    if (cached !== undefined) {
      return cached ?? undefined;
    }
    const result = this.computeLazyRowCount(groupKeys);
    this.lazyRowCounts.set(groupKeys, result ?? null);
    return result;
  }

  private computeLazyRowCount(groupKeys: any[]): number | undefined {
    const config = this.getConfig();
    const groupByLength = this.getGroupByLength();

    const unfilteredCount = this.getLazyUnfilteredCount(groupKeys);
    if (unfilteredCount !== undefined) {
      return unfilteredCount;
    }
    if (!groupKeys.length && !groupByLength) {
      return config.totalCount;
    }

    const group = groupKeys.length
      ? config.groupDeepMap?.get(groupKeys)
      : undefined;
    const count = groupKeys.length
      ? group?.totalChildrenCount
      : config.lazyGroupedRowCount;
    if (count != null) {
      return count;
    }
    if (groupKeys.length === groupByLength) {
      return group?.childrenAvailable ? group.items.length : undefined;
    }

    // no count from the server: add up the groups inside it
    const childKeys =
      config.groupDeepMap?.getKeysStartingWith(groupKeys, {
        excludeSelf: true,
        depthLimit: 1,
      }) ?? [];
    if (!childKeys.length) {
      return undefined;
    }
    return childKeys.reduce(
      (sum, keys) =>
        sum +
        (isNotLoadedYetKey(keys[keys.length - 1])
          ? 1
          : this.getLazyRowCount(keys) ?? 1),
      0,
    );
  }

  /**
   * Lazy load: whether the server sent all the direct children of the group
   */
  private areLazyChildrenLoaded(groupKeys: any[]): boolean {
    this.lazyChildrenLoaded = this.lazyChildrenLoaded ?? new DeepMap();
    const cached = this.lazyChildrenLoaded.get(groupKeys);
    if (cached !== undefined) {
      return cached;
    }
    const result = this.computeLazyChildrenLoaded(groupKeys);
    this.lazyChildrenLoaded.set(groupKeys, result);
    return result;
  }

  private computeLazyChildrenLoaded(groupKeys: any[]): boolean {
    const { groupDeepMap } = this.getConfig();
    const group = groupKeys.length ? groupDeepMap?.get(groupKeys) : undefined;
    if (groupKeys.length && !group?.childrenAvailable) {
      return false;
    }

    if (groupKeys.length === this.getGroupByLength()) {
      return this.getLazyLoadedRows(groupKeys).complete;
    }

    return (
      groupDeepMap?.getKeysStartingWith(groupKeys, {
        excludeSelf: true,
        depthLimit: 1,
      }) ?? []
    ).every((keys) => !isNotLoadedYetKey(keys[keys.length - 1]));
  }

  /**
   * Lazy load, at the last group level (or the root, without grouping): the primary keys
   * of the loaded rows, and whether they are all the rows of the group
   */
  private getLazyLoadedRows(groupKeys: any[]) {
    this.lazyLoadedRows = this.lazyLoadedRows ?? new DeepMap();

    let loadedRows = this.lazyLoadedRows.get(groupKeys);
    if (!loadedRows) {
      const { groupDeepMap, originalDataArray, toPrimaryKey, totalCount } =
        this.getConfig();
      const group = groupKeys.length ? groupDeepMap?.get(groupKeys) : undefined;
      const items = group ? group.items : originalDataArray ?? [];
      const rowCount = group ? group.totalChildrenCount : totalCount;

      const primaryKeys = new Set();
      let complete = rowCount == null || items.length >= rowCount;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item == null) {
          complete = false;
        } else {
          primaryKeys.add(toPrimaryKey(item));
        }
      }
      loadedRows = { primaryKeys, complete };
      this.lazyLoadedRows.set(groupKeys, loadedRows);
    }
    return loadedRows;
  }

  /**
   * Lazy load, with the counts after the filter: whether the row or group of a selection entry
   * is known to be filtered out - its parent has all the children loaded, and it's not among them
   */
  private isLazyEntryFilteredOut(keys: any[]) {
    const { groupDeepMap } = this.getConfig();
    const groupByLength = this.getGroupByLength();

    for (let length = 1; length <= keys.length; length++) {
      const parentKeys = keys.slice(0, length - 1);
      const loaded =
        length > groupByLength
          ? this.getLazyLoadedRows(parentKeys).primaryKeys.has(keys[length - 1])
          : !!groupDeepMap?.get(keys.slice(0, length));

      if (!loaded) {
        return this.areLazyChildrenLoaded(parentKeys);
      }
    }
    return false;
  }

  /**
   * Lazy load: counts the explicit selection entries inside the group, at any depth, by their own selection,
   * whether their rows are loaded or not. The other rows of the group take its selection.
   */
  private getLazySelectionCountFor(
    groupKeys: any[],
    selected: boolean,
  ): { selectedCount: number; deselectedCount: number } {
    const cachedResult = this.selectionCountCache.get(groupKeys);
    if (cachedResult != null) {
      return cachedResult;
    }

    const entries = this.getLazyEntries();
    const leafLength = this.getGroupByLength() + 1;
    // the counts without the filter include the rows that are filtered out
    const countsIncludeFilteredOutRows =
      this.getLazyUnfilteredCount([]) !== undefined;

    let selectedCount = 0;
    let deselectedCount = 0;

    entries
      .getKeysOfFirstChildOnEachBranchStartingWith(groupKeys, {
        excludeSelf: true,
        respectOrder: false,
      })
      .forEach((keys) => {
        if (
          !countsIncludeFilteredOutRows &&
          this.isLazyEntryFilteredOut(keys)
        ) {
          return;
        }
        const entrySelected = entries.get(keys)!;

        if (keys.length >= leafLength) {
          if (entrySelected) {
            selectedCount++;
          } else {
            deselectedCount++;
          }
          return;
        }

        const count = this.getLazySelectionCountFor(keys, entrySelected);
        selectedCount += count.selectedCount;
        deselectedCount += count.deselectedCount;
      });

    const rowCount = this.getLazyRowCount(groupKeys);
    // without a count from the server, the group has at least one row besides its entries
    const otherRowsCount =
      rowCount === undefined
        ? 1
        : Math.max(rowCount - selectedCount - deselectedCount, 0);

    if (selected) {
      selectedCount += otherRowsCount;
    } else {
      deselectedCount += otherRowsCount;
    }

    const result = { selectedCount, deselectedCount };
    this.selectionCountCache.set(groupKeys, result);

    return result;
  }

  getGroupCount(groupKeys: any[]) {
    if (groupKeys.length == 0) {
      return this.getLazyUnfilteredCount([]) ?? this.getConfig().totalCount;
    }
    if (this.targetsFilteredOutRows()) {
      return getUnfilteredGroups(this.getConfig()).get(groupKeys)?.count ?? 0;
    }
    const groupDeepMap = this.getGroupDeepMap();
    const deepMapValue = groupDeepMap?.get(groupKeys);
    if (!deepMapValue) {
      return 0;
    }

    return (
      this.getLazyUnfilteredCount(groupKeys) ??
      deepMapValue.totalChildrenCount ??
      (deepMapValue.items.length || 0)
    );
  }

  getGroupKeysDirectlyInsideGroup(groupKeys: any[]) {
    const config = this.getConfig();
    const options = { excludeSelf: true, depthLimit: 1 };

    if (this.targetsFilteredOutRows()) {
      return getUnfilteredGroups(config).getKeysStartingWith(
        groupKeys,
        options,
      );
    }
    return config.groupDeepMap?.getKeysStartingWith(groupKeys, options) || [];
  }

  getAllPrimaryKeysInsideGroup(groupKeys: any[]): any[] {
    const config = this.getConfig();
    const { groupDeepMap, toPrimaryKey } = config;

    if (this.targetsFilteredOutRows()) {
      return groupKeys.length
        ? getUnfilteredPrimaryKeysInsideGroup(
            getUnfilteredGroups(config),
            groupKeys,
          )
        : (config.originalDataArray ?? []).map(toPrimaryKey);
    }

    if (!config.groupBy.length) {
      return this.getVisibleDataInsideGroup([]).map(toPrimaryKey);
    }

    if (!groupKeys.length) {
      const topLevelKeys =
        groupDeepMap?.getKeysStartingWith([], {
          excludeSelf: true,
          depthLimit: 1,
        }) || [];

      return topLevelKeys
        .map((groupKeys) => this.getAllPrimaryKeysInsideGroup(groupKeys))
        .flat();
    }

    const group = groupDeepMap?.get(groupKeys);
    return group ? group.items.map(this.getConfig().toPrimaryKey) : [];
  }

  getGroupByLength() {
    return this.getConfig().groupBy.length;
  }

  static from<T>(
    rowSeleStateObject: RowSelectionStateObject,
    getConfig: GetRowSelectionStateConfig<T>,
    overrides?: RowSelectionStateOverride,
  ) {
    return new RowSelectionState(rowSeleStateObject, getConfig, overrides);
  }

  constructor(
    state: RowSelectionStateObject | RowSelectionState,
    getConfig: GetRowSelectionStateConfig<T>,
    _forTestingOnly?: RowSelectionStateOverride,
  ) {
    const stateObject =
      state instanceof Object.getPrototypeOf(this).constructor
        ? //@ts-ignore
          state.getState()
        : state;

    this.getConfig = getConfig;

    this.onlyUsePrimaryKeys = getConfig().onlyUsePrimaryKeys;

    if (_forTestingOnly) {
      Object.assign(this, _forTestingOnly);
    }

    this.update(stateObject);
  }
  mapSet = (name: 'selected' | 'deselected', key: any | any[]) => {
    if (!Array.isArray(key)) {
      if (this.onlyUsePrimaryKeys) {
        key = [key];
      } else {
        key = [...this.getGroupKeysForPrimaryKey(key), key];
      }
    }

    this.xcache();
    if (name === 'selected') {
      this.selectedMap.set(key, true);
    } else {
      this.deselectedMap.set(key, true);
    }
  };
  _selectedMapSet = (key: any | any[]) => {
    this.mapSet('selected', key);
  };
  _deselectedMapSet = (key: any | any[]) => {
    this.mapSet('deselected', key);
  };

  update(stateObject: RowSelectionStateObject) {
    this.selectedRows = stateObject.selectedRows || null;
    this.deselectedRows = stateObject.deselectedRows || null;

    this.selectedMap.clear();
    this.deselectedMap.clear();

    this.selectedRows?.forEach(this._selectedMapSet);
    this.deselectedRows?.forEach(this._deselectedMapSet);

    this.defaultSelection = stateObject.defaultSelection;

    this.xcache();
  }

  private xcache() {
    this.selectionCache.clear();
    this.selectionCountCache.clear();
    this.lazyLoadedRows = null;
    this.lazyChildrenLoaded = null;
    this.lazyRowCounts = null;

    // //@ts-ignore
    // this.selectionCache.get = () => {};
    // //@ts-ignore
    // this.selectionCountCache.get = () => {};
  }

  public getState(): RowSelectionStateObject {
    // we have to do the normalization step
    // because when we first load the keys, all the values which are not arrays, from selectedRows or deselectedRows,
    // we transform them to arrays: eg: [ 45, ['TypeScript']] becomes [['JavaScript',45],['TypeScript']] (where the row with id 45 was in the JavaScript group)
    // we do the above in order to make it easier to work with groups and rows
    // so now we're doing the opposite transformation - but when grouping, leaf rows keep their full path,
    // as the group keys of a row that is not loaded (lazy load) cannot be looked up again
    const normalize = (allKeys: any[]) => {
      const groupByLength = this.getGroupByLength();
      return allKeys.map((keys) => {
        if (this.onlyUsePrimaryKeys) {
          return keys[0];
        }
        return groupByLength === 0 && keys.length === 1 ? keys[0] : keys;
      });
    };
    const selectedRows = normalize(this.selectedMap.topDownKeys());
    const deselectedRows = normalize(this.deselectedMap.topDownKeys());

    return {
      defaultSelection: this.defaultSelection,
      selectedRows,
      deselectedRows,
    };
  }

  public deselectAll() {
    if (this.targetsVisibleRowsOnly()) {
      if (this.onlyUsePrimaryKeys) {
        this.deselectGroupRow([]);
      } else {
        this.setVisibleRowsSelection([], false);
      }
      return;
    }
    this.update({
      defaultSelection: false,
      selectedRows: [],
      deselectedRows: [],
    });
  }

  public selectAll() {
    if (this.targetsVisibleRowsOnly()) {
      if (this.onlyUsePrimaryKeys) {
        this.selectGroupRow([]);
      } else {
        this.setVisibleRowsSelection([], true);
      }
      return;
    }
    this.update({
      defaultSelection: true,
      deselectedRows: [],
      selectedRows: [],
    });
  }

  public isRowDefaultSelected() {
    return this.defaultSelection === true;
  }

  public isRowDefaultDeselected() {
    return this.defaultSelection === false;
  }

  /**
   *
   * @param key the id of the row - if a row in a grouped datasource, this is the final row id, without the group keys
   * @param groupKeys the keys of row parents, in order
   * @returns Whether the row is selected or not.
   */
  public isRowSelected(key: any, groupKeys?: any[]) {
    // use the empty arr to avoid lots of new empty array allocations

    if (this.onlyUsePrimaryKeys) {
      return this.defaultSelection
        ? !this.deselectedMap.has([key])
        : this.selectedMap.has([key]);
    }

    groupKeys = groupKeys || this.getGroupKeysForPrimaryKey(key);
    const finalKey = [...groupKeys, key];

    const cachedResult = this.selectionCache.get(finalKey);

    if (cachedResult !== undefined) {
      return cachedResult as boolean;
    }

    const inSelected = this.selectedMap.has(finalKey);
    const inDeselected = this.deselectedMap.has(finalKey);

    if (inSelected) {
      this.selectionCache.set(finalKey, true);
      return true;
    }

    if (inDeselected) {
      this.selectionCache.set(finalKey, false);
      return false;
    }

    // exact parent groups found in selected
    if (this.selectedMap.has(groupKeys)) {
      this.selectionCache.set(finalKey, true);
      return true;
    }
    // exact parent groups found in deselected
    if (this.deselectedMap.has(groupKeys)) {
      this.selectionCache.set(finalKey, false);
      return false;
    }
    // clone the keys so we can mutate
    groupKeys = [...groupKeys];

    while (groupKeys.length) {
      groupKeys.pop();
      const inSelected = this.selectedMap.has(groupKeys);
      const inDeselected = this.deselectedMap.has(groupKeys);

      if (inSelected) {
        this.selectionCache.set(finalKey, true);
        return true;
      }
      if (inDeselected) {
        this.selectionCache.set(finalKey, false);
        return false;
      }
    }

    this.selectionCache.set(finalKey, this.defaultSelection);
    return this.defaultSelection;
  }

  public isRowDeselected(key: any, groupKeys?: any[]) {
    return !this.isRowSelected(key, groupKeys);
  }

  public setRowSelected(
    key: string | number,
    selected: boolean,
    groupKeys?: any[],
  ) {
    if (selected) {
      this.setRowAsSelected(key, groupKeys);
    } else {
      this.setRowAsDeselected(key, groupKeys);
    }
  }

  /**
   * Returns if the selection state ('full','partial','none') for the current group
   *
   * The selection state will be full (true) if either of those are true:
   *  * the group keys are specified as selected
   *  * all the children are specified as selected
   *
   * The selection state will be partial (null) if either of those are true:
   *  * the group keys are partially selected
   *  * some of the children are specified as selected
   *
   *
   * @param groupKeys the keys of the group row
   * @param children leaf children that belong to the group
   * @returns boolean
   */
  public getGroupRowSelectionState(initialGroupKeys: any[]): boolean | null {
    const cachedResult = this.selectionCache.get(initialGroupKeys);

    if (cachedResult !== undefined) {
      return cachedResult as boolean;
    }

    const { selectedCount, deselectedCount } = this.getSelectionCountFor(
      initialGroupKeys,
      this.onlyUsePrimaryKeys
        ? // there is no need for the state from the parent group
          // when we are in this case, so don't do that
          undefined
        : this.getGroupRowBooleanSelectionStateFromParent(initialGroupKeys),
    );

    const result =
      selectedCount && deselectedCount ? null : selectedCount ? true : false;

    this.selectionCache.set(initialGroupKeys, result);

    return result;
  }

  private getGroupRowBooleanSelectionStateFromParent(
    initialGroupKeys: any[],
  ): boolean {
    if (!initialGroupKeys.length) {
      return this.defaultSelection;
    }

    // clone the keys so we can mutate
    const groupKeys = [...initialGroupKeys];

    const selfDeselected = this.deselectedMap.has(groupKeys);
    const selfSelected = this.selectedMap.has(groupKeys);

    let selectionState: undefined | boolean =
      selfSelected && !selfDeselected
        ? true
        : selfDeselected && !selfSelected
        ? false
        : undefined;

    if (selectionState === undefined) {
      while (groupKeys.length) {
        groupKeys.pop();

        if (this.deselectedMap.has(groupKeys)) {
          selectionState = false;
          break;
        }

        if (this.selectedMap.has(groupKeys)) {
          selectionState = true;
          break;
        }
      }
    }
    if (selectionState === undefined) {
      selectionState = this.defaultSelection;
    }

    return selectionState;
  }

  public isGroupRowPartlySelected(groupKeys: any[]) {
    return this.getGroupRowSelectionState(groupKeys) === null;
  }

  public isGroupRowSelected(groupKeys: any[]) {
    return this.getGroupRowSelectionState(groupKeys) === true;
  }

  public isGroupRowDeselected(groupKeys: any[]) {
    return this.getGroupRowSelectionState(groupKeys) === false;
  }

  public selectGroupRow(groupKeys: any[]) {
    if (this.onlyUsePrimaryKeys) {
      const keys = this.getAllPrimaryKeysInsideGroup(groupKeys);

      keys.forEach((key) => {
        if (this.defaultSelection === true) {
          this.deselectedMap.delete([key]);
        } else {
          this._selectedMapSet(key);
        }
      });
      this.xcache();
      return;
    }
    if (
      this.targetsVisibleRowsOnly() &&
      this.hasFilteredOutRowsInsideGroup(groupKeys)
    ) {
      this.setVisibleRowsSelection(groupKeys, true);
      return;
    }
    // retrieve any selection under this group
    const selectedKeys = this.selectedMap.getKeysStartingWith(groupKeys, {
      excludeSelf: true,
    });

    // and clean it up
    selectedKeys.forEach((groupKeys) => {
      this.selectedMap.delete(groupKeys);
    });

    // finally make sure this selection is set
    // so set it explicitly in the selection map
    if (groupKeys.length === 1 && this.defaultSelection === true) {
      // this is top level, but default selection is the same
      // so we can skip putting it in the map
    } else {
      this._selectedMapSet(groupKeys);
    }

    // delete it from deselection map in case it's there
    const deselectedKeys = this.deselectedMap.getKeysStartingWith(groupKeys);

    deselectedKeys.forEach((groupKeys) => {
      this.deselectedMap.delete(groupKeys);
    });
  }

  public deselectGroupRow(groupKeys: any[]) {
    if (this.onlyUsePrimaryKeys) {
      const keys = this.getAllPrimaryKeysInsideGroup(groupKeys);

      keys.forEach((key) => {
        if (this.defaultSelection === false) {
          this.selectedMap.delete([key]);
        } else {
          this._deselectedMapSet(key);
        }
      });
      this.xcache();
      return;
    }
    if (
      this.targetsVisibleRowsOnly() &&
      this.hasFilteredOutRowsInsideGroup(groupKeys)
    ) {
      this.setVisibleRowsSelection(groupKeys, false);
      return;
    }
    // retrieve any deselection under this group
    const deselectedKeys = this.deselectedMap.getKeysStartingWith(groupKeys, {
      excludeSelf: true,
    });

    // and clean it up
    deselectedKeys.forEach((groupKeys) => {
      this.deselectedMap.delete(groupKeys);
    });

    // finally make sure this deselection is set
    // so set it explicitly in the deselection map
    if (groupKeys.length === 1 && this.defaultSelection === false) {
    } else {
      this._deselectedMapSet(groupKeys);
    }

    // delete it from selection map in case it's there
    const selectedKeys = this.selectedMap.getKeysStartingWith(groupKeys);

    selectedKeys.forEach((groupKeys) => {
      this.selectedMap.delete(groupKeys);
    });
  }

  public setRowAsSelected(key: string | number, groupKeys?: any[]) {
    if (this.onlyUsePrimaryKeys) {
      if (this.defaultSelection) {
        // all selected by default, so to make it selected
        // we need to remove it from deselected map
        this.deselectedMap.delete([key]);
      } else {
        // all deselected by default, so we have to explicitly mention it in the selection map
        this._selectedMapSet(key);
      }

      this.xcache();
      return;
    }

    groupKeys = groupKeys || this.getGroupKeysForPrimaryKey(key);

    const finalKey = [...groupKeys, key];

    // delete it from deselection map

    this.deselectedMap.delete(finalKey);
    this.xcache();

    // if the direct parent is not selected
    if (this.getGroupRowSelectionState(groupKeys) !== true) {
      // then set it in selection map
      this._selectedMapSet(finalKey);
      // otherwise was probably enough to just delete it from deselection map

      // probably all children are now selected, so worth selecting the group explicitly
      if (this.getGroupRowSelectionState(groupKeys) === true) {
        this.selectGroupRow(groupKeys);
      }
    }
  }

  public setRowAsDeselected(key: string | number, groupKeys?: any[]) {
    if (this.onlyUsePrimaryKeys) {
      if (this.defaultSelection) {
        // all selected by default,
        // so we have to explicitly mention this in the deselectedMap
        this._deselectedMapSet(key);
      } else {
        // all deselected by default
        // so remove it from selected map
        this.selectedMap.delete([key]);
      }

      this.xcache();
      return;
    }

    groupKeys = groupKeys || this.getGroupKeysForPrimaryKey(key);
    const finalKey = [...groupKeys, key];

    this.selectedMap.delete(finalKey);
    this.xcache();

    // if the group is not fully deselected, also mark this row as deselected
    if (this.getGroupRowSelectionState(groupKeys) !== false) {
      this._deselectedMapSet(finalKey);

      // probably all children are now deselected, so worth deselecting the group explicitly
      if (this.getGroupRowSelectionState(groupKeys) === false) {
        this.deselectGroupRow(groupKeys);
      }
    }
  }

  public deselectRow(key: any, groupKeys?: any[]) {
    this.setRowSelected(key, false, groupKeys);
  }

  public selectRow(key: any, groupKeys?: any[]) {
    this.setRowSelected(key, true, groupKeys);
  }

  public toggleGroupRowSelection(groupKeys: any[]) {
    const groupRowSelectionState = this.getGroupRowSelectionState(groupKeys);

    if (groupRowSelectionState === true) {
      this.deselectGroupRow(groupKeys);
    } else {
      this.selectGroupRow(groupKeys);
    }
  }

  public toggleRowSelection(
    key: string | number,
    groupKeys?: any[] | undefined,
  ) {
    if (this.isRowSelected(key, groupKeys)) {
      this.deselectRow(key, groupKeys);
    } else {
      this.selectRow(key, groupKeys);
    }
  }

  public getSelectedCount() {
    return this.getSelectionCountFor([]).selectedCount;
  }

  public getDeselectedCount() {
    return this.getSelectionCountFor([]).deselectedCount;
  }

  public getSelectionCountFor(groupKeys: any[] = [], parentSelected?: boolean) {
    const cachedResult = this.selectionCountCache.get(groupKeys);

    if (cachedResult != null) {
      return cachedResult;
    }

    const groupByLength = this.getGroupByLength();
    if (groupKeys.length > groupByLength) {
      const result = this.isRowSelected(groupKeys)
        ? { selectedCount: 1, deselectedCount: 0 }
        : {
            selectedCount: 0,
            deselectedCount: 1,
          };

      this.selectionCountCache.set(groupKeys, result);
      return result;
    }

    if (
      this.getConfig().lazyLoad &&
      (!this.onlyUsePrimaryKeys || !groupByLength)
    ) {
      return this.getLazySelectionCountFor(
        groupKeys,
        parentSelected ??
          this.getGroupRowBooleanSelectionStateFromParent(groupKeys),
      );
    }

    if (
      this.onlyUsePrimaryKeys &&
      (groupByLength || this.targetsVisibleRowsOnly())
    ) {
      const allKeys = this.getAllPrimaryKeysInsideGroup(groupKeys);

      let selectedCount = 0;
      let deselectedCount = 0;

      allKeys.forEach((key) => {
        if (this.defaultSelection) {
          // by default all are selected

          if (this.deselectedMap.has([key])) {
            // so count it as deselected if it's in the deselection map
            deselectedCount++;
            return;
          }
          selectedCount++;
        } else {
          // by default all are deselected
          if (this.selectedMap.has([key])) {
            selectedCount++;
            return;
          }
          deselectedCount++;
        }
      });

      const result = {
        selectedCount,
        deselectedCount,
      };

      this.selectionCountCache.set(groupKeys, result);

      return result;
    }

    if (groupKeys.length === groupByLength && this.targetsVisibleRowsOnly()) {
      const { toPrimaryKey } = this.getConfig();
      let selectedCount = 0;
      let deselectedCount = 0;

      this.getVisibleDataInsideGroup(groupKeys).forEach((data) => {
        if (this.isRowSelected(toPrimaryKey(data), groupKeys)) {
          selectedCount++;
        } else {
          deselectedCount++;
        }
      });

      const result = { selectedCount, deselectedCount };
      this.selectionCountCache.set(groupKeys, result);

      return result;
    }

    parentSelected =
      parentSelected ??
      this.getGroupRowBooleanSelectionStateFromParent(groupKeys);

    let allKeys = this.getGroupKeysDirectlyInsideGroup(groupKeys);

    // if (!allKeys.length) {
    if (groupKeys.length === this.getGroupByLength()) {
      // this is the last level of grouping, with no other group keys (in the groupDeepMap) under this level

      // we need to compute the selection state
      const selectionState = this.selectedMap.has(groupKeys)
        ? true
        : this.deselectedMap.has(groupKeys)
        ? false
        : parentSelected;

      const totalCount = this.getGroupCount(groupKeys);

      //explicitly selected rows
      let selectedCount = this.selectedMap.getKeysStartingWith(groupKeys, {
        excludeSelf: true,
        depthLimit: 1,
      }).length;

      // explicitly deselected rows
      let deselectedCount = this.deselectedMap.getKeysStartingWith(groupKeys, {
        excludeSelf: true,
        depthLimit: 1,
      }).length;

      const notSpecifiedCount = totalCount - (selectedCount + deselectedCount);

      const result = {
        selectedCount: selectedCount + (selectionState ? notSpecifiedCount : 0),
        deselectedCount:
          deselectedCount + (selectionState ? 0 : notSpecifiedCount),
      };

      this.selectionCountCache.set(groupKeys, result);

      return result;
    }

    let selectedCount = 0;
    let deselectedCount = 0;

    allKeys.forEach((keys) => {
      let isSelected = this.selectedMap.get(keys);
      let isDeselected = this.deselectedMap.get(keys);

      const selected = isSelected
        ? true
        : isDeselected
        ? false
        : parentSelected;

      const { selectedCount: selCount, deselectedCount: deselCount } =
        this.getSelectionCountFor(keys, selected);

      selectedCount += selCount;
      deselectedCount += deselCount;
    });

    const result = {
      selectedCount,
      deselectedCount,
    };

    this.selectionCountCache.set(groupKeys, result);

    return result;
  }
}
