// Code shown on the Angular version of index.page.md: the sibling of
// index.filtertypes.snippet.tsx, with the same `#region` name. Type-checked by
// `npm run tsc:angular`.
import {
  EndsWithOperatorIcon,
  EqualOperatorIcon,
  GTEOperatorIcon,
  GTOperatorIcon,
  IncludesOperatorIcon,
  LTEOperatorIcon,
  LTOperatorIcon,
  NotEqualOperatorIcon,
  NumberFilterEditor,
  renderComponent,
  StartsWithOperatorIcon,
  StringFilterEditor,
} from '@infinite-table/infinite-angular';
import type { DataSourceFilterType } from '@infinite-table/infinite-angular';

// the default filter types are the same for any type of rows
type T = unknown;

//#region filtertypes
export const defaultFilterTypes: Record<string, DataSourceFilterType<T>> = {
  string: {
    label: 'Text',
    emptyValues: [''],
    defaultOperator: 'includes',
    components: {
      FilterEditor: () => renderComponent(StringFilterEditor),
    },
    operators: [
      {
        name: 'includes',
        components: {
          // custom icon as an Angular component ...
          Icon: () => renderComponent(IncludesOperatorIcon),
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
          // custom icon as an Angular component ...
          Icon: () => renderComponent(EqualOperatorIcon),
        },
        name: 'eq',
        fn: ({ currentValue: value, filterValue }) => {
          return typeof value === 'string' && value === filterValue;
        },
      },
      {
        name: 'startsWith',
        components: {
          // custom icon as an Angular component ...
          Icon: () => renderComponent(StartsWithOperatorIcon),
        },
        label: 'Starts With',
        fn: ({ currentValue: value, filterValue }) => {
          return value.startsWith(filterValue);
        },
      },
      {
        name: 'endsWith',
        components: {
          // custom icon as an Angular component ...
          Icon: () => renderComponent(EndsWithOperatorIcon),
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
      FilterEditor: () => renderComponent(NumberFilterEditor),
    },
    operators: [
      {
        label: 'Equals',
        components: {
          // custom icon as an Angular component ...
          Icon: () => renderComponent(EqualOperatorIcon),
        },
        name: 'eq',
        fn: ({ currentValue, filterValue }) => {
          return currentValue == filterValue;
        },
      },
      {
        label: 'Not Equals',
        components: {
          // custom icon as an Angular component ...
          Icon: () => renderComponent(NotEqualOperatorIcon),
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
          // custom icon as an Angular component ...
          Icon: () => renderComponent(GTOperatorIcon),
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
          // custom icon as an Angular component ...
          Icon: () => renderComponent(GTEOperatorIcon),
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
          // custom icon as an Angular component ...
          Icon: () => renderComponent(LTOperatorIcon),
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
          // custom icon as an Angular component ...
          Icon: () => renderComponent(LTEOperatorIcon),
        },
        label: 'Less Than or Equal',
        fn: ({ currentValue, filterValue, emptyValues }) => {
          if (emptyValues.includes(currentValue)) {
            return true;
          }
          return currentValue <= filterValue;
        },
      },
    ],
  },
};
//#endregion
