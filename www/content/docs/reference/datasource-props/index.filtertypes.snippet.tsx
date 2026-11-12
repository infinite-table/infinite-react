// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSourceFilterType,
} from '@infinite-table/infinite-react';

//#region filtertypes
export const defaultFilterTypes: Record<string, DataSourceFilterType<T>> = {
    string: {
      label: 'Text',
      emptyValues: [''],
      defaultOperator: 'includes',
      components: {
        FilterEditor: StringFilterEditor,
      },
      operators: [
        {
          name: 'includes',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'includes',
          fn: ({ currentValue, filterValue }) => {
            return (
              typeof currentValue === 'string' &&
              typeof filterValue == 'string' &&
              currentValue.toLowerCase().includes(filterValue.toLowerCase())
            );
          },
        },
        {
          label: 'Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue: value, filterValue }) => {
            return typeof value === 'string' && value === filterValue;
          },
        },
        {
          name: 'startsWith',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Starts With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.startsWith(filterValue);
          },
        },
        {
          name: 'endsWith',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Ends With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.endsWith(filterValue);
          },
        },
      ],
    },
    number: {
      label: 'Number',
      emptyValues: ['', null, undefined],
      defaultOperator: 'eq',
      components: {
        FilterEditor: NumberFilterEditor,
      },
      operators: [
        {
          label: 'Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue == filterValue;
          },
        },
        {
          label: 'Not Equals',
          components: {
            Icon: // custom icon as a React component ...
          },
          name: 'neq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue != filterValue;
          },
        },
        {
          name: 'gt',
          label: 'Greater Than',
          components: {
            Icon: // custom icon as a React component ...
          },
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Greater Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue >= filterValue;
          },
        },
        {
          name: 'lt',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Less Than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue < filterValue;
          },
        },
        {
          name: 'lte',
          components: {
            Icon: // custom icon as a React component ...
          },
          label: 'Less Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue <= filterValue;
          },
        }
      ],
    },
  };
//#endregion
