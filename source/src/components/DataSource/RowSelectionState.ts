import { DataSourceState } from '.';
import { DeepMap } from '../../utils/DeepMap';
import { getGroupKeysForDataItem } from '../../utils/groupAndPivot/getGroupKeysForDataItem';

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
  totalCount: number;
  indexer: DataSourceState<T>['indexer'];
  lazyLoad: boolean;
  onlyUsePrimaryKeys: boolean;
};

export type GetRowSelectionStateConfig<T> = () => RowSelectionStateConfig<T>;

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

  getGroupCount(groupKeys: any[]) {
    if (groupKeys.length == 0) {
      return this.getConfig().totalCount;
    }
    const groupDeepMap = this.getGroupDeepMap();
    const deepMapValue = groupDeepMap?.get(groupKeys);
    if (!deepMapValue) {
      return 0;
    }

    return deepMapValue.totalChildrenCount ?? (deepMapValue.items.length || 0);
  }

  getGroupKeysDirectlyInsideGroup(groupKeys: any[]) {
    const { groupDeepMap } = this.getConfig();
    return (
      groupDeepMap?.getKeysStartingWith(groupKeys, {
        excludeSelf: true,
        depthLimit: 1,
      }) || []
    );
  }

  getAllPrimaryKeysInsideGroup(groupKeys: any[]): any[] {
    const { groupDeepMap } = this.getConfig();

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
    // so now we're doing the opposite transformation
    const normalize = (allKeys: any[]) => {
      const groupByLength = this.getGroupByLength();
      return allKeys.map((keys) => {
        if (this.onlyUsePrimaryKeys) {
          return keys[0];
        }
        return keys.length > groupByLength ? keys.pop() : keys;
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
    this.update({
      defaultSelection: false,
      selectedRows: [],
      deselectedRows: [],
    });
  }

  public selectAll() {
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

    if (groupByLength && this.onlyUsePrimaryKeys) {
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

    if (this.getConfig().lazyLoad && !allKeys.length) {
      // no loaded rows under this group
      // so we need to somehow guess the selection
      const totalChildrenCount =
        this.getConfig().groupDeepMap?.get(groupKeys)?.totalChildrenCount || 0;

      if (parentSelected) {
        selectedCount = totalChildrenCount;
        // the deselection count might contain groups as well (with more than 1 row)
        // but here we count everything as a leaf row (so a value of 1)
        // which will be enough to render the selection checkbox in the correct state
        deselectedCount = this.deselectedMap.getAllChildrenSizeFor(groupKeys);
        if (deselectedCount === totalChildrenCount) {
          selectedCount = 0;
        }
      } else {
        deselectedCount = totalChildrenCount;
        // same as above, the selection count might contain ....
        selectedCount = this.selectedMap.getAllChildrenSizeFor(groupKeys);
        if (selectedCount === totalChildrenCount) {
          deselectedCount = 0;
        }
      }
    }
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
