import { ContainsOperatorIcon } from '../InfiniteTable/components/icons/ContainsOperatorIcon';
import { EndsWithOperatorIcon } from '../InfiniteTable/components/icons/EndsWithOperatorIcon';
import { EqualOperatorIcon } from '../InfiniteTable/components/icons/EqualOperatorIcon';
import { GTEOperatorIcon } from '../InfiniteTable/components/icons/GTEOperatorIcon';
import { GTOperatorIcon } from '../InfiniteTable/components/icons/GTOperatorIcon';
import { LTEOperatorIcon } from '../InfiniteTable/components/icons/LTEOperatorIcon';
import { LTOperatorIcon } from '../InfiniteTable/components/icons/LTOperatorIcon';
import { NotEqualOperatorIcon } from '../InfiniteTable/components/icons/NotEqualOperatorIcon';
import { StartsWithOperatorIcon } from '../InfiniteTable/components/icons/StartsWithOperatorIcon';
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
          components: { Icon: ContainsOperatorIcon },
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
          components: { Icon: EqualOperatorIcon },
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
          components: { Icon: StartsWithOperatorIcon },
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
          components: { Icon: EndsWithOperatorIcon },
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
          components: { Icon: EqualOperatorIcon },
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
          components: { Icon: NotEqualOperatorIcon },
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
          components: { Icon: GTOperatorIcon },
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.has(currentValue) || emptyValues.has(filterValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          components: { Icon: GTEOperatorIcon },
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
          components: { Icon: LTOperatorIcon },
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
          components: { Icon: LTEOperatorIcon },
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
