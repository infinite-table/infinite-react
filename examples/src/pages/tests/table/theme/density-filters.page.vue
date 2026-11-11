<script setup lang="ts">
import { ref } from 'vue';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { employees } from '../props/group-by/employees10';

const columns: Record<string, any> = {
  firstName: { field: 'firstName', header: 'First Name' },
  department: { field: 'department', header: 'Department' },
  age: { field: 'age', type: 'number', header: 'Age' },
};

const defaultGroupBy = [{ field: 'country' }];
const defaultFilterValue = [
  {
    field: 'department',
    filter: { type: 'string', operator: 'includes', value: 'e' },
  },
];
const domProps = { style: { height: '500px' } };

const density = ref('');
</script>
<template>
  <div>
    <button data-name="compact" @click="density = 'compact'">compact</button>
    <button data-name="spacious" @click="density = 'spacious'">spacious</button>
    <div id="wrapper" :class="density ? `infinite-density--${density}` : ''">
      <DataSource
        :data="employees"
        primaryKey="id"
        :defaultGroupBy="defaultGroupBy"
        :defaultFilterValue="defaultFilterValue"
      >
        <InfiniteTable :domProps="domProps" :columns="columns" />
      </DataSource>
    </div>
  </div>
</template>
