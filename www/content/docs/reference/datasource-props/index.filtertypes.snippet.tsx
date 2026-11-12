// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  components,
  type DataSourceFilterOperator,
  type DataSourceFilterType,
} from '@infinite-table/infinite-react';

// the default filter types are the same for any type of rows
type T = unknown;

const { StringFilterEditor, NumberFilterEditor } = components;

// the operator icons are internal components of the library
type OperatorIcon = NonNullable<
  NonNullable<DataSourceFilterOperator<T>['components']>['Icon']
>;
declare const IncludesOperatorIcon: OperatorIcon;
declare const EqualOperatorIcon: OperatorIcon;
declare const NotEqualOperatorIcon: OperatorIcon;
declare const StartsWithOperatorIcon: OperatorIcon;
declare const EndsWithOperatorIcon: OperatorIcon;
declare const GTOperatorIcon: OperatorIcon;
declare const GTEOperatorIcon: OperatorIcon;
declare const LTOperatorIcon: OperatorIcon;
declare const LTEOperatorIcon: OperatorIcon;

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
            Icon: IncludesOperatorIcon, // custom icon as a React component ...
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
            Icon: EqualOperatorIcon, // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue: value, filterValue }) => {
            return typeof value === 'string' && value === filterValue;
          },
        },
        {
          name: 'startsWith',
          components: {
            Icon: StartsWithOperatorIcon, // custom icon as a React component ...
          },
          label: 'Starts With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.startsWith(filterValue);
          },
        },
        {
          name: 'endsWith',
          components: {
            Icon: EndsWithOperatorIcon, // custom icon as a React component ...
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
            Icon: EqualOperatorIcon, // custom icon as a React component ...
          },
          name: 'eq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue == filterValue;
          },
        },
        {
          label: 'Not Equals',
          components: {
            Icon: NotEqualOperatorIcon, // custom icon as a React component ...
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
            Icon: GTOperatorIcon, // custom icon as a React component ...
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
            Icon: GTEOperatorIcon, // custom icon as a React component ...
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
            Icon: LTOperatorIcon, // custom icon as a React component ...
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
            Icon: LTEOperatorIcon, // custom icon as a React component ...
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
