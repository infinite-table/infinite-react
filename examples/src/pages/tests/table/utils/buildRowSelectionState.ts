import { Indexer } from '@src/components/DataSource/Indexer';
import {
  RowSelectionState,
  RowSelectionStateObject,
} from '@src/components/DataSource/RowSelectionState';

export function buildRowSelectionState(
  rowSelectionStateObject: RowSelectionStateObject | RowSelectionState,
  rows: Record<any, any[]>,
  onlyUsePrimaryKeys?: boolean,
): RowSelectionState<any> {
  const config = {
    onlyUsePrimaryKeys,
    getGroupKeysForPrimaryKey: (x: any) => {
      return rows[x] || [];
    },
    getAllPrimaryKeysInsideGroup: (groupKeys: any[]) => {
      const set = new Set(groupKeys);
      return Object.keys(rows)
        .map((k) => {
          const keys = rows[k];

          // the keys of the row are all in the set of group keys, so the row is in the group
          // thus it should include the key of the row in the result
          if (keys.filter((k) => set.has(k)).length === set.size) {
            return (k as any) * 1;
          }
          return false;
        })
        .filter((x) => x !== false);
    },
    getGroupCount(groupKeys: any[]) {
      return Object.keys(rows).filter((k) => {
        return JSON.stringify(groupKeys) === JSON.stringify(rows[k]);
      }).length;
    },
    getGroupKeysDirectlyInsideGroup: (groupKeys: any[]) => {
      return Object.keys(rows)
        .map((k) => rows[k])
        .filter((keys) => {
          return (
            keys.length === groupKeys.length + 1 &&
            groupKeys.reduce((ok, k, index) => {
              return ok && k === keys[index];
            }, true)
          );
        });
    },

    getGroupByLength: () =>
      Object.keys(rows).reduce((len, k) => {
        return Math.max(len, rows[k].length);
      }, 0),
  };

  const state = new RowSelectionState(
    rowSelectionStateObject,
    () => {
      return {
        onlyUsePrimaryKeys: !!onlyUsePrimaryKeys,
        groupBy: [],
        toPrimaryKey: (x) => x,
        indexer: new Indexer(),
        groupDeepMap: undefined,
        totalCount: 0,
        lazyLoad: false,
      };
    },
    config,
  );

  return state;
}
