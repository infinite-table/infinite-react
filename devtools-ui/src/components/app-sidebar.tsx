import * as React from 'react';
import { ChevronRight, File, Folder, Table } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useDevToolsMessagingContext } from '../lib/DevToolsMessagingContext';
import { cn } from '../lib/utils';
import { useHighlight } from '../hooks/useHighlight';

// This is sample data.
const data = {
  changes: [
    {
      file: 'README.md',
      state: 'M',
    },
    {
      file: 'api/hello/route.ts',
      state: 'U',
    },
    {
      file: 'app/layout.tsx',
      state: 'M',
    },
  ],
  tree: [
    [
      'app',
      [
        'api',
        ['hello', ['route.ts']],
        'page.tsx',
        'layout.tsx',
        ['blog', ['page.tsx']],
      ],
    ],
    [
      'components',
      ['ui', 'button.tsx', 'card.tsx'],
      'header.tsx',
      'footer.tsx',
    ],
    ['lib', ['util.ts']],
    ['public', 'favicon.ico', 'vercel.svg'],
    '.eslintrc.json',
    '.gitignore',
    'next.config.js',
    'tailwind.config.js',
    'package.json',
    'README.md',
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { detectedDebugIds, setActiveDebugId, activeDebugId } =
    useDevToolsMessagingContext();

  const highlight = useHighlight();
  return (
    <>
      <Sidebar {...props}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {detectedDebugIds.map((debugId, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      className={cn(
                        'cursor-pointer ',
                        activeDebugId === debugId && 'bg-accent',
                      )}
                      onClick={(event) => {
                        const deselect =
                          (event.ctrlKey || event.metaKey) && activeDebugId;

                        if (deselect) {
                          setActiveDebugId(null);
                        } else {
                          if (activeDebugId !== debugId) {
                            setActiveDebugId(debugId);
                            highlight(debugId);
                          }
                        }
                      }}
                    >
                      <Table />
                      {debugId}
                    </SidebarMenuButton>
                    <SidebarMenuBadge
                      className={cn(
                        'invisible',
                        activeDebugId === debugId && 'visible',
                      )}
                    >
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          highlight(debugId);
                        }}
                        className="block w-4 h-4 bg-green-500 rounded-full"
                      ></div>
                    </SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              {!detectedDebugIds.length && (
                <div className="text-muted-foreground text-sm gap-10 grid my-5 leading-relaxed">
                  <p>{`No components found.`}</p>
                  <p>
                    {`Your <InfiniteTable /> components need the "debugId" prop to show up in the devtools.`}
                  </p>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

function Tree({ item }: { item: string | any[] }) {
  const [name, ...items] = Array.isArray(item) ? item : [item];

  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={name === 'button.tsx'}
        className="data-[active=true]:bg-transparent"
      >
        <File />
        {name}
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === 'components' || name === 'ui'}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
