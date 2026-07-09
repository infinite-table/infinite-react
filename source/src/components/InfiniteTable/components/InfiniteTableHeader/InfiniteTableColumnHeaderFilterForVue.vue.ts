import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue';
import type {
  Component,
  ComputedRef,
  InjectionKey,
  PropType,
  Ref,
  ShallowRef,
} from 'vue';

import { join } from '../../../../utils/join';
import type {
  DataSourcePropFilterTypes,
  DataSourceFilterValueItem,
  DataSourceFilterOperator,
} from '../../../DataSource/types';
import type { Renderable } from '../../../types/Renderable';
import { height } from '../../utilities.css';
import { FilterIcon } from '../icons/FilterIconForVue.vue';

import { getColumnLabel } from './getColumnLabel';
import {
  HeaderFilterRecipe,
  HeaderFilterEditorCls,
  HeaderFilterOperatorCls,
  HeaderFilterOperatorIconRecipe,
} from './header.css';
import {
  InfiniteTableColumnHeaderFilterClassName,
  InfiniteTableColumnHeaderFilterOperatorClassName,
  InfiniteTableColumnHeaderFilterInputClassName,
} from './headerFilterClassNames';
import { useInfiniteHeaderCell } from './InfiniteTableHeaderCellForVue.vue';

import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';

/**
 * Vue sibling of InfiniteTableColumnHeaderFilter.tsx - the filter row
 * rendered below the header content when showColumnFilters is on, plus the
 * useInfiniteColumnFilterEditor composable for (custom) filter editors.
 */

export type InfiniteTableColumnHeaderFilterVueProps<T = any> = {
  horizontalLayoutPageIndex: null | number;
  filterEditor: Component;
  filterOperatorSwitch: Component;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  operator?: DataSourceFilterOperator<T>;
  columnLabel: Renderable;
  columnFilterType?: string;
  columnHeaderHeight: number;
  onChange: (value: any) => void;
};

export const InfiniteColumnHeaderFilterInjectionKey: InjectionKey<
  ShallowRef<InfiniteTableColumnHeaderFilterVueProps>
> = Symbol('InfiniteColumnHeaderFilter');

const stopPropagation = (e: Event) => e.stopPropagation();

export const InfiniteTableColumnHeaderFilter = defineComponent({
  name: 'InfiniteTableColumnHeaderFilter',
  props: {
    filterProps: {
      type: Object as PropType<InfiniteTableColumnHeaderFilterVueProps>,
      required: true,
    },
  },
  setup(props) {
    const tableContext = useInfiniteTableContext();
    const headerCellCtxRef = useInfiniteHeaderCell();

    const filterPropsRef = shallowRef<InfiniteTableColumnHeaderFilterVueProps>(
      props.filterProps,
    );
    provide(InfiniteColumnHeaderFilterInjectionKey, filterPropsRef);

    const focused = ref(false);
    const onFocusin = () => {
      focused.value = true;
    };
    const onFocusout = () => {
      focused.value = false;
    };

    return () => {
      filterPropsRef.value = props.filterProps;

      const column = headerCellCtxRef.value.column;
      const filterOperatorMenuVisibleForColumnId =
        tableContext.state.value.filterOperatorMenuVisibleForColumnId;

      const active =
        filterOperatorMenuVisibleForColumnId === column.id || focused.value;

      const FilterEditor = props.filterProps.filterEditor;
      const FilterOperatorSwitch = props.filterProps.filterOperatorSwitch;

      return h(
        'div',
        {
          onPointerup: stopPropagation,
          onPointerdown: stopPropagation,
          onFocusin,
          onFocusout,
          class: `${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe(
            { active },
          )}`,
          style: { height: `${props.filterProps.columnHeaderHeight}px` },
        },
        [h(FilterOperatorSwitch as any), h(FilterEditor as any)],
      );
    };
  },
});

export const InfiniteTableFilterOperatorSwitch = defineComponent({
  name: 'InfiniteTableFilterOperatorSwitch',
  setup() {
    const editor = useInfiniteColumnFilterEditor();

    return () => {
      const disabled = editor.disabled.value;
      const operator = editor.operator.value;

      const Icon = (operator?.components?.Icon as any) ?? FilterIcon;

      return h(
        'div',
        {
          'data-name': 'filter-operator',
          'data-disabled': disabled,
          onMousedown: (event: MouseEvent) => {
            event.stopPropagation();
            if (disabled) {
              return;
            }
            editor.columnApi.toggleFilterOperatorMenu(event.target!);
          },
          class: join(
            InfiniteTableColumnHeaderFilterOperatorClassName,
            HeaderFilterOperatorCls,
            disabled
              ? `${InfiniteTableColumnHeaderFilterOperatorClassName}--disabled`
              : '',
          ),
        },
        [
          h(Icon, {
            size: 20,
            className: `${HeaderFilterOperatorIconRecipe({
              disabled: !!disabled,
            })}`,
          }),
        ],
      );
    };
  },
});

export const InfiniteTableColumnHeaderFilterEmpty = defineComponent({
  name: 'InfiniteTableColumnHeaderFilterEmpty',
  setup() {
    return () =>
      h('div', {
        onPointerup: stopPropagation,
        onPointerdown: stopPropagation,
        class: `${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe(
          { active: false },
        )} ${height['50%']}`,
      });
  },
});

export type InfiniteColumnFilterEditorForVue<T = any> = {
  value: Ref<any>;
  setValue: (value: any) => void;
  clearValue: () => void;
  removeColumnFilter: () => void;
  disabled: ComputedRef<boolean | undefined>;
  operator: ComputedRef<DataSourceFilterOperator<T> | undefined>;
  operatorName: ComputedRef<string | undefined>;
  filterType: ComputedRef<any>;
  filterTypes: ComputedRef<DataSourcePropFilterTypes<T>>;
  filterTypeKey: ComputedRef<string>;
  filtered: ComputedRef<boolean>;
  columnFilterValue: ComputedRef<DataSourceFilterValueItem<T> | null>;
  column: ComputedRef<any>;
  columnApi: any;
  api: any;
  ariaLabel: ComputedRef<string>;
  className: string;
};

/**
 * Vue sibling of useInfiniteColumnFilterEditor - values are exposed as
 * refs/computeds instead of plain values (call in a filter editor's setup).
 */
export function useInfiniteColumnFilterEditor<
  T = any,
>(): InfiniteColumnFilterEditorForVue<T> {
  const tableContext = useInfiniteTableContext();
  const headerCellCtxRef = useInfiniteHeaderCell<T>();
  const filterCtxRef = inject(
    InfiniteColumnHeaderFilterInjectionKey,
  ) as ShallowRef<InfiniteTableColumnHeaderFilterVueProps<T>>;

  const { api, getComputed, getState, actions, dataSourceContext } =
    tableContext;
  const { getDataSourceState, dataSourceApi, dataSourceActions } =
    dataSourceContext;

  const column = computed(() => headerCellCtxRef.value.column);

  const filterType = computed(() => {
    const { columnFilterType, filterTypes } = filterCtxRef.value;
    return filterTypes[columnFilterType!];
  });

  const theValue = ref<any>(
    filterCtxRef.value.columnFilterValue?.filter.value ?? '',
  );

  watch(
    () => filterCtxRef.value.columnFilterValue?.filter.value,
    (filterValue) => {
      if (filterCtxRef.value.columnFilterValue) {
        if (theValue.value !== filterValue) {
          theValue.value = filterValue;
        }
      } else {
        // reset to empty value if no filter value defined
        const type = filterType.value;
        if (type) {
          const emptyValue = [...type.emptyValues][0];
          if (emptyValue !== theValue.value) {
            theValue.value = emptyValue;
          }
        }
      }
    },
  );

  const setValue = (filterValue: any) => {
    theValue.value = filterValue;
    filterCtxRef.value.onChange(filterValue);
  };

  const clearValue = () => {
    api.clearColumnFilter(column.value.id);
  };
  const removeColumnFilter = () => {
    api.removeColumnFilter(column.value.id);
  };

  const stableContext = {
    api,
    getState,
    getComputed,
    getDataSourceState,
    actions,
    dataSourceActions,
    dataSourceApi,
  };

  const ariaLabel = computed(() => {
    const columnLabel = getColumnLabel(
      column.value,
      stableContext as any,
      'column-filter',
    );
    return `Filter for ${columnLabel}`;
  });

  return {
    api,
    column,
    columnFilterValue: computed(() => filterCtxRef.value.columnFilterValue),
    columnApi: headerCellCtxRef.value.columnApi,
    operator: computed(() => filterCtxRef.value.operator),
    operatorName: computed(() => filterCtxRef.value.operator?.name),
    value: theValue,
    disabled: computed(() => filterCtxRef.value.columnFilterValue?.disabled),
    filterType,
    filterTypes: computed(() => filterCtxRef.value.filterTypes),
    filterTypeKey: computed(() => filterCtxRef.value.columnFilterType!),
    filtered: computed(() => column.value.computedFiltered),
    setValue,
    clearValue,
    removeColumnFilter,
    ariaLabel,
    className: `${HeaderFilterEditorCls} ${InfiniteTableColumnHeaderFilterInputClassName}`,
  };
}
