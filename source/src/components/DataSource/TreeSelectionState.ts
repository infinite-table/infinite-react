import { DeepMap } from '../../utils/DeepMap';

export type NodePath = any[];

export type TreeSelectionStateObject =
  | {
      selectedPaths: NodePath;
      deselectedPaths: NodePath;
      defaultSelection: boolean;
    }
  | {
      defaultSelection: true;
      deselectedPaths: NodePath;
      selectedPaths?: NodePath;
    }
  | {
      defaultSelection: false;
      selectedPaths: NodePath;
      deselectedPaths?: NodePath;
    };

type TreeSelectionStateConfigObject = {
  treePaths: DeepMap<any, true>;
  strictCheckPaths: boolean;
};

export type TreeSelectionStateConfigParam<_T = any> = {
  treePaths: TreeSelectionStateConfigObject['treePaths'] | any[][];
  /**
   * Defaults to true. If false, when checking if a given path is selected,
   * it will not check if the path is in the treePaths, but will only check
   * in the selectionMap.
   *
   * If true, will check for the path both in the treePaths and the selectionMap.
   */
  strictCheckPaths?: boolean;
};
export type GetTreeSelectionStateConfig<T> =
  | TreeSelectionStateConfigParam<T>
  | (() => TreeSelectionStateConfigParam<T>);

type NodeSelectionState = {
  selected: boolean | null;
  selectedCount: number;
  deselectedCount: number;
  leafCount: number;
};
const shortestToLongest = (a: NodePath, b: NodePath) => a.length - b.length;

export class TreeSelectionState<T = any> {
  selectedPaths: NodePath[] | null = null;
  deselectedPaths: NodePath[] | null = null;

  defaultSelection: boolean = false;
  selectionMap: DeepMap<NodePath, boolean> = new DeepMap();

  cache: DeepMap<NodePath, NodeSelectionState> = new DeepMap();

  getConfig!: GetTreeSelectionStateConfig<T>;

  config!: TreeSelectionStateConfigObject;

  getTreePaths(treePaths?: TreeSelectionStateConfigParam['treePaths']) {
    if (treePaths) {
      if (Array.isArray(treePaths)) {
        return new DeepMap(treePaths.map((path) => [path, true] as const));
      }
      return treePaths;
    }
    return this.config.treePaths;
  }

  withTreePaths<T>(
    fn: (treePaths: TreeSelectionStateConfigObject['treePaths']) => T,
    treePaths?: TreeSelectionStateConfigParam['treePaths'],
  ): T {
    const initialTreePaths = this.config.treePaths;

    treePaths = this.getTreePaths(treePaths);

    const treePathsDifferent = treePaths !== initialTreePaths;

    if (treePathsDifferent) {
      this.xcache();
    }

    this.config.treePaths = treePaths;

    const result = fn(treePaths);

    this.config.treePaths = initialTreePaths;

    if (treePathsDifferent) {
      this.xcache();
    }

    return result;
  }

  getLeafNodePaths(
    rootNodePath: NodePath = [],
    treePaths?: TreeSelectionStateConfigParam['treePaths'],
  ) {
    return this.withTreePaths((paths) => {
      return paths.getKeysForLeafNodesStartingWith(rootNodePath);
    }, treePaths);
  }

  forEachLeafNodePath(
    fn: (nodePath: NodePath, { selected }: { selected: boolean }) => void,
    rootNodePath: NodePath = [],
    treePaths?: TreeSelectionStateConfigParam['treePaths'],
  ) {
    const selectedObj = { selected: false };
    this.withTreePaths((paths) => {
      paths.getLeafNodesStartingWith(rootNodePath, (pair) => {
        selectedObj.selected = this.isNodeSelected(pair.keys) === true;
        fn(pair.keys, selectedObj);
      });
    }, treePaths);
  }

  getSelectedLeafNodePaths(
    rootNodePath: NodePath = [],
    treePaths?: TreeSelectionStateConfigParam['treePaths'],
  ) {
    const selectedLeafPaths: NodePath[] = [];

    this.withTreePaths((paths) => {
      paths.getLeafNodesStartingWith(rootNodePath, (pair) => {
        if (this.isNodeSelected(pair.keys)) {
          selectedLeafPaths.push(pair.keys);
        }
      });
    }, treePaths);

    return selectedLeafPaths;
  }

  getDeselectedLeafNodePaths(
    rootNodePath: NodePath = [],
    treePaths?: TreeSelectionStateConfigParam['treePaths'],
  ) {
    const deselectedLeafPaths: NodePath[] = [];

    this.withTreePaths((paths) => {
      paths.getLeafNodesStartingWith(rootNodePath, (pair) => {
        if (!this.isNodeSelected(pair.keys)) {
          deselectedLeafPaths.push(pair.keys);
        }
      });
    }, treePaths);

    return deselectedLeafPaths;
  }

  isLeafNode(nodePath: NodePath): boolean | null {
    const { treePaths } = this.config;

    if (!treePaths.has(nodePath)) {
      return null;
    }

    const keys = treePaths.getKeysForLeafNodesStartingWith(nodePath);

    if (keys.length === 1) {
      return true;
    }

    return false;

    // this was the initial implementation
    // which is very correct, but let's use the tree paths instead of treeDeepMap
    // because a TreeSelectionState object can be created more easily with a treePaths object
    // than with a treeDeepMap object

    // return !this.getTreeDeepMap().has(nodePath);
  }

  getLeafNodesCount(nodePath: NodePath) {
    // if the node path is a leaf node, we return 1
    return this.config.treePaths.getKeysForLeafNodesStartingWith(nodePath)
      .length;

    // const treeDeepMap = this.getTreeDeepMap();
    // const deepMapValue = treeDeepMap.get(nodePath);
    // if (!deepMapValue) {
    //   // this is a leaf node
    //   return 1;
    // }

    // return deepMapValue.items.length;
  }

  static from<T>(
    treeSelectionState: TreeSelectionStateObject,
    getConfig: GetTreeSelectionStateConfig<T>,
  ) {
    return new TreeSelectionState(treeSelectionState, getConfig);
  }

  constructor(
    state: TreeSelectionStateObject | TreeSelectionState,
    getConfig?: GetTreeSelectionStateConfig<T>,
  ) {
    const isTreeSelectionStateInstance =
      state instanceof Object.getPrototypeOf(this).constructor;
    const stateObject = isTreeSelectionStateInstance
      ? //@ts-ignore
        state.getState()
      : state;

    this.setConfig(
      getConfig ||
        (isTreeSelectionStateInstance
          ? (state as TreeSelectionState).config
          : {
              treePaths: new DeepMap(),
            }),
    );

    this.disableStrictMode();
    this.update(stateObject);

    if (this.config.strictCheckPaths) {
      this.enableStrictMode();
    }
  }
  setConfig(getConfig: GetTreeSelectionStateConfig<T>) {
    const config = typeof getConfig === 'function' ? getConfig() : getConfig;

    const treePaths = Array.isArray(config.treePaths)
      ? new DeepMap(config.treePaths.map((path) => [path, true as const]))
      : config.treePaths;

    this.config = {
      treePaths,
      strictCheckPaths: config.strictCheckPaths ?? true,
    };
    this.xcache();
  }

  private xcache() {
    this.cache.clear();
  }

  private update(stateObject: TreeSelectionStateObject) {
    this.selectedPaths = stateObject.selectedPaths || null;
    this.deselectedPaths = stateObject.deselectedPaths || null;

    const { selectionMap, selectedPaths, deselectedPaths } = this;

    selectionMap.clear();

    selectedPaths?.forEach((nodePath) =>
      this.setSelectionForPath(nodePath, true),
    );
    deselectedPaths?.forEach((nodePath) =>
      this.setSelectionForPath(nodePath, false),
    );

    this.defaultSelection = stateObject.defaultSelection;

    this.xcache();
  }

  private setSelectionForPath(nodePath: NodePath, selected: boolean) {
    if (!this.isPathAvailable(nodePath)) {
      return;
    }

    this.selectionMap.set(nodePath, selected);
  }

  public getState(): TreeSelectionStateObject {
    const selectedPaths: NodePath[] = [];
    const deselectedPaths: NodePath[] = [];
    this.selectionMap.topDownEntries().forEach(([path, value]) => {
      if (value) {
        selectedPaths.push(path);
      } else {
        deselectedPaths.push(path);
      }
    });

    return {
      defaultSelection: this.defaultSelection,
      selectedPaths,
      deselectedPaths,
    };
  }

  public deselectAll() {
    this.update({
      defaultSelection: false,
      selectedPaths: [],
      deselectedPaths: [],
    });
  }

  public selectAll() {
    this.update({
      defaultSelection: true,
      deselectedPaths: [],
      selectedPaths: [],
    });
  }

  private strictMode = false;

  enableStrictMode() {
    this.strictMode = true;
  }

  disableStrictMode() {
    this.strictMode = false;
  }

  isPathAvailable(nodePath: NodePath) {
    if (!this.strictMode) {
      return true;
    }

    const { treePaths } = this.config;

    return treePaths.has(nodePath);
  }

  isNodeSelected(nodePath: NodePath) {
    return this.isPathSelected(nodePath);
  }

  private isSelfSelected(nodePath: NodePath) {
    return this.selectionMap.get(nodePath) ?? null;
  }

  private cacheIt(nodePath: NodePath, state: NodeSelectionState) {
    this.cache.set(nodePath, state);
    return state;
  }

  private getSelectionStateForNode(
    nodePath: NodePath,
    earlyExit?: boolean,
  ): NodeSelectionState {
    const cachedResult = this.cache.get(nodePath);
    if (cachedResult) {
      return cachedResult;
    }

    if (this.isLeafNode(nodePath) !== false) {
      const selected = this.isSelfSelected(nodePath);
      if (selected !== null) {
        return this.cacheIt(nodePath, {
          selected,
          selectedCount: selected ? 1 : 0,
          deselectedCount: selected ? 0 : 1,
          leafCount: 1,
        });
      }
    }

    const leafCount = this.getLeafNodesCount(nodePath);
    let currentSelectionState: boolean | null = this.isSelfSelected(nodePath);

    const { selectionMap } = this;

    let childPaths = selectionMap
      // todo this could be replaced with a .hasKeysUnder call (to be implemented in the deep map later)
      .getKeysOfFirstChildOnEachBranchStartingWith(nodePath, {
        excludeSelf: true,
      })
      .sort(shortestToLongest);

    if (this.strictMode) {
      childPaths = childPaths.filter((path) => this.isPathAvailable(path));
    }

    if (!childPaths.length) {
      // no explicit selection or deselection for any child

      if (currentSelectionState !== null) {
        // but if this is explicitly selected or deselected, return that
        const res = leafCount
          ? currentSelectionState
          : /* if this has no leaves, we'll consider it deselected */ false;

        return this.cacheIt(nodePath, {
          selected: res,
          selectedCount: res ? leafCount : 0,
          deselectedCount: res ? 0 : leafCount,
          leafCount,
        });
      }

      // there are no explicit selection or deselection for any child
      // so we have to go to the parent to determine the selection state

      const res = this.getNodeBooleanSelectionStateFromParent(nodePath);

      return this.cacheIt(nodePath, {
        selected: res,
        selectedCount: res ? leafCount : 0,
        deselectedCount: res ? 0 : leafCount,
        leafCount,
      });
    }

    // at this point we know there are some explicit selections or deselections
    // on some children

    let selectedCount = 0;
    let deselectedCount = 0;

    const selfSelected = this.getNodeBooleanSelectionStateFromParent(nodePath);

    if (selfSelected) {
      selectedCount += leafCount;
    } else {
      deselectedCount += leafCount;
    }

    for (let i = 0, len = childPaths.length; i < len; i++) {
      const childPath = childPaths[i];

      const { selectedCount: selCount, deselectedCount: deselCount } =
        this.getSelectionStateForNode(childPath);

      if (selfSelected) {
        // we assumed all were selected, but in fact some are not
        // so subtract those
        selectedCount -= deselCount;
        deselectedCount += deselCount;
      } else {
        // we assumed all were deselected, but in fact some are selected
        deselectedCount -= selCount;
        selectedCount += selCount;
      }

      if (earlyExit && selCount > 0 && deselCount > 0) {
        // it has both selected and deselected nodes
        return this.cacheIt(nodePath, {
          selected: null,
          leafCount,
          selectedCount,
          deselectedCount,
        });
      }
    }
    if (!selectedCount && !deselectedCount) {
      return this.cacheIt(nodePath, {
        selected: selfSelected,
        selectedCount: selfSelected ? leafCount : 0,
        deselectedCount: selfSelected ? 0 : leafCount,
        leafCount,
      });
    }

    if (selectedCount) {
      const res = selectedCount === leafCount ? true : null;

      return this.cacheIt(nodePath, {
        selected: res,
        selectedCount,
        deselectedCount,
        leafCount,
      });
    }

    return this.cacheIt(nodePath, {
      selected: false,
      selectedCount: 0,
      deselectedCount: leafCount,
      leafCount,
    });
  }

  private isPathSelected(nodePath: NodePath) {
    if (!this.isPathAvailable(nodePath)) {
      return false;
    }

    return this.getSelectionStateForNode(nodePath, true).selected;
  }

  private getNodeBooleanSelectionStateFromParent(
    initialNodePath: any[],
  ): boolean {
    const { defaultSelection, selectionMap } = this;
    if (!initialNodePath.length) {
      return defaultSelection;
    }

    // clone the keys so we can mutate
    const nodePath = [...initialNodePath];

    do {
      const currentValue = selectionMap.get(nodePath);
      if (currentValue !== undefined) {
        return currentValue;
      }
      nodePath.pop();
    } while (nodePath.length);

    return defaultSelection;
  }

  public setNodeSelection(nodePath: NodePath, selected: boolean) {
    if (!nodePath.length) {
      return;
    }
    this.xcache();
    // retrieve any selection under this group
    const keys = this.selectionMap.getKeysStartingWith(nodePath);

    // and clean it up
    keys.forEach((nodePath) => {
      this.selectionMap.delete(nodePath);
    });

    // finally make sure this selection is set
    // so set it explicitly in the selection map
    if (nodePath.length === 1 && this.defaultSelection === selected) {
      // this is top level, but default selection is the same
      // so we can skip putting it in the map
    } else {
      this.setSelectionForPath(nodePath, selected);

      if (nodePath.length > 1) {
        const parentPath = nodePath.slice(0, -1);

        // probably the parent has the same value, so worth adjusting the parent explicitly
        // const defaultSelection =
        //   this.getNodeBooleanSelectionStateFromParent(parentPath);
        const parentSelected = this.isNodeSelected(parentPath);
        if (parentSelected === selected) {
          this.setNodeSelection(parentPath, selected);
        }
      }
    }
  }

  public selectNode(nodePath: NodePath) {
    this.setNodeSelection(nodePath, true);
  }

  public deselectNode(nodePath: any[]) {
    this.setNodeSelection(nodePath, false);
  }

  public toggleNodeSelection(nodePath: NodePath) {
    this.setNodeSelection(nodePath, !this.isNodeSelected(nodePath));
  }

  public getSelectedCount() {
    return this.getSelectionCountFor([]).selectedCount;
  }

  public getDeselectedCount() {
    return this.getSelectionCountFor([]).deselectedCount;
  }

  public getSelectionCountFor(nodePath: NodePath = []) {
    const { selectedCount, deselectedCount } =
      this.getSelectionStateForNode(nodePath);

    return {
      selectedCount,
      deselectedCount,
    };
  }

  destroy() {
    //@ts-ignore
    this.config = undefined;
    this.xcache();
    this.selectionMap.clear();
  }
}
