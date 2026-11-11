import type { CompareCopy } from '../types';
import { agGridCopy } from './ag-grid';
import { devexpressCopy } from './devexpress';
import { glideCopy } from './glide-data-grid';
import { handsontableCopy } from './handsontable';
import { kendoReactCopy } from './kendoreact';
import { mantineReactTableCopy } from './mantine-react-table';
import { materialReactTableCopy } from './material-react-table';
import { muiXDataGridCopy } from './mui-x-data-grid';
import { reactDataGridCopy } from './react-data-grid';
import { revogridCopy } from './revogrid';
import { syncfusionCopy } from './syncfusion';
import { tanstackTableCopy } from './tanstack-table';
import { wijmoCopy } from './wijmo';

/** the editorial copy of each /compare/<id> page, by product id */
export const COPY: Record<string, CompareCopy> = Object.fromEntries(
  [
    agGridCopy,
    muiXDataGridCopy,
    tanstackTableCopy,
    handsontableCopy,
    devexpressCopy,
    syncfusionCopy,
    kendoReactCopy,
    glideCopy,
    reactDataGridCopy,
    materialReactTableCopy,
    mantineReactTableCopy,
    revogridCopy,
    wijmoCopy,
  ].map((copy) => [copy.id, copy]),
);
