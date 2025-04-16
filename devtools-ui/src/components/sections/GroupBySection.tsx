import { Trash, X } from 'lucide-react';
import { useAPIManagerContext } from '../../lib/APIManagerContext';
import { useDevToolsMessagingContext } from '../../lib/DevToolsMessagingContext';
import { notNullable } from '../../lib/utilityTypes';
import { DevToolsSidebarSection } from '../DevToolsSidebarSection';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function GroupBySection() {
  const { setGroupBy, setGroupRenderStrategy, warnings } =
    useAPIManagerContext();

  const unreadWarnings = Object.values(warnings || {})
    .filter((warning) => warning!.status === 'new')
    .filter(notNullable);

  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const currentGroupBy = new Set(currentInstance.groupBy);

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

  const groupByOptions = fieldOptions.filter(
    (option) => !currentGroupBy.has(option.value),
  );

  return (
    <DevToolsSidebarSection
      overridesProperties={['groupBy', 'groupRenderStrategy']}
      name={
        <>
          <div className="flex items-center gap-2">
            Group By
            {hasFnForGroupBy ? (
              <span className="text-xs text-muted-foreground">
                {` (readonly)`}
              </span>
            ) : null}
            <div className="flex-1"></div>
            <Button
              disabled={currentGroupBy.size === 0}
              variant="outline"
              onClick={() => {
                setGroupBy([]);
              }}
            >
              <Trash className="h-4 w-4" />
              Clear all grouping
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-row items-center gap-2">
        <span>Group Render Strategy</span>
        <Select
          value={currentInstance.groupRenderStrategy}
          onValueChange={(value) => {
            console.log('value', value);
            setGroupRenderStrategy(value);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder=" Render Strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single-column">Single Column</SelectItem>
            <SelectItem value="multi-column">Multi Column</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        {currentInstance.groupBy.map((groupBy: string, index: number) => (
          <div key={groupBy} className="flex items-center gap-2 w-full">
            <Combobox
              className="flex-1"
              options={[{ value: groupBy, label: groupBy }, ...groupByOptions]}
              value={groupBy}
              onValueChange={(value) => {
                const newGroupBy = [...currentInstance.groupBy];
                newGroupBy[index] = value;
                setGroupBy(newGroupBy.map((field) => ({ field })));
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const newGroupBy = [...currentInstance.groupBy];
                newGroupBy.splice(index, 1);
                setGroupBy(newGroupBy.map((field) => ({ field })));
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Combobox
            className="flex-1"
            options={groupByOptions}
            value=""
            placeholder="Add group field..."
            onValueChange={(value) => {
              if (value) {
                const newGroupBy = [...currentInstance.groupBy, value];
                setGroupBy(newGroupBy.map((field) => ({ field })));
              }
            }}
          />
        </div>
      </div>
    </DevToolsSidebarSection>
  );
}
