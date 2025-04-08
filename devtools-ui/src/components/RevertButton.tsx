import { Undo2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function RevertButton(props: {
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  absolute?: boolean;
}) {
  const absolute = props.absolute ?? true;
  return (
    <Button
      className={cn(
        absolute ? 'absolute top-1 right-1' : '',
        'text-amber-400 hover:text-amber-500 w-6 h-6',
      )}
      variant="outline"
      title="Revert changes"
      size="icon"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children ?? <Undo2 size={4} className="w-2 h-2" />}
    </Button>
  );
}
