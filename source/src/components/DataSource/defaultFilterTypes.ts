import { DataSourceFilterType } from './types';

function getFilterTypes<T>() {
  const result: Record<string, DataSourceFilterType<T>> = {
    string: {
      label: 'Text',
      emptyValues: new Set(['']),
      defaultOperator: 'contains',
      operators: [
        {
          name: 'contains',
          label: 'Contains',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return (
              typeof currentValue === 'string' &&
              typeof filterValue == 'string' &&
              currentValue.toLowerCase().includes(filterValue.toLowerCase())
            );
          },
        },
        {
          label: 'Equals',
          name: 'eq',
          fn: ({ currentValue: value, filterValue, emptyValues }) => {
            if (emptyValues.has(value) || emptyValues.has(filterValue)) {
              return true;
            }
            return typeof value === 'string' && value === filterValue;
          },
        },
        {
          name: 'startsWith',
          label: 'Starts With',
          fn: ({ currentValue: value, filterValue, emptyValues }) => {
            if (emptyValues.has(value) || emptyValues.has(filterValue)) {
              return true;
            }
            return value.startsWith(filterValue);
          },
        },
        {
          name: 'endsWith',
          label: 'Ends With',
          fn: ({ currentValue: value, filterValue, emptyValues }) => {
            if (emptyValues.has(value) || emptyValues.has(filterValue)) {
              return true;
            }
            return value.endsWith(filterValue);
          },
        },
      ],
    },
    number: {
      label: 'Number',
      emptyValues: new Set(['', null, undefined]),
      defaultOperator: 'eq',
      operators: [
        {
          label: 'Equals',
          name: 'eq',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue == filterValue;
          },
        },
        {
          label: 'Not Equals',
          name: 'neq',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue != filterValue;
          },
        },
        {
          name: 'gt',
          label: 'Greater Than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          label: 'Greater Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue >= filterValue;
          },
        },
        {
          name: 'lt',
          label: 'Less Than',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue < filterValue;
          },
        },
        {
          name: 'lte',
          label: 'Less Than or Equal',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue <= filterValue;
          },
        },
        // {
        //   name: 'between',
        //   fn: ({ currentValue, filterValue, emptyValues }) => {
        //     if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
        //       return true;
        //     }
        //     const [min, max] = filterValue;
        //     return currentValue >= min && currentValue <= max;
        //   },
        // },
      ],
    },
  };

  return result;
}
export const defaultFilterTypes = getFilterTypes<any>();
