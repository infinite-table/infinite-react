<script setup lang="ts">
import { defineComponent, h, nextTick, ref, Teleport, watch } from 'vue';

import {
  InfiniteTable,
  DataSource,
  useInfiniteHeaderCell,
  alignNode,
  useInfinitePortalContainer,
} from '@infinite-table/infinite-vue';
import type {
  DataSourceData,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const FilterIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [h('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })],
  );

const ColumnFilterMenuIcon = defineComponent({
  setup() {
    const headerCell = useInfiniteHeaderCell();

    const portalContainer = useInfinitePortalContainer();

    const visible = ref(false);

    const domRef = ref<HTMLDivElement | null>(null);

    watch(visible, async () => {
      await nextTick();

      const alignToRef = headerCell.value.htmlElementRef;
      if (!domRef.value || !alignToRef.current) {
        return;
      }

      alignNode(domRef.value, {
        alignTo: alignToRef.current,
        alignPosition: [['TopRight', 'BottomRight']],
      });
    });

    const onMousedown = (e: MouseEvent) => {
      // @ts-ignore
      e.__insideMenu = headerCell.value.column.id;
    };

    const onPointerdown = (event: PointerEvent) => {
      const { column } = headerCell.value;

      event.stopPropagation();

      if (visible.value) {
        visible.value = false;
        return;
      }

      visible.value = true;

      function handleMouseDown(event: MouseEvent) {
        // @ts-ignore
        if (event.__insideMenu !== column.id) {
          visible.value = false;
          document.documentElement.removeEventListener(
            'mousedown',
            handleMouseDown,
          );
        }
      }
      document.documentElement.addEventListener('mousedown', handleMouseDown);
    };

    return () => {
      const { renderBag, column } = headerCell.value;

      return h('div', { onMousedown, onPointerdown }, [
        h(FilterIcon),
        portalContainer.value
          ? h(Teleport, { to: portalContainer.value }, [
              h(
                'div',
                {
                  ref: domRef,
                  // the popup is not inside the div above, so its events
                  // don't reach the handlers of that div: it gets the same ones
                  onMousedown,
                  onPointerdown,
                  style: {
                    position: 'absolute',
                    color: 'white',
                    top: '0px',
                    overflow: 'visible',
                    background: 'var(--infinite-background)',
                    border: `var(--infinite-cell-border)`,
                    left: '0px',
                    width: `${column.computedWidth}px`,
                    padding: '10px',
                    display: visible.value ? 'block' : 'none',
                  },
                },
                [renderBag.filterEditor],
              ),
            ])
          : null,
      ]);
    };
  },
});

const customHeaderWithFilterMenu: InfiniteTableColumn<any>['renderHeader'] = ({
  renderBag,
}) => {
  return [
    renderBag.header,
    h('div', { style: { flex: 1 } }),

    renderBag.filterIcon,

    renderBag.menuIcon,
    h(ColumnFilterMenuIcon),
  ];
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
    renderHeader: customHeaderWithFilterMenu,
  },
  salary: {
    field: 'salary',
    type: 'number',
    renderHeader: customHeaderWithFilterMenu,
  },

  firstName: {
    field: 'firstName',
    renderHeader: customHeaderWithFilterMenu,
  },
  stack: { field: 'stack', renderHeader: customHeaderWithFilterMenu },
  currency: { field: 'currency', renderHeader: customHeaderWithFilterMenu },
};

const shouldReloadData = {
  filterValue: false,
  sortInfo: false,
  groupBy: false,
  pivotBy: false,
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultFilterValue="[]"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable
      debugId="custom-column-filter-display-example"
      :showColumnFilters="false"
      :columnDefaultWidth="150"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
