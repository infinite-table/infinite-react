/**
 * The pivot demo of the Angular home page (/angular): the Angular port of
 * src/components/home/demos/PivotDemo.tsx, with the same card and data. The
 * home page shows this page in an iframe (FrameDemo.tsx), as tall as the code
 * next to it.
 */
import '@infinite-table/infinite-angular/index.css';
import '@infinite-table/infinite-angular/theme/terminal.css';

import './home-demo/page.css';

import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  viewChild,
} from '@angular/core';
import {
  DataSource,
  InfiniteTable,
  renderTemplate,
  type DataSourcePropAggregationReducers,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
} from '@infinite-table/infinite-angular';

import {
  type Trade,
  formatMoney,
  makeTrades,
} from '../../src/components/home/demos/data';
import { themeClassName } from '../../src/components/home/demos/theme';
import { injectSiteMode } from './angular-home/frame.angular';

const sum = (acc: number, value: number) => acc + value;
const reducers: DataSourcePropAggregationReducers<Trade> = {
  pnl: {
    field: 'pnl',
    initialValue: 0,
    reducer: sum,
    name: 'P&L',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
  notional: {
    field: 'notional',
    initialValue: 0,
    reducer: sum,
    name: 'Notional',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
};

const groupColumn: InfiniteTablePropGroupColumn<Trade> = {
  header: 'Sector',
  defaultWidth: 170,
};

type PnlCell = { up: boolean; text: string };

@Component({
  selector: 'demo-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataSource, InfiniteTable],
  template: `
    <div class="home home-demo home-demo--pivot home-demo--fill">
      <div class="home-demo__card">
        <div
          class="home-demo__grid home-grid--site"
          [class]="gridClassName()"
        >
          <!-- the same bindings as the code next to the demo (AngularHomePage.tsx) -->
          <infinite-data-source
            #ds="infiniteDataSource"
            [data]="data"
            primaryKey="id"
            [groupBy]="[{ field: 'sector' }]"
            [pivotBy]="[{ field: 'region' }]"
            [aggregationReducers]="reducers"
          >
            <infinite-table
              [columns]="columns"
              [pivotColumns]="ds.pivotColumns()"
              [pivotColumnGroups]="ds.pivotColumnGroups()"
              pivotTotalColumnPosition="end"
              [domProps]="domProps"
              [columnDefaultWidth]="128"
              [groupColumn]="groupColumn"
            />
          </infinite-data-source>
        </div>
      </div>
    </div>

    <ng-template #pnlCell let-up="up" let-text="text">
      <span [class]="up ? 'home-up' : 'home-down'">{{ text }}</span>
    </ng-template>
  `,
})
export default class Pivot {
  private readonly pnlCell =
    viewChild.required<TemplateRef<PnlCell>>('pnlCell');

  protected readonly data = makeTrades(20_000);
  protected readonly reducers = reducers;
  protected readonly groupColumn = groupColumn;
  protected readonly domProps = { style: { height: '100%' } };

  // the generated pivot columns take their rendering from these
  protected readonly columns: InfiniteTablePropColumns<Trade> = {
    sector: { field: 'sector', header: 'Sector' },
    region: { field: 'region', header: 'Region' },
    pnl: {
      field: 'pnl',
      header: 'P&L',
      type: 'number',
      align: 'end',
      renderValue: ({ value }) =>
        value == null
          ? null
          : renderTemplate(this.pnlCell(), {
              up: value >= 0,
              text: formatMoney(value),
            }),
    },
    notional: {
      field: 'notional',
      header: 'Notional',
      type: 'number',
      align: 'end',
      renderValue: ({ value }) => (value == null ? null : formatMoney(value)),
    },
  };

  private readonly mode = injectSiteMode();
  protected readonly gridClassName = computed(() =>
    themeClassName('terminal', this.mode()),
  );
}
