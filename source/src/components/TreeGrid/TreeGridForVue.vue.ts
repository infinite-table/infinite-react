/**
 * Vue siblings of the TreeGrid + TreeDataSource convenience wrappers.
 *
 * - TreeGrid is just an InfiniteTable (tree behavior is driven entirely by
 *   the DataSource's nodesKey + the column's renderTreeIcon)
 * - TreeDataSource is a DataSource preset with nodesKey defaulting to
 *   'children'
 */
import { defineComponent, h } from 'vue';

import { toTreeDataArray } from '../../utils/groupAndPivot/treeUtils';
import {
  DataSource,
  DATA_SOURCE_PROP_NAMES,
} from '../DataSource/DataSourceForVue.vue';
import {
  InfiniteTable,
  DATA_GRID_PROP_NAMES,
} from '../InfiniteTable/InfiniteTableForVue.vue';

export { withSelectedLeafNodesOnly } from './treeSelectionUtils';
export { toTreeDataArray };

export const TreeGrid = defineComponent({
  name: 'TreeGrid',
  props: [...DATA_GRID_PROP_NAMES],
  setup(props, { slots }) {
    return () => h(InfiniteTable as any, { ...props }, slots);
  },
});

export const TreeDataSource = defineComponent({
  name: 'TreeDataSource',
  props: [...DATA_SOURCE_PROP_NAMES],
  setup(props, { slots }) {
    return () =>
      h(
        DataSource as any,
        {
          ...props,
          nodesKey: props.nodesKey ?? 'children',
        },
        slots,
      );
  },
});
