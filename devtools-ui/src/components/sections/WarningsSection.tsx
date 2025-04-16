import { X } from 'lucide-react';
import { useAPIManagerContext } from '../../lib/APIManagerContext';
import { notNullable } from '../../lib/utilityTypes';
import { cn } from '../../lib/utils';
import { DevToolsSidebarSection } from '../DevToolsSidebarSection';

export function WarningsSection() {
  const { discardWarning, warnings } = useAPIManagerContext();

  const unreadWarnings = Object.values(warnings || {})
    .filter((warning) => warning!.status === 'new')
    .filter(notNullable);

  return (
    <DevToolsSidebarSection
      name="Warnings"
      className={unreadWarnings.length > 0 ? '' : 'hidden'}
    >
      <div className={cn('flex flex-col gap-2  rounded-md')}>
        {unreadWarnings.map((warning) => {
          const clear = () => {
            discardWarning(warning.code);
          };
          return (
            <div
              key={warning.code}
              className={cn(
                'flex items-center gap-2 relative p-4 pr-6 rounded-md',
                warning.type === 'error'
                  ? 'bg-destructive text-white'
                  : 'bg-warn text-warn-foreground',
              )}
            >
              <span className="whitespace-pre-wrap">{warning.message}</span>
              <X
                tabIndex={0}
                onClick={clear}
                className="cursor-pointer absolute bg-accent text-accent-foreground w-6 h-6 p-1 rounded-md top-0 right-0 mt-1 mr-1"
              />
            </div>
          );
        })}
      </div>
    </DevToolsSidebarSection>
  );
}
