<script setup lang="ts">
import { defineComponent, h } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-vue';

import {
  data,
  textOperators,
  stackOperatorFns,
} from './custom-filter-operator-switch.data';

// keeps the input inside its header cell
const editorStyle = { flex: 1, minWidth: 0, width: 0 };

// an editor that writes the value it is given
const TextFilterEditor = defineComponent({
  setup() {
    const editor = useInfiniteColumnFilterEditor();

    return () =>
      h('input', {
        'data-name': 'custom-editor',
        'aria-label': editor.ariaLabel.value,
        style: editorStyle,
        value: editor.value.value ?? '',
        onInput: (event: Event) =>
          editor.setValue((event.target as HTMLInputElement).value),
      });
  },
});

// replaces the default operator switch: a button that goes to the next operator
const OperatorSwitch = defineComponent({
  setup() {
    const editor = useInfiniteColumnFilterEditor();

    return () => {
      const names: string[] = editor.filterType.value.operators.map(
        (operator: { name: string }) => operator.name,
      );
      const operatorName = editor.operatorName.value;
      const next = names[(names.indexOf(operatorName!) + 1) % names.length];

      return h(
        'button',
        {
          'data-name': 'custom-switch',
          onClick: () =>
            editor.api.setColumnFilterOperator(editor.column.value.id, next),
        },
        operatorName,
      );
    };
  },
});

const filterTypes = {
  text: {
    label: 'Text',
    defaultOperator: 'startsWith',
    emptyValues: [''],
    components: {
      FilterEditor: TextFilterEditor,
      FilterOperatorSwitch: OperatorSwitch,
    },
    operators: textOperators,
  },
  stack: {
    label: 'Stack',
    defaultOperator: 'is',
    emptyValues: [''],
    operators: [
      {
        name: 'is',
        fn: stackOperatorFns.is,
        components: {
          Icon: () => h('span', { 'data-name': 'icon-is' }, '='),
        },
      },
      {
        name: 'isNot',
        fn: stackOperatorFns.isNot,
        components: {
          Icon: () => h('span', { 'data-name': 'icon-isNot' }, '!='),
        },
      },
    ],
  },
};

const columns: Record<string, any> = {
  id: { field: 'id', defaultFilterable: false },
  firstName: { field: 'firstName', filterType: 'text' },
  stack: { field: 'stack', filterType: 'stack' },
};

const defaultFilterValue: any[] = [];

const domProps = {
  style: {
    height: '100%',
  },
};
</script>

<template>
  <DataSource
    :data="data"
    primaryKey="id"
    :defaultFilterValue="defaultFilterValue"
    :filterDelay="0"
    :filterTypes="filterTypes"
  >
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="200"
      :columns="columns"
    />
  </DataSource>
</template>
