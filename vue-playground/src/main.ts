import { createApp, defineComponent, h, ref } from 'vue';

// component CSS (vanilla-extract output) + a theme from the theming build
import '@infinite-table/infinite-vue/index.css';
import '../../source/dist/theme/ocean.css';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  stack: string;
  currency: string;
  salary: number;
};

const data: Developer[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  firstName: `First ${i}`,
  lastName: `Last ${i}`,
  age: 20 + (i % 40),
  stack: i % 2 ? 'frontend' : 'backend',
  currency: ['USD', 'EUR', 'GBP'][i % 3],
  salary: 50_000 + (i % 50) * 1_000,
}));

const columns = {
  id: { field: 'id', header: 'ID', defaultWidth: 80, renderRowDetailIcon: true },
  firstName: { field: 'firstName', header: 'First Name' },
  lastName: { field: 'lastName', header: 'Last Name' },
  age: { field: 'age', header: 'Age', type: 'number', defaultWidth: 100 },
  stack: { field: 'stack', header: 'Stack' },
  currency: { field: 'currency', header: 'Currency', defaultWidth: 110 },
  salary: { field: 'salary', header: 'Salary', type: 'number' },
};

const App = defineComponent({
  setup() {
    const groupByStack = ref(false);
    const showFilters = ref(true);
    const rowDetails = ref(false);

    const rowDetailRenderer = (rowInfo: any) =>
      h(
        'div',
        {
          style: {
            padding: '10px',
            height: '100%',
            background: 'var(--infinite-background, #f5f5f5)',
          },
        },
        `Details for ${rowInfo.data?.firstName} ${rowInfo.data?.lastName} — ${rowInfo.data?.stack}, salary ${rowInfo.data?.salary}`,
      );

    return () => [
      h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, [
        h('strong', 'Infinite Table — Vue playground'),
        h(
          'label',
          { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
          [
            h('input', {
              type: 'checkbox',
              checked: groupByStack.value,
              onChange: (e: Event) => {
                groupByStack.value = (e.target as HTMLInputElement).checked;
              },
            }),
            'Group by stack',
          ],
        ),
        h(
          'label',
          { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
          [
            h('input', {
              type: 'checkbox',
              checked: showFilters.value,
              onChange: (e: Event) => {
                showFilters.value = (e.target as HTMLInputElement).checked;
              },
            }),
            'Column filters',
          ],
        ),
        h(
          'label',
          { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
          [
            h('input', {
              type: 'checkbox',
              checked: rowDetails.value,
              onChange: (e: Event) => {
                rowDetails.value = (e.target as HTMLInputElement).checked;
              },
            }),
            'Row details',
          ],
        ),
      ]),
      h('div', { style: { flex: 1, minHeight: 0 } }, [
        h(
          DataSource as any,
          {
            primaryKey: 'id',
            data,
            defaultSortInfo: [],
            defaultFilterValue: [],
            filterDelay: 0,
            groupBy: groupByStack.value ? [{ field: 'stack' }] : [],
          },
          {
            default: () =>
              h(InfiniteTable as any, {
                columns,
                columnDefaultWidth: 150,
                keyboardNavigation: 'cell',
                showColumnFilters: showFilters.value,
                ...(rowDetails.value
                  ? {
                      rowDetailHeight: 100,
                      rowDetailRenderer,
                      defaultRowDetailState: {
                        expandedRows: [],
                        collapsedRows: true as const,
                      },
                    }
                  : {}),
                style: { height: '100%' },
              }),
          },
        ),
      ]),
    ];
  },
});

createApp(App).mount('#app');
