import { useAPIManagerContext } from '../../lib/APIManagerContext';
import { useDevToolsMessagingContext } from '../../lib/DevToolsMessagingContext';
import { DevToolsSidebarSection } from '../DevToolsSidebarSection';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

export function ColumnVisibilitySection() {
  const { setColumnVisibility } = useAPIManagerContext();
  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const visibleColumns = currentInstance.visibleColumnIds;
  const allColumns = currentInstance.columnOrder;
  const columnVisibility = currentInstance.columnVisibility;

  const visibleColumnsSet = new Set(
    allColumns.filter((id) => visibleColumns.includes(id)),
  );

  return (
    <DevToolsSidebarSection
      name={
        <div className="flex items-center gap-2">
          Visible Columns
          <Button
            variant="ghost"
            disabled={visibleColumnsSet.size === 0}
            onClick={() => {
              setColumnVisibility({
                ...Object.fromEntries(allColumns.map((id) => [id, false])),
              });
            }}
          >
            Hide All
          </Button>
          <Button
            variant="ghost"
            disabled={visibleColumnsSet.size === allColumns.length}
            onClick={() => {
              setColumnVisibility({});
            }}
          >
            Show All
          </Button>
        </div>
      }
      overridesProperties={['columnVisibility']}
    >
      <div className="flex flex-wrap flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {allColumns.map((id) => (
            <div key={id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                id={`col-${id}`}
                checked={visibleColumnsSet.has(id)}
                onCheckedChange={(checked) => {
                  const newColumnVisibility = {
                    ...columnVisibility,
                  };
                  if (checked) {
                    delete newColumnVisibility[id];
                  } else {
                    newColumnVisibility[id] = false;
                  }
                  setColumnVisibility(newColumnVisibility);
                }}
              />
              <label htmlFor={`col-${id}`} className="text-xs">
                {id}
              </label>
            </div>
          ))}
        </div>
      </div>
    </DevToolsSidebarSection>
  );
}
