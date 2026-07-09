<script setup lang="ts">
import { defineComponent, h, ref, watch } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnCell,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
  monthlyBonus: number;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  reposCount: number;
};

const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    monthlyBonus: 1000,
    currency: 'USD',
    salary: 1000,
    preferredLanguage: 'JavaScript',
    stack: 'Frontend',
    canDesign: 'yes',
    age: 30,
    reposCount: 100,
  },
];

const FlashingColumnCell = defineComponent({
  name: 'CustomFlashingColumnCell',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const cellContextRef = useInfiniteColumnCell<Developer>();

    const flashBackground = 'blue';
    const flash = ref(false);

    let prevValue = {
      columnId: cellContextRef.value?.column.id,
      rowId: cellContextRef.value?.rowInfo.id,
      value: cellContextRef.value?.value,
    };
    let flashTimeoutId: any = undefined;

    watch(
      () => {
        const ctx = cellContextRef.value;
        return ctx
          ? ([ctx.column.id, ctx.rowInfo.id, ctx.value] as const)
          : null;
      },
      (current) => {
        if (!current) {
          return;
        }
        const [columnId, rowId, value] = current;
        const prev = prevValue;

        if (
          prev.value !== value &&
          prev.rowId === rowId &&
          prev.columnId === columnId
        ) {
          flash.value = true;
          if (flashTimeoutId) {
            clearTimeout(flashTimeoutId);
          }
          flashTimeoutId = setTimeout(() => {
            flash.value = false;
          }, 100);
        }

        prevValue = {
          columnId,
          rowId,
          value,
        };
      },
      { flush: 'post' },
    );

    return () => {
      const ctx = cellContextRef.value;
      const attrsStyle = (attrs.style || {}) as Record<string, any>;

      return h(
        'div',
        {
          ...attrs,
          ref: ctx?.domRef as any,
          style: {
            ...attrsStyle,
            background: flash.value ? flashBackground : attrsStyle.background,
          },
        },
        [slots.default ? slots.default() : null, '-', `${ctx?.value}`],
      );
    };
  },
});

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  monthlyBonus: {
    field: 'monthlyBonus',
    type: 'number',
    components: {
      ColumnCell: FlashingColumnCell,
    },
    defaultWidth: 200,
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  reposCount: {
    field: 'reposCount',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <p>Update the monthlyBonus field to see the flashing effect</p>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
      :columnDefaultEditable="true"
    />
  </DataSource>
</template>
