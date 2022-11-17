import { debounce } from '@infinite-table/infinite-react';
import * as React from 'react';
import Select, { Props as SelectProps } from 'react-select';

import {
  Developer,
  GroupByDeveloperType,
  PivotByDeveloperType,
  ReducerOptions,
} from './types';

const selectProps: SelectProps = {
  menuPosition: 'fixed',
  styles: {
    container: () => ({
      flex: 1,
    }),
    option: () => ({
      color: 'black',
    }),
  },
};

export const Settings: React.FunctionComponent<{
  groupBy: GroupByDeveloperType;
  pivotBy: PivotByDeveloperType;
  reducerKey?: ReducerOptions;
  onReducerKeyChange?: (reducerKey: ReducerOptions) => void;
  onGroupChange: (groupBy: GroupByDeveloperType) => void;
  onPivotChange: (pivotBy: PivotByDeveloperType) => void;
  onColorChange: (color: string) => void;
  onPivotEnableChange: (enabled: boolean) => void;
  pivotEnabled: boolean;
}> = ({
  groupBy,
  pivotBy,
  reducerKey,
  onGroupChange,
  onPivotChange,
  onReducerKeyChange,
  onColorChange,
  onPivotEnableChange,
  pivotEnabled,
}) => {
  const allGroupOptions: {
    value: keyof Developer;
    label: string;
  }[] = [
    { value: 'country', label: 'country' },
    { value: 'stack', label: 'stack' },
    {
      value: 'preferredLanguage',
      label: 'preferredLanguage',
    },
    { value: 'hobby', label: 'hobby' },
    { value: 'city', label: 'city' },
    { value: 'currency', label: 'currency' },
  ];

  const allPivotOptions: {
    value: keyof Developer;
    label: string;
  }[] = [
    { value: 'country', label: 'country' },
    { value: 'canDesign', label: 'canDesign' },
    { value: 'city', label: 'city' },
    {
      value: 'preferredLanguage',
      label: 'preferredLanguage',
    },
    { value: 'hobby', label: 'hobby' },
    { value: 'age', label: 'age' },
  ];

  const reducerKeyOptions = [
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'avg', label: 'Avg' },
  ];

  const groupByValue = allGroupOptions.filter((option) =>
    groupBy.some((group) => group.field === option.value),
  );

  const debouncedSetColor = React.useMemo(() => {
    return debounce(onColorChange, { wait: 300 });
  }, []);

  return (
    <div
      style={{
        zIndex: 3000,
        marginBottom: 10,
        display: 'grid',
        color: 'var(--infinite-cell-color)',
        background: 'var(--infinite-background)',
        gridTemplateColumns: '1fr 1fr',
        gridGap: 20,
        padding: 20,
      }}
    >
      <div>
        <b>Group By:</b>
        <label>
          <Select
            {...selectProps}
            value={groupByValue}
            isMulti
            isClearable
            isSearchable
            options={allGroupOptions}
            onChange={(options) => {
              onGroupChange(
                (options as typeof allGroupOptions).map((option) => ({
                  field: option.value as keyof Developer,
                })),
              );
            }}
          />
        </label>
      </div>
      <div>
        <div style={{ display: 'flex' }}>
          <b>Pivot By:</b>
          <div style={{ flex: 1 }} />
          <label>
            Enable Pivoting{' '}
            <input
              checked={Boolean(pivotEnabled)}
              type="checkbox"
              onChange={(event) => onPivotEnableChange(event.target.checked)}
            />
          </label>
        </div>
        <label>
          <Select
            {...selectProps}
            isDisabled={!pivotEnabled}
            isMulti
            isClearable
            isSearchable
            options={allPivotOptions}
            value={allPivotOptions.filter((option) =>
              pivotBy.some((pivot) => pivot.field === option.value),
            )}
            onChange={(newOptions) =>
              onPivotChange(
                (newOptions as typeof allPivotOptions).map((option) => ({
                  field: option.value as keyof Developer,
                })),
              )
            }
          />
        </label>
      </div>

      {onReducerKeyChange && (
        <div>
          <label style={{ zIndex: 3000 }}>
            <b>Select aggregation function:</b>
            <Select
              {...selectProps}
              value={reducerKeyOptions.find(
                (option) => option.value === reducerKey,
              )}
              onChange={(option) =>
                onReducerKeyChange(
                  (option as typeof reducerKeyOptions[0])
                    ?.value as ReducerOptions,
                )
              }
              options={reducerKeyOptions}
            />
          </label>
        </div>
      )}

      <div>
        <b style={{ display: 'block', marginBottom: 10 }}>
          Select `number` column type Background:
        </b>
        <input
          onChange={(event) => {
            if (event.target.value) {
              debouncedSetColor(event.target.value);
            }
          }}
          type="color"
        />
      </div>
    </div>
  );
};
