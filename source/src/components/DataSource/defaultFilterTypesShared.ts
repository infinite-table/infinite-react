import { DataSourceFilterType } from './types';
import { Renderable } from '../types/Renderable';

/**
 * Framework-neutral default filter types (string/number): the filter
 * functions and operator metadata live here; the framework-specific editors
 * and operator icons are injected by the per-framework siblings
 * (defaultFilterTypes.ts for React, defaultFilterTypes.vue.ts for Vue).
 */
export type DefaultFilterTypesComponents = {
  StringFilterEditor?: () => Renderable;
  NumberFilterEditor?: () => Renderable;
  icons?: Partial<
    Record<
      | 'includes'
      | 'eq'
      | 'neq'
      | 'startsWith'
      | 'endsWith'
      | 'gt'
      | 'gte'
      | 'lt'
      | 'lte',
      (props: any) => Renderable
    >
  >;
};

const iconComponents = (
  icons: DefaultFilterTypesComponents['icons'],
  name: keyof NonNullable<DefaultFilterTypesComponents['icons']>,
) => {
  const Icon = icons?.[name];
  return Icon ? { components: { Icon } } : {};
};

export function getDefaultFilterTypes<T>(
  components: DefaultFilterTypesComponents = {},
): Record<string, DataSourceFilterType<T>> {
  const { StringFilterEditor, NumberFilterEditor, icons } = components;

  return {
    string: {
      label: 'Text',
      emptyValues: [''],
      defaultOperator: 'includes',
      components: StringFilterEditor
        ? { FilterEditor: StringFilterEditor }
        : undefined,
      operators: [
        {
          name: 'includes',
          ...iconComponents(icons, 'includes'),
          label: 'Includes',
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
          ...iconComponents(icons, 'eq'),
          name: 'eq',
          fn: ({ currentValue: value, filterValue }) => {
            return typeof value === 'string' && value === filterValue;
          },
        },
        {
          name: 'startsWith',
          ...iconComponents(icons, 'startsWith'),
          label: 'Starts With',
          fn: ({ currentValue: value, filterValue }) => {
            return value.startsWith(filterValue);
          },
        },
        {
          name: 'endsWith',
          ...iconComponents(icons, 'endsWith'),
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
      components: NumberFilterEditor
        ? { FilterEditor: NumberFilterEditor }
        : undefined,
      operators: [
        {
          label: 'Equals',
          ...iconComponents(icons, 'eq'),
          name: 'eq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue == filterValue;
          },
        },
        {
          label: 'Not Equals',
          ...iconComponents(icons, 'neq'),
          name: 'neq',
          fn: ({ currentValue, filterValue }) => {
            return currentValue != filterValue;
          },
        },
        {
          name: 'gt',
          label: 'Greater Than',
          ...iconComponents(icons, 'gt'),
          fn: ({ currentValue, filterValue, emptyValues }) => {
            if (emptyValues.includes(currentValue)) {
              return true;
            }
            return currentValue > filterValue;
          },
        },
        {
          name: 'gte',
          ...iconComponents(icons, 'gte'),
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
          ...iconComponents(icons, 'lt'),
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
          ...iconComponents(icons, 'lte'),
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
}
