import { DeepMap } from '../../utils/DeepMap';
import { DeepMapTreeValueType } from '../../utils/groupAndPivot';

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

export type TreeSelectionStateConfig<_T = any> = {
  treeDeepMap: DeepMap<any, DeepMapTreeValueType<any, any>>;
};

export type GetTreeSelectionStateConfig<T> = () => TreeSelectionStateConfig<T>;

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

  getTreeDeepMap() {
    return this.getConfig().treeDeepMap;
  }

  isLeafNode(nodePath: NodePath) {
    return !this.getTreeDeepMap().has(nodePath);
  }

  getLeafNodesCount(nodePath: NodePath) {
    const treeDeepMap = this.getTreeDeepMap();
    const deepMapValue = treeDeepMap.get(nodePath);
    if (!deepMapValue) {
      // this is a leaf node
      return 1;
    }

    return deepMapValue.items.length;
  }

  static from<T>(
    treeSelectionState: TreeSelectionStateObject,
    getConfig: GetTreeSelectionStateConfig<T>,
  ) {
    return new TreeSelectionState(treeSelectionState, getConfig);
  }

  constructor(
    state: TreeSelectionStateObject | TreeSelectionState,
    getConfig: GetTreeSelectionStateConfig<T>,
  ) {
    const stateObject =
      state instanceof Object.getPrototypeOf(this).constructor
        ? //@ts-ignore
          state.getState()
        : state;

    this.setConfigFn(getConfig);

    this.update(stateObject);
  }
  setConfigFn(getConfig: GetTreeSelectionStateConfig<T>) {
    this.getConfig = getConfig;
    this.xcache();
  }

  xcache() {
    this.cache.clear();
  }

  update(stateObject: TreeSelectionStateObject) {
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

  setSelectionForPath(nodePath: NodePath, selected: boolean) {
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

    if (this.isLeafNode(nodePath)) {
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

    const childPaths = selectionMap
      // todo this could be replaced with a .hasKeysUnder call (to be implemented in the deep map later)
      .getUnnestedKeysStartingWith(nodePath, true)
      .sort(shortestToLongest);

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
      const res = leafCount
        ? this.getNodeBooleanSelectionStateFromParent(nodePath)
        : false;

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
    // @ts-ignore
    this.getConfig = null;
    this.xcache();
    this.selectionMap.clear();
  }
}
