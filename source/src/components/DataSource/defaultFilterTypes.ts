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
          name: 'eq',
          fn: ({ currentValue: value, filterValue, emptyValues }) => {
            if (emptyValues.has(value) || emptyValues.has(filterValue)) {
              return true;
            }
            return typeof value === 'string' && value === filterValue;
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
          name: 'eq',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue == filterValue;
          },
        },
        {
          name: 'between',
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            const [min, max] = filterValue;
            return currentValue >= min && currentValue <= max;
          },
        },
      ],
    },
  };

  return result;
}
export const defaultFilterTypes = getFilterTypes<any>();
