import { useAPIManagerContext } from '../lib/APIManagerContext';
import { cn } from '../lib/utils';
import type { DevToolsOverrides } from '@infinite-table/infinite-react';
import { Button } from './ui/button';
import { Trash, Undo2 } from 'lucide-react';
import { RevertButton } from './RevertButton';
type DevToolsSidebarSectionProps = {
  name: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  overridesProperties?: (keyof DevToolsOverrides)[];
};
export function DevToolsSidebarSection(props: DevToolsSidebarSectionProps) {
  const { overridenProperties, revertProperty } = useAPIManagerContext();

  const overriden = props.overridesProperties
    ? props.overridesProperties.some((property) =>
        overridenProperties.has(property),
      )
    : false;

  return (
    <div
      className={cn(
        'relative text-sm bg-sidebar text-sidebar-foreground p-4 rounded-md flex flex-col gap-2 border-1',
        overriden ? 'border-warn ' : 'border-transparent',
        props.className,
      )}
    >
      <span className="font-medium text-foreground">{props.name}</span>

      {props.children}

      {overriden && (
        <RevertButton
          onClick={() => {
            props.overridesProperties?.forEach((property) => {
              revertProperty(property);
            });
          }}
        />
      )}
    </div>
  );
}
