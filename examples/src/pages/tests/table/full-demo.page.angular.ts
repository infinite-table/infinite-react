import {
  Component,
  TemplateRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';

import {
  DataSource,
  GroupRowsState,
  InfiniteCheckBox,
  InfiniteRender,
  InfiniteTable,
} from '@infinite-table/infinite-angular';

import type {
  InfiniteTableColumn,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
  DataSourcePropRowSelection_MultiRow,
  DataSourcePropFilterValue,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-angular';

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

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (value: number, arr: any[]) =>
    arr.length ? Math.floor(value / arr.length) : 0,
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    field: 'salary',

    ...avgReducer,
  },
  age: {
    field: 'age',
    ...avgReducer,
  },
  currency: {
    field: 'currency',
    initialValue: new Set<string>(),
    reducer: (acc: Set<string>, value: string) => {
      acc.add(value);
      return acc;
    },
    done: (value: Set<string>) => {
      return value.size > 1 ? 'Mixed' : value.values().next().value;
    },
  },
  canDesign: {
    field: 'canDesign',

    initialValue: false,
    reducer: (acc: boolean | null, value: 'yes' | 'no') => {
      if (acc === null) {
        return acc;
      }
      if (acc === false && value === 'yes') {
        return null;
      }
      if (acc === true && value === 'no') {
        return null;
      }
      return acc;
    },
  },
};

const flags = {
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  France: '🇫🇷',
  Germany: '🇩🇪',
  'United Kingdom': '🇬🇧',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  Sweden: '🇸🇪',
  China: '🇨🇳',
  Brazil: '🇧🇷',
  Turkey: '🇹🇷',
  Italy: '🇮🇹',
  India: '🇮🇳',
  Indonesia: '🇮🇩',
  Japan: '🇯🇵',
  Argentina: '🇦🇷',
  'Saudi Arabia': '🇸🇦',
  Mexico: '🇲🇽',
  'United Arab Emirates': '🇦🇪',
};

const groupColumn: InfiniteTableColumn<Developer> = {
  header: 'Grouping',
  field: 'firstName',
  defaultWidth: 250,
  renderSelectionCheckBox: true,
  defaultFilterable: false,

  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({ value, rowInfo }: { value: any; rowInfo: any }) => {
    if (!rowInfo.isGroupRow) {
      return `${rowInfo.indexInAll} ${rowInfo.id} ${value}`;
    }
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const currentGroupBy = groupBy[groupBy.length - 1];

    if (currentGroupBy?.field === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `${rowInfo.indexInAll} ${value}`;
  },
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [
    ['United States'],
    ['United States', 'backend'],
    ['France'],
    ['Turkey'],
  ],
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    align: 'end',
    style: () => {
      return {};
    },
    renderValue: ({ value, data, rowInfo }) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency:
          rowInfo.isGroupRow && (rowInfo as any).data?.currency === 'Mixed'
            ? 'USD'
            : data?.currency || 'USD',
      }).format(value);
    },
  },
};

const defaultRowSelection: DataSourcePropRowSelection_MultiRow = {
  selectedRows: [['United States'], ['India'], ['France'], ['Turkey']],
  deselectedRows: [['United States', 'frontend']],
  defaultSelection: false,
};

const defaultFilterValue: DataSourcePropFilterValue<Developer> = [
  {
    field: 'age',
    filter: {
      operator: 'gt',
      type: 'number',
      value: null,
    },
  },
];

const domProps = {
  style: {
    minHeight: '50vh',
    width: '100vw',
    // width: 575,
    marginTop: '200px',
  },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  { field: 'stack' },
];

const defaultColumnPinning = {
  'group-by': true as const,
};

const licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

@Component({
  imports: [DataSource, InfiniteTable, InfiniteCheckBox, InfiniteRender],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [defaultFilterValue]="defaultFilterValue"
      [useGroupKeysForMultiRowSelection]="true"
      [defaultRowSelection]="defaultRowSelection"
      (dataArrayChange)="onDataArrayChange($event)"
      [defaultGroupRowsState]="defaultGroupRowsState"
      [aggregationReducers]="aggregationReducers"
      [groupBy]="groupBy"
    >
      <infinite-table
        groupRenderStrategy="single-column"
        [defaultColumnPinning]="defaultColumnPinning"
        [domProps]="domProps"
        [defaultActiveRowIndex]="0"
        [groupColumn]="groupColumn"
        [licenseKey]="licenseKey"
        [columns]="columns()"
        [columnTypes]="columnTypes"
        [columnDefaultWidth]="150"
      />
    </infinite-data-source>

    <ng-template #canDesignValue let-value>
      <div style="display: flex; align-items: center">
        <input
          type="checkbox"
          infiniteCheckBox
          [defaultChecked]="value === null ? null : value === 'yes'"
          [domProps]="checkBoxDomProps"
        />{{ value === null ? 'Some' : value === 'yes' ? 'Yes' : 'No' }}
      </div>
    </ng-template>

    <ng-template #countryValue let-value>
      <span>{{ flagFor(value) }} {{ value }}</span>
    </ng-template>

    <ng-template #salaryRender let-value let-renderBag="renderBag">
      <div
        style="position: absolute; display: flex; align-items: center; justify-content: flex-end; top: 0; bottom: 0; left: 0; right: 0"
        [style.background-color]="salaryBackground(value)"
      >
        <ng-container [infiniteRender]="renderBag.all" />
      </div>
    </ng-template>
  `,
})
export default class FullDemoPage {
  protected readonly dataSource = dataSource;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly defaultRowSelection = defaultRowSelection;
  protected readonly defaultGroupRowsState = defaultGroupRowsState;
  protected readonly aggregationReducers = aggregationReducers;
  protected readonly groupBy = groupBy;
  protected readonly defaultColumnPinning = defaultColumnPinning;
  protected readonly domProps = domProps;
  protected readonly groupColumn = groupColumn;
  protected readonly licenseKey = licenseKey;
  protected readonly columnTypes = columnTypes;

  protected readonly checkBoxDomProps = {
    style: {
      marginRight: '10px',
    },
  };

  private readonly canDesignValue =
    viewChild.required<TemplateRef<unknown>>('canDesignValue');
  private readonly countryValue =
    viewChild.required<TemplateRef<unknown>>('countryValue');
  private readonly salaryRender =
    viewChild.required<TemplateRef<unknown>>('salaryRender');

  private readonly minMax = signal({ min: 0, max: 0 });

  protected flagFor(value: any) {
    return (flags as any)[value] || '';
  }

  protected salaryBackground(value: number) {
    const { min, max } = this.minMax();
    const increase: number = Math.abs(max - min);
    const percentage = ((value - min) / increase) * 100;
    const alpha = Number((percentage / 100).toPrecision(2)) + 0.2;

    return `rgba(255, 0, 0, ${alpha})`;
  }

  private getColumns(): Record<string, InfiniteTableColumn<Developer>> {
    return {
      age: {
        field: 'age',
        header: 'Age',
        type: 'number',
        defaultWidth: 100,
        renderValue: ({ value }) => value,
      },
      salary: {
        field: 'salary',
        type: 'number',
        defaultWidth: 210,
      },
      currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
      preferredLanguage: {
        field: 'preferredLanguage',
        header: 'Programming Language',
      },

      canDesign: {
        defaultWidth: 135,
        field: 'canDesign',
        header: 'Design Skills',
        renderValue: () => this.canDesignValue(),
      },
      country: {
        field: 'country',
        header: 'Country',
        renderValue: () => this.countryValue(),
      },
      firstName: { field: 'firstName', header: 'First Name' },
      stack: { field: 'stack', header: 'Stack' },

      city: {
        field: 'city',
        header: 'City',
        renderHeader: ({ column }: { column: any }) =>
          `${column.computedVisibleIndex} City`,
      },
    };
  }

  // a new columns object when min/max change, so the salary cells re-render
  protected readonly columns = computed(() => {
    this.minMax();
    const cols = this.getColumns();

    if (cols.salary) {
      cols.salary.render = () => this.salaryRender();
    }

    return cols;
  });

  protected onDataArrayChange(data: Developer[]) {
    const min = Math.min(...data.map((data) => data.salary ?? 0));
    const max = Math.max(...data.map((data) => data.salary ?? 0));

    this.minMax.set({ min, max });
  }
}
