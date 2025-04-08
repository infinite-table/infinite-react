import {
  DataSource,
  InfiniteTable,
  type DevToolsHostPageMessagePayload,
  type DevToolsDataSourceOverrides,
  type DevToolsInfiniteOverrides,
  type DevToolsOverrides,
  type InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  useSidebar,
} from './ui/sidebar';
import {
  APIManagerContext,
  useAPIManagerContext,
} from '../lib/APIManagerContext';

import { HighlightButton } from './HighlightButton';
import { RevertButton } from './RevertButton';
import { DevToolsSidebarSection } from './DevToolsSidebarSection';

import { Checkbox } from './ui/checkbox';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';
import { useCallback, useEffect, useState } from 'react';
import { Trash } from 'lucide-react';
import { ConnectStatus } from './ConnectStatus';
import { Combobox } from './ui/combobox';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { lowerCaseFirstLetter } from '../lib/utils';
import { notNullable } from '../lib/utilityTypes';

//@ts-ignore
const LICENSE_KEY = process.env.INFINITE_TABLE_LICENSE_KEY;

type MainPanelProps = {
  instances: DevToolsHostPageMessagePayload[];
  onActiveDebugIdChange: (debugId: string | null) => void;
};

function MainPanel(props: MainPanelProps) {
  const { instances, onActiveDebugIdChange } = props;

  useEffect(() => {
    return () => {
      console.log('unmount');
    };
  }, []);

  return (
    <div className="flex flex-1">
      <DataSource<any>
        data={instances}
        primaryKey="debugId"
        selectionMode="single-row"
        onRowSelectionChange={(row) => {
          onActiveDebugIdChange(row == null ? null : `${row}`);
        }}
      >
        <InfiniteTable
          rowHeight={30}
          domProps={{
            className: 'flex-1',
          }}
          licenseKey={LICENSE_KEY}
          keyboardNavigation="row"
          columns={{
            highlight: {
              field: 'highlight',
              header: 'Actions',
              defaultWidth: 70,
              resizable: false,
              renderMenuIcon: false,
              defaultSortable: false,

              render: ({ data }) => {
                return data?.debugId ? (
                  <HighlightButton debugId={data.debugId} />
                ) : null;
              },
            },
            debugId: {
              field: 'debugId',
              header: 'Debug ID',
              renderSelectionCheckBox: true,
              defaultWidth: 120,
            },
            visibleColumns: {
              field: 'visibleColumnIds',
              defaultFlex: 1,
              header: 'Visible Columns',
              renderValue: ({ value }: { value: string[] }) => {
                return Array.isArray(value) ? value.join(', ') : `${value}`;
              },
            },
            columnOrder: {
              defaultFlex: 1,
              field: 'columnOrder',
              header: 'Column Order',
              renderValue: ({ value }: { value: string[] }) => {
                return Array.isArray(value) ? value.join(', ') : `${value}`;
              },
            },
            selectionMode: {
              header: 'Selection Mode',
              field: 'selectionMode',
            },
          }}
        />
      </DataSource>
    </div>
  );
}

function PanelSide() {
  const { open } = useSidebar();
  const { currentInstance } = useDevToolsMessagingContext();
  return (
    <>
      <Sidebar
        side="right"
        variant="sidebar"
        collapsible="offcanvas"
        className=" flex-1 h-auto"
      >
        <SidebarContent>
          {open && currentInstance ? <MainPanelSidebar /> : null}
        </SidebarContent>
      </Sidebar>
    </>
  );
}

function MainPanelSidebar() {
  const {
    setColumnVisibility,
    setGroupBy,
    setGroupRenderStrategy,
    revertAll,
    overridenProperties,
  } = useAPIManagerContext();
  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const visibleColumns = currentInstance.visibleColumnIds;
  const allColumns = currentInstance.columnOrder;
  const columnVisibility = currentInstance.columnVisibility;

  const visibleColumnsSet = new Set(
    allColumns.filter((id) => visibleColumns.includes(id)),
  );

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
      const value = `${column.field}`;

      if (uniqueFields.has(value)) {
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
    <div className="flex flex-col gap-2 p-2">
      <div className="text-base text-foreground flex justify-between">
        <div className="flex items-center gap-2">
          Instance "{currentInstance.debugId}" <ConnectStatus />
        </div>
        <div className="flex items-center gap-2">
          {overridenProperties.size !== 0 ? (
            <RevertButton
              absolute={false}
              onClick={() => {
                revertAll();
              }}
            />
          ) : null}

          <HighlightButton debugId={currentInstance.debugId}>
            <span className="text-xs">Highlight</span>
          </HighlightButton>
        </div>
      </div>
      <hr className="border-border" />

      <div className="text-sm text-muted-foreground rounded-md flex flex-col gap-2">
        <DevToolsSidebarSection
          name={
            <div className="flex items-center gap-2">
              Visible Columns
              <Button
                variant="outline"
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
                variant="outline"
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
                <div
                  key={id}
                  className="flex items-center gap-2 cursor-pointer"
                >
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

        <DevToolsSidebarSection name="Debug Timings">
          <ul className="flex flex-col gap-2">
            <li>Last sort: {currentInstance.debugTimings.sort || 0}ms</li>
            <li>Last filter: {currentInstance.debugTimings.filter || 0}ms</li>
            <li>
              Last group/pivot:{' '}
              {currentInstance.debugTimings['group-and-pivot'] || 0}ms
            </li>
            <li>Last tree: {currentInstance.debugTimings.tree || 0}ms</li>
          </ul>
        </DevToolsSidebarSection>

        <DevToolsSidebarSection
          overridesProperties={['groupBy', 'groupRenderStrategy']}
          name={
            <>
              <div className="flex items-center gap-2">
                Group By
                {hasFnForGroupBy || true ? (
                  <span className="text-xs text-muted-foreground">
                    {` (readonly)`}
                  </span>
                ) : null}
                <Button
                  disabled={currentGroupBy.size === 0}
                  variant="outline"
                  onClick={() => {
                    setGroupBy([]);
                  }}
                >
                  <Trash className="h-4 w-4" />
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
                  options={[
                    { value: groupBy, label: groupBy },
                    ...groupByOptions,
                  ]}
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
      </div>
    </div>
  );
}

function PanelRoot() {
  const { setOpen } = useSidebar();
  const { instances, setActiveDebugId } = useDevToolsMessagingContext();

  return (
    <div className="flex flex-1 bg-background transform-[translate3d(0,0,0)]">
      <main className="flex-1 flex">
        <MainPanel
          instances={Object.values(instances)}
          onActiveDebugIdChange={(debugId) => {
            setActiveDebugId(debugId);
            setOpen(debugId != null);
          }}
        />
      </main>
      <PanelSide />
    </div>
  );
}

export default function () {
  const { activeDebugId, sendMessageToContentScript } =
    useDevToolsMessagingContext();
  const [renderKey, setRenderKey] = useState(0);
  const rerender = useCallback(() => {
    setRenderKey((prev) => prev + 1);
  }, []);

  const [overridenProperties] = useState<Set<keyof DevToolsOverrides>>(() => {
    return new Set();
  });

  const sendMessage = useCallback(
    (
      type:
        | string
        | {
            type: string;
            property: keyof DevToolsOverrides;
          },
      payload: any,
    ) => {
      const theType = typeof type === 'string' ? type : type.type;
      const property =
        typeof type === 'string'
          ? lowerCaseFirstLetter(type.substring(3))
          : type.property;

      sendMessageToContentScript(theType, {
        ...payload,
        debugId: activeDebugId,
        property,
      });

      if (theType === 'revertProperty' || theType === 'revertAll') {
        return;
      }
      overridenProperties.add(property as keyof DevToolsOverrides);
      rerender();
    },
    [activeDebugId, sendMessageToContentScript],
  );

  const revertProperty = useCallback(
    (property: keyof DevToolsOverrides) => {
      overridenProperties.delete(property);
      sendMessage(
        { type: 'revertProperty', property },
        {
          property,
          debugId: activeDebugId,
        },
      );
      rerender();
    },
    [activeDebugId, sendMessage],
  );

  const revertAll = useCallback(() => {
    overridenProperties.clear();
    sendMessage('revertAll', {
      debugId: activeDebugId,
    });
    rerender();
  }, [activeDebugId, sendMessage]);

  const setColumnVisibility = useCallback(
    (columnVisibility: InfiniteTablePropColumnVisibility) => {
      sendMessage('setColumnVisibility', {
        columnVisibility,
        debugId: activeDebugId,
      });
    },
    [activeDebugId, sendMessage],
  );

  const setGroupBy = useCallback(
    (groupBy: { field: string }[]) => {
      sendMessage('setGroupBy', {
        groupBy,
        debugId: activeDebugId,
      });
    },
    [activeDebugId, sendMessage],
  );

  const setGroupRenderStrategy = useCallback(
    (groupRenderStrategy: string) => {
      sendMessage('setGroupRenderStrategy', {
        groupRenderStrategy,
        debugId: activeDebugId,
      });
    },
    [activeDebugId, sendMessage],
  );

  return (
    <APIManagerContext.Provider
      value={{
        setColumnVisibility,
        setGroupBy,
        setGroupRenderStrategy,
        revertProperty,
        revertAll,
        rerender,
        overridenProperties,
      }}
    >
      <SidebarProvider
        defaultOpen={false}
        style={{
          fontSize: 12,
          //@ts-ignore
          '--sidebar-width': '50vw',
          '--sidebar-width-mobile': '80vw',
        }}
      >
        <PanelRoot />
      </SidebarProvider>
    </APIManagerContext.Provider>
  );
}
