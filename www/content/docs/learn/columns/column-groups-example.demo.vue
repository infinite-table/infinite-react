<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';
import type {
  InfiniteTableColumn,
  InfiniteTableColumnGroup,
} from '@infinite-table/infinite-vue';

import { data } from './column-groups-data';
import type { Person } from './column-groups-data';

const columnGroups: Record<string, InfiniteTableColumnGroup> = {
  'contact info': { header: 'Contact info' },

  street: { header: 'street', columnGroup: 'address' },
  location: { header: 'location', columnGroup: 'address' },
  address: { header: 'Address' },
};

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: { field: 'id' },

  streetNo: { field: 'streetNo', columnGroup: 'street' },
  city: { field: 'city', columnGroup: 'location' },

  streetName: {
    field: 'streetName',
    columnGroup: 'street',
  },
  firstName: { field: 'firstName' },

  country: { field: 'country', columnGroup: 'location' },
  region: { field: 'region', columnGroup: 'location' },

  email: { field: 'email', columnGroup: 'contact info' },
  phone: { field: 'phone', columnGroup: 'contact info' },
};
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable
      debugId="column-groups-example"
      :columnGroups="columnGroups"
      :columnDefaultWidth="130"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
