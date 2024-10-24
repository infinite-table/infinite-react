import { DeepMap } from '../../utils/DeepMap';

export type NodePath<PRIMARY_KEY_TYPE = any> = PRIMARY_KEY_TYPE[];

export type TreeExpandStateObject_ByPath<PRIMARY_KEY_TYPE = any> =
  | {
      expandedPaths: NodePath<PRIMARY_KEY_TYPE>[];
      collapsedPaths: NodePath<PRIMARY_KEY_TYPE>[];
      defaultExpanded: boolean;

      collapsedIds?: never;
      expandedIds?: never;
    }
  | {
      defaultExpanded: true;
      collapsedPaths: NodePath<PRIMARY_KEY_TYPE>[];
      expandedPaths?: NodePath<PRIMARY_KEY_TYPE>[];

      collapsedIds?: never;
      expandedIds?: never;
    }
  | {
      defaultExpanded: false;
      collapsedPaths?: NodePath<PRIMARY_KEY_TYPE>[];
      expandedPaths: NodePath<PRIMARY_KEY_TYPE>[];

      collapsedIds?: never;
      expandedIds?: never;
    };

export type TreeExpandStateObject_ById<PRIMARY_KEY_TYPE = any> =
  | {
      defaultExpanded: boolean;
      expandedIds: PRIMARY_KEY_TYPE[];
      collapsedIds: PRIMARY_KEY_TYPE[];

      expandedPaths?: never;
      collapsedPaths?: never;
    }
  | {
      defaultExpanded: true;
      collapsedIds: PRIMARY_KEY_TYPE[];
      expandedIds?: PRIMARY_KEY_TYPE[];

      expandedPaths?: never;
      collapsedPaths?: never;
    }
  | {
      defaultExpanded: false;
      collapsedIds?: PRIMARY_KEY_TYPE[];
      expandedIds: PRIMARY_KEY_TYPE[];

      expandedPaths?: never;
      collapsedPaths?: never;
    };

export type TreeExpandStateObject<PRIMARY_KEY_TYPE = any> =
  | TreeExpandStateObject_ByPath<PRIMARY_KEY_TYPE>
  | TreeExpandStateObject_ById<PRIMARY_KEY_TYPE>;

export type TreeExpandStateMode = 'id' | 'path';
export class TreeExpandState<PRIMARY_KEY_TYPE = any> {
  collapsedPathsMap: DeepMap<PRIMARY_KEY_TYPE, true> = new DeepMap();
  expandedPathsMap: DeepMap<PRIMARY_KEY_TYPE, true> = new DeepMap();

  collapsedIdsMap: Map<PRIMARY_KEY_TYPE, true> = new Map();
  expandedIdsMap: Map<PRIMARY_KEY_TYPE, true> = new Map();

  private _mode: TreeExpandStateMode = 'path';

  get mode() {
    return this._mode;
  }

  defaultExpanded: boolean = false;

  constructor(clone?: TreeExpandStateObject | TreeExpandState) {
    const stateObject =
      clone && clone instanceof Object.getPrototypeOf(this).constructor
        ? (clone as TreeExpandState).getState()
        : (clone as TreeExpandStateObject | undefined);

    if (stateObject) {
      this.update(stateObject);
    }
  }

  reset() {
    this.collapsedPathsMap.clear();
    this.expandedPathsMap.clear();

    this.collapsedIdsMap.clear();
    this.expandedIdsMap.clear();
  }

  destroy() {
    this.reset();
  }

  expandAll = () => {
    this.update({
      defaultExpanded: true,
      collapsedPaths: [],
    });
  };

  collapseAll = () => {
    this.update({
      defaultExpanded: false,
      expandedPaths: [],
    });
  };

  public expandNode(
    nodePathOrId: PRIMARY_KEY_TYPE | NodePath<PRIMARY_KEY_TYPE>,
  ) {
    this.setNodeExpanded(nodePathOrId, true);
  }
  public collapseNode(
    nodePathOrId: PRIMARY_KEY_TYPE | NodePath<PRIMARY_KEY_TYPE>,
  ) {
    this.setNodeExpanded(nodePathOrId, false);
  }

  public setNodeExpanded(
    nodePathOrId: PRIMARY_KEY_TYPE | NodePath<PRIMARY_KEY_TYPE>,
    expanded: boolean,
  ) {
    const {
      collapsedPathsMap,
      collapsedIdsMap,

      expandedPathsMap,
      expandedIdsMap,

      defaultExpanded,
      _mode: selectionMode,
    } = this;

    if (selectionMode === 'id' && Array.isArray(nodePathOrId)) {
      // get the id
      nodePathOrId = nodePathOrId[nodePathOrId.length - 1];
    }

    if (expanded === defaultExpanded) {
      if (expanded) {
        if (selectionMode === 'path' && Array.isArray(nodePathOrId)) {
          collapsedPathsMap.delete(nodePathOrId);
        } else {
          collapsedIdsMap.delete(nodePathOrId as PRIMARY_KEY_TYPE);
        }
      } else {
        if (selectionMode === 'path' && Array.isArray(nodePathOrId)) {
          expandedPathsMap.delete(nodePathOrId);
        } else {
          expandedIdsMap.delete(nodePathOrId as PRIMARY_KEY_TYPE);
        }
      }
    } else {
      if (expanded) {
        if (selectionMode === 'path' && Array.isArray(nodePathOrId)) {
          expandedPathsMap.set(nodePathOrId, true);
        } else {
          expandedIdsMap.set(nodePathOrId as PRIMARY_KEY_TYPE, true);
        }
      } else {
        if (selectionMode === 'path' && Array.isArray(nodePathOrId)) {
          collapsedPathsMap.set(nodePathOrId, true);
        } else {
          collapsedIdsMap.set(nodePathOrId as PRIMARY_KEY_TYPE, true);
        }
      }
    }
  }

  public isNodeExpandedByPath(nodePath: NodePath<PRIMARY_KEY_TYPE>): boolean {
    return this.isNodeExpanded(nodePath);
  }

  public isNodeExpandedById(id: PRIMARY_KEY_TYPE): boolean {
    return this.isNodeExpanded(id);
  }

  public isNodeExpanded(
    nodePathOrId: PRIMARY_KEY_TYPE | NodePath<PRIMARY_KEY_TYPE>,
  ): boolean {
    if (this._mode === 'id' && Array.isArray(nodePathOrId)) {
      // get the id
      nodePathOrId = nodePathOrId[nodePathOrId.length - 1];
    }
    if (this._mode === 'id' && Array.isArray(nodePathOrId)) {
      throw `You try to check if a node is expanded by id (${nodePathOrId}) but your TreeExpandState is configured to use node paths.`;
    }
    if (this._mode === 'path' && !Array.isArray(nodePathOrId)) {
      throw `You try to check if a node is expanded by path (${nodePathOrId}) but your TreeExpandState is configured to use node ids.`;
    }
    if (this.defaultExpanded) {
      if (this._mode === 'path' && Array.isArray(nodePathOrId)) {
        return !this.collapsedPathsMap.has(nodePathOrId);
      } else {
        return !this.collapsedIdsMap.has(nodePathOrId as PRIMARY_KEY_TYPE);
      }
    }
    if (this._mode === 'path' && Array.isArray(nodePathOrId)) {
      return this.expandedPathsMap.has(nodePathOrId);
    }
    return this.expandedIdsMap.has(nodePathOrId as PRIMARY_KEY_TYPE);
  }

  update(stateObject: TreeExpandStateObject) {
    this.defaultExpanded = stateObject.defaultExpanded;
    this.reset();
    if (
      (stateObject as TreeExpandStateObject_ByPath).expandedPaths ||
      (stateObject as TreeExpandStateObject_ByPath).collapsedPaths
    ) {
      this._mode = 'path';

      const expandedPaths = stateObject.expandedPaths || null;
      const collapsedPaths = stateObject.collapsedPaths || null;

      if (expandedPaths) {
        for (let i = 0, len = expandedPaths.length; i < len; i++) {
          this.expandedPathsMap.set(expandedPaths[i], true);
        }
      }

      if (collapsedPaths) {
        for (let i = 0, len = collapsedPaths.length; i < len; i++) {
          this.collapsedPathsMap.set(collapsedPaths[i], true);
        }
      }
      return;
    }

    this._mode = 'id';

    const expandedIds = stateObject.expandedIds || null;
    const collapsedIds = stateObject.collapsedIds || null;

    if (expandedIds) {
      for (let i = 0, len = expandedIds.length; i < len; i++) {
        this.expandedIdsMap.set(expandedIds[i], true);
      }
    }

    if (collapsedIds) {
      for (let i = 0, len = collapsedIds.length; i < len; i++) {
        this.collapsedIdsMap.set(collapsedIds[i], true);
      }
    }
  }

  public getState(): TreeExpandStateObject {
    if (this._mode === 'path') {
      const collapsedPaths: NodePath<PRIMARY_KEY_TYPE>[] = Array.from(
        this.collapsedPathsMap.keys(),
      );
      const expandedPaths: NodePath<PRIMARY_KEY_TYPE>[] = Array.from(
        this.expandedPathsMap.keys(),
      );

      return {
        defaultExpanded: this.defaultExpanded,
        collapsedPaths,
        expandedPaths,
      };
    }

    const collapsedIds: PRIMARY_KEY_TYPE[] = Array.from(
      this.collapsedIdsMap.keys(),
    );
    const expandedIds: PRIMARY_KEY_TYPE[] = Array.from(
      this.expandedIdsMap.keys(),
    );

    return {
      defaultExpanded: this.defaultExpanded,
      collapsedIds,
      expandedIds,
    };
  }
}
