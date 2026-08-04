<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';

import {
  DataSource,
  InfiniteTable,
  useInfiniteColumnCell,
  useInfiniteTableContext,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource = () => {
  return developers;
};

const clickedId = ref<number | null>(null);
const clickedFirstName = ref<string | null>(null);

const IdentifierCell = defineComponent({
  name: 'IdentifierCell',
  setup() {
    const cellContextRef = useInfiniteColumnCell<Developer>();
    const tableContext = useInfiniteTableContext<Developer>();

    const onClick = () => {
      const value = cellContextRef.value?.value;
      const id = tableContext.api
        .getColumnApi('identifier')
        ?.getCellValueByPrimaryKey(value);
      clickedId.value = id;
    };

    return () => {
      const value = cellContextRef.value?.value;
      return h('div', [
        'ID: ',
        h('b', `${value}`),
        h('button', { onClick }, 'click to show context menu'),
      ]);
    };
  },
});

const FirstNameCell = defineComponent({
  name: 'FirstNameCell',
  setup() {
    const cellContextRef = useInfiniteColumnCell<Developer>();
    const tableContext = useInfiniteTableContext<Developer>();

    const onClick = () => {
      const data = cellContextRef.value?.data;
      const columnApi = tableContext.api.getColumnApi('firstName');
      const firstName = columnApi?.getCellValueByPrimaryKey(data!.id);
      clickedFirstName.value = firstName;
    };

    return () => {
      const value = cellContextRef.value?.value;
      return h('div', [
        h('b', `${value}`),
        h('button', { onClick }, 'click me'),
      ]);
    };
  },
});

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
    render: () => h(IdentifierCell),
  },
  firstName: {
    // valueFormatter: ({ value }) => `Name: ${value}`,
    render: () => h(FirstNameCell),
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};

const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

const getCellContextMenuItems = ({
  column,
  value,
}: {
  column: any;
  value: any;
}) => {
  if (column.id === 'identifier') {
    return [
      {
        label: `Hello ${value}`,
        key: 'hello',
      },
    ];
  }

  return [
    {
      label: `hi ${value}`,
      key: 'hi',
    },
    {
      label: `hi ${value} - item 2`,
      key: 'hi2',
    },
  ];
};
</script>

<template>
  <div data-testid="clicked-id">clicked id: {{ clickedId }}</div>
  <div data-testid="clicked-firstName">
    clicked firstName: {{ clickedFirstName }}
  </div>
  <DataSource :data="dataSource" primaryKey="id">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
      :getCellContextMenuItems="getCellContextMenuItems"
    />
  </DataSource>
</template>
