import { ArrowDown, ArrowUp, Trash, X } from 'lucide-react';
import { useAPIManagerContext } from '../../lib/APIManagerContext';
import { useDevToolsMessagingContext } from '../../lib/DevToolsMessagingContext';
import { notNullable } from '../../lib/utilityTypes';
import { DevToolsSidebarSection } from '../DevToolsSidebarSection';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';

import { Checkbox } from '../ui/checkbox';
import { cn } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function SortInfoSection() {
  const { setSortInfo, warnings, setMultiSort } = useAPIManagerContext();

  const unreadWarnings = Object.values(warnings || {})
    .filter((warning) => warning!.status === 'new')
    .filter(notNullable);

  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const visibleColumns = currentInstance.visibleColumnIds;
  const allColumns = currentInstance.columnOrder;

  const currentSortedFields = new Set(
    (currentInstance.sortInfo || []).map((s) => s.field),
  );

  let hasFnForGroupBy = false;
  const uniqueFields = new Set();
  const fieldOptions: { value: string; label: string }[] = Object.keys(
    currentInstance.columns,
  )
    .filter((key) => {
      const column = currentInstance.columns[key];

      if (column.field === '<fn>') {
        hasFnForGroupBy = true;
      }
      return typeof column.field === 'string' && column.field != '<fn>';
    })
    .map((key) => {
      const column = currentInstance.columns[key];
      const value = column.field ? `${column.field}` : null;

      if (!value || uniqueFields.has(value)) {
        return null;
      }
      uniqueFields.add(value);

      return {
        value,
        label: value,
      };
    })
    .filter(notNullable);

  const sortInfoOptions = fieldOptions.filter(
    (option) => !currentSortedFields.has(option.value),
  );

  return (
    <DevToolsSidebarSection
      overridesProperties={['sortInfo', 'multiSort']}
      name={
        <>
          <div className="flex items-center gap-2">
            Sort Info
            <div className="flex-1"></div>
            <Button
              disabled={currentSortedFields.size === 0}
              variant="outline"
              onClick={() => {
                setSortInfo([]);
              }}
            >
              <Trash className="h-4 w-4" />
              Clear sorting
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-row items-center gap-2">
        <span>Allow multiple sorting</span>
        <Checkbox
          checked={currentInstance.multiSort}
          onCheckedChange={(value) => {
            const multiSort = !!value;
            setMultiSort(multiSort);

            if (currentInstance.sortInfo?.length > 1 && !multiSort) {
              setSortInfo([currentInstance.sortInfo[0]]);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {(currentInstance.sortInfo || []).map((sortInfo, index) => (
          <div
            key={`${sortInfo.field}` || index}
            className="flex items-center gap-2 w-full"
          >
            <Combobox
              className="flex-1"
              options={[
                { value: sortInfo.field!, label: sortInfo.field! },
                ...sortInfoOptions,
              ]}
              value={sortInfo.field!}
              onValueChange={(value) => {
                const currentSortInfo = currentInstance.sortInfo || [];
                const newSortInfo = [...currentSortInfo];
                newSortInfo[index] = {
                  ...newSortInfo[index],
                  field: value,
                  dir: 1,
                };
                setSortInfo(newSortInfo);
              }}
            />{' '}
            <Select
              value={sortInfo.type ?? 'string'}
              onValueChange={(value) => {
                const currentSortInfo = currentInstance.sortInfo || [];
                const newSortInfo = [...currentSortInfo];
                newSortInfo[index] = {
                  ...newSortInfo[index],
                  type: value,
                };
                setSortInfo(newSortInfo);
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">Sort type: string</SelectItem>
                <SelectItem value="number">Sort type: number</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentSortInfo = currentInstance.sortInfo || [];
                const newSortInfo = [...currentSortInfo];
                newSortInfo[index] = {
                  ...newSortInfo[index],
                  field: sortInfo.field!,
                  dir: sortInfo.dir === 1 ? -1 : 1,
                };
                setSortInfo(newSortInfo);
              }}
            >
              Sort dir {sortInfo.dir === 1 ? <ArrowUp /> : <ArrowDown />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const currentSortInfo = currentInstance.sortInfo || [];

                const newSortInfo = [...currentSortInfo];
                newSortInfo.splice(index, 1);
                setSortInfo(newSortInfo);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div
          className={cn(
            'flex items-center gap-2',
            !currentInstance.multiSort && currentInstance.sortInfo?.length >= 1
              ? 'hidden'
              : 'block',
          )}
        >
          <Combobox
            className="flex-1"
            options={sortInfoOptions}
            value=""
            placeholder="Add sort field..."
            onValueChange={(value) => {
              if (value) {
                const newSortInfo = [
                  ...(currentInstance.sortInfo || []),
                  { field: value, dir: 1 as 1 | -1 },
                ];
                setSortInfo(newSortInfo);
              }
            }}
          />
        </div>
      </div>
    </DevToolsSidebarSection>
  );
}
