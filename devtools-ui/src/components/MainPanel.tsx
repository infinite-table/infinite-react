import {
  DataSource,
  InfiniteTable,
  DevToolsHostPageMessagePayload,
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
import { DevToolsSidebarSection } from './DevToolsSidebarSection';

import { Checkbox } from './ui/checkbox';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';
import { useCallback, useEffect } from 'react';
import { PlugIcon } from 'lucide-react';
import { ConnectStatus } from './ConnectStatus';

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
  const { setColumnVisibility } = useAPIManagerContext();
  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const visibleColumns = currentInstance.visibleColumnIds;
  const allColumns = currentInstance.columnOrder;

  const visibleColumnsSet = new Set(
    allColumns.filter((id) => visibleColumns.includes(id)),
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-base text-foreground flex justify-between">
        <div className="flex items-center gap-2">
          Instance "{currentInstance.debugId}" <ConnectStatus />
        </div>
        <HighlightButton debugId={currentInstance.debugId}>
          <span className="text-xs">Highlight</span>
        </HighlightButton>
      </div>
      <hr className="border-border" />

      <div className="text-sm text-muted-foreground rounded-md flex flex-col gap-2">
        <DevToolsSidebarSection name="Visible Columns">
          <div className="flex flex-wrap gap-2">
            {allColumns.map((id) => (
              <div key={id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id={`col-${id}`}
                  checked={visibleColumnsSet.has(id)}
                  onCheckedChange={(checked) => {
                    setColumnVisibility(id, checked === true);
                  }}
                />
                <label htmlFor={`col-${id}`} className="text-xs">
                  {id}
                </label>
              </div>
            ))}
          </div>
        </DevToolsSidebarSection>

        <DevToolsSidebarSection name="Debug Timings">
          <ul className="flex flex-col gap-2">
            <li>Last sort: {currentInstance.debugTimings.sort || 0}ms</li>
            <li>Last filter: {currentInstance.debugTimings.filter || 0}ms</li>
          </ul>
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

  const setColumnVisibility = useCallback(
    (columnId: string, visible: boolean) => {
      sendMessageToContentScript('setColumnVisibility', {
        columnId,
        visible,
        debugId: activeDebugId,
      });
    },
    [activeDebugId, sendMessageToContentScript],
  );

  return (
    <APIManagerContext.Provider
      value={{
        setColumnVisibility,
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
