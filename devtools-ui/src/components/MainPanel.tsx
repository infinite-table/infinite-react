import { InfiniteTable } from '@infinite-table/infinite-react';

import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';

import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';

import { APIManagerWithContext } from './APIManagerWithContext';
import { WarningsSection } from './sections/WarningsSection';
import { ColumnVisibilitySection } from './sections/ColumnVisibilitySection';
import { DebugTimingsSection } from './sections/DebugTimingsSection';
import { GroupBySection } from './sections/GroupBySection';
import { SortInfoSection } from './sections/SortInfoSection';
import { InstanceTitle } from './InstanceTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogsList } from './LogsList';
import { AppSidebar } from './app-sidebar';

//@ts-ignore
const LICENSE_KEY = process.env.NEXT_PUBLIC_INFINITE_TABLE_LICENSE_KEY;
InfiniteTable.licenseKey = LICENSE_KEY;

function MainContent() {
  const { currentInstance } = useDevToolsMessagingContext();

  if (!currentInstance) {
    return (
      <div className="flex flex-row flex-1">
        <SidebarTrigger />
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-base italic">
          <p>Please select an</p>
          <pre className="inline-block">{` <InfiniteTable /> `}</pre>
          <p>instance on the left to inspect</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarInset>
      <div className="flex flex-col flex-1 gap-2 pb-2 overflow-hidden">
        <InstanceTitle />

        <Tabs defaultValue="instance" className="flex-1 gap-2 overflow-hidden">
          <TabsList className="mx-2">
            <TabsTrigger value="instance">Component</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent
            value="logs"
            className="text-sm text-muted-foreground px-2 flex flex-col gap-2 overflow-auto"
          >
            <LogsList debugId={currentInstance.debugId} />
          </TabsContent>
          <TabsContent
            value="instance"
            className="text-sm text-muted-foreground px-2 flex flex-col gap-2 overflow-auto"
          >
            <WarningsSection />
            <ColumnVisibilitySection />
            <DebugTimingsSection />
            <GroupBySection />
            <SortInfoSection />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}

function PanelRoot() {
  return (
    <div className="flex flex-1 bg-background text-foreground transform-[translate3d(0,0,0)]">
      <AppSidebar />

      <MainContent />
    </div>
  );
}

export default function () {
  return (
    <APIManagerWithContext>
      <SidebarProvider
        defaultOpen={true}
        style={{
          fontSize: 12,
          //@ts-ignore
          '--sidebar-width': 'calc(200px)',
          '--sidebar-width-mobile': 'calc(200px)',
        }}
      >
        <PanelRoot />
      </SidebarProvider>
    </APIManagerWithContext>
  );
}
