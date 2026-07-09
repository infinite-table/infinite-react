/**
 * Vue sibling of InfiniteTableDetailRow.tsx - renders the expanded row
 * details and provides the master-detail context so a nested (detail)
 * DataSource can register itself with the master.
 */
import { defineComponent, h, shallowRef, watch } from 'vue';
import type { PropType, VNodeChild } from 'vue';

import type { RowDetailCache } from '../../../DataSource/RowDetailCache';
import type { DataSourceMasterDetailContextValue } from '../../../DataSource/types';
import { useDataSourceContext } from '../../../DataSource/DataSourceForVue.vue';
import { provideMasterDetailContextForVue } from '../../../DataSource/DataSourceMasterDetailContextForVue.vue';
import { join } from '../../../../utils/join';

import { internalProps } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { InfiniteTableRowInfo } from '../../types';
import { RowDetailRecipe } from '../rowDetail.css';
import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';

import {
  createCurrentRowCache,
  createMasterDetailContextValue,
} from './registerDetailShared';

const { rootClassName } = internalProps;

export const InfiniteTableRowDetailsClassName = `${rootClassName}RowDetail`;

export const InfiniteTableDetailRow = defineComponent({
  name: 'InfiniteTableDetailRow',
  props: {
    rowInfo: {
      type: Object as PropType<InfiniteTableRowInfo<any>>,
      required: true,
    },
    rowIndex: { type: Number, required: true },
    domRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: false,
    },
    rowDetailHeight: { type: Number, required: true },
    detailOffset: { type: Number, required: true },
    rowDetailRenderer: {
      type: Function as PropType<
        (rowInfo: InfiniteTableRowInfo<any>, cache: any) => VNodeChild
      >,
      required: true,
    },
    rowDetailsCache: {
      type: Object as PropType<RowDetailCache>,
      required: true,
    },
  },
  setup(props) {
    const {
      getDataSourceState: getMasterDataSourceState,
      dataSourceActions: masterActions,
    } = useDataSourceContext();
    const { getState: getMasterState } = useInfiniteTableContext();

    const create = () => {
      const { currentRowCache, cacheCalledByRowDetailRenderer } =
        createCurrentRowCache(props.rowInfo.id, props.rowDetailsCache);

      const masterDetailContextValue = createMasterDetailContextValue({
        rowInfo: props.rowInfo,
        currentRowCache,
        cacheCalledByRowDetailRenderer,
        getMasterDataSourceState,
        masterActions,
        getMasterState,
      });

      return { masterDetailContextValue, currentRowCache };
    };

    const contextRef = shallowRef(create());

    // a new context (with a fresh, once-guarded registerDetail) whenever this
    // detail row is recycled for a different master row
    watch(
      () => props.rowInfo.id,
      () => {
        contextRef.value = create();
      },
    );

    provideMasterDetailContextForVue(
      (): DataSourceMasterDetailContextValue =>
        contextRef.value.masterDetailContextValue,
    );

    const domRefCallback = (el: any) => {
      const node = el && el.$el !== undefined ? el.$el : el;
      props.domRef?.((node as HTMLElement) || null);
    };

    return () => {
      const { masterDetailContextValue, currentRowCache } = contextRef.value;

      // keep the row info fresh on each render
      masterDetailContextValue.masterRowInfo = props.rowInfo;

      return h(
        'div',
        {
          ref: domRefCallback,
          class: join(InfiniteTableRowDetailsClassName, RowDetailRecipe({})),
          style: {
            position: 'absolute',
            top: `${props.detailOffset}px`,
            left: 0,
            // TODO see #rowDetailWidth
            width: `calc(${InternalVars.bodyWidth} - ${InternalVars.scrollbarWidthVertical})`,
            height: `${props.rowDetailHeight}px`,
          },
        },
        [props.rowDetailRenderer(props.rowInfo, currentRowCache)],
      );
    };
  },
});
