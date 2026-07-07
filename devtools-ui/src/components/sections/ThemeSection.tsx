import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Moon,
  Paintbrush,
  Sun,
  Undo2,
} from 'lucide-react';

import { useAPIManagerContext } from '../../lib/APIManagerContext';
import { useDevToolsMessagingContext } from '../../lib/DevToolsMessagingContext';
import {
  THEME_VARS,
  THEME_VAR_GROUPS,
  type ThemeVarMeta,
} from '../../lib/theme-vars';
import { cssColorToHex } from '../../lib/colorUtils';
import { cn } from '../../lib/utils';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const THEME_NAME_VAR = '--infinite-theme-name';
const THEME_MODE_VAR = '--infinite-theme-mode';

function useThrottledSend(send: (name: string, value: string) => void) {
  const lastSentRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ name: string; value: string } | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (name: string, value: string) => {
      const now = Date.now();
      const elapsed = now - lastSentRef.current;

      if (elapsed >= 100) {
        lastSentRef.current = now;
        send(name, value);
        return;
      }

      pendingRef.current = { name, value };
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          const pending = pendingRef.current;
          pendingRef.current = null;
          if (pending) {
            lastSentRef.current = Date.now();
            send(pending.name, pending.value);
          }
        }, 100 - elapsed);
      }
    },
    [send],
  );
}

type ThemeVarRowProps = {
  meta: ThemeVarMeta;
  value: string;
  /**
   * The computed value reported by the page - used as fallback for the color
   * swatch when the override is not directly parseable (e.g. named colors).
   */
  computedValue: string;
  overridden: boolean;
  onChange: (value: string) => void;
  onChangeLive: (value: string) => void;
  onRevert: () => void;
};

function ThemeVarRow(props: ThemeVarRowProps) {
  const {
    meta,
    value,
    computedValue,
    overridden,
    onChange,
    onChangeLive,
    onRevert,
  } = props;

  const [draft, setDraft] = useState(value);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(value);
    }
  }, [value]);

  const commit = () => {
    if (draft !== value) {
      onChange(draft);
    }
  };

  const hexValue =
    meta.kind === 'color'
      ? cssColorToHex(draft) ?? cssColorToHex(computedValue)
      : null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1 px-2 rounded-sm border-l-2',
        overridden
          ? 'border-warn bg-accent/40'
          : 'border-transparent hover:bg-accent/20',
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="flex-1 min-w-0 truncate text-xs text-foreground cursor-default">
            {meta.label}
          </label>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-72">
          <div className="flex flex-col gap-1">
            <code className="font-mono">{meta.name}</code>
            {meta.description ? <span>{meta.description}</span> : null}
          </div>
        </TooltipContent>
      </Tooltip>

      {meta.kind === 'color' ? (
        <input
          type="color"
          aria-label={`${meta.label} color picker`}
          className="size-6 shrink-0 cursor-pointer rounded-sm border border-input bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-xs [&::-webkit-color-swatch]:border-none"
          value={hexValue ?? '#000000'}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
          }}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            onChangeLive(next);
          }}
        />
      ) : null}

      <Input
        className="h-6 w-40 shrink-0 px-2 font-mono text-xs md:text-xs"
        value={draft}
        spellCheck={false}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          focusedRef.current = false;
          commit();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commit();
          }
          if (event.key === 'Escape') {
            setDraft(value);
          }
        }}
      />

      <Button
        variant="ghost"
        size="icon"
        className={cn('size-6 shrink-0', !overridden && 'invisible')}
        title={`Revert ${meta.name}`}
        onClick={onRevert}
      >
        <Undo2 className="size-3.5" />
      </Button>
    </div>
  );
}

function getCssText(overrides: Record<string, string>) {
  const lines = Object.keys(overrides)
    .sort()
    .map((name) => `  ${name}: ${overrides[name]};`);

  return `:root {\n${lines.join('\n')}\n}\n`;
}

function CssExportDialog({ overrides }: { overrides: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  const cssText = getCssText(overrides);
  const count = Object.keys(overrides).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={count === 0}>
          <Paintbrush className="size-3.5" />
          Get CSS
        </Button>
      </DialogTrigger>
      {/* the dialog is portaled to document.body, outside the devtools wrapper
          that sets text-foreground, so set the text color explicitly */}
      <DialogContent className="max-w-xl text-foreground">
        <DialogHeader>
          <DialogTitle>Theme CSS</DialogTitle>
          <DialogDescription>
            Copy this CSS into your app to persist the {count} customized{' '}
            {count === 1 ? 'variable' : 'variables'}. Apply it on `:root` or on
            any ancestor of the table.
          </DialogDescription>
        </DialogHeader>
        <pre className="max-h-80 overflow-auto rounded-md bg-sidebar text-sidebar-foreground p-3 font-mono text-xs whitespace-pre">
          {cssText}
        </pre>
        <Button
          variant="default"
          onClick={() => {
            navigator.clipboard.writeText(cssText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? 'Copied' : 'Copy CSS'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ThemeVarGroup(props: {
  group: string;
  vars: ThemeVarMeta[];
  open: boolean;
  onToggle: () => void;
  themeVars: Record<string, string>;
  overrides: Record<string, string>;
  overriddenCount: number;
  onSet: (name: string, value: string) => void;
  onSetLive: (name: string, value: string) => void;
  onRevert: (name: string) => void;
}) {
  const {
    group,
    vars,
    open,
    onToggle,
    themeVars,
    overrides,
    overriddenCount,
    onSet,
    onSetLive,
    onRevert,
  } = props;

  return (
    <div className="rounded-md bg-sidebar text-sidebar-foreground">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-2 py-2 text-left text-xs font-medium text-foreground cursor-pointer"
        onClick={onToggle}
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        <span className="flex-1">{group}</span>
        {overriddenCount > 0 ? (
          <span className="rounded-full bg-warn/20 px-1.5 py-0.5 text-[10px] text-warn">
            {overriddenCount} changed
          </span>
        ) : null}
        <span className="text-[10px] text-muted-foreground">{vars.length}</span>
      </button>

      {open ? (
        <div className="flex flex-col gap-0.5 px-1 pb-2">
          {vars.map((meta) => (
            <ThemeVarRow
              key={meta.name}
              meta={meta}
              value={overrides[meta.name] ?? themeVars[meta.name] ?? ''}
              computedValue={themeVars[meta.name] ?? ''}
              overridden={meta.name in overrides}
              onChange={(value) => onSet(meta.name, value)}
              onChangeLive={(value) => onSetLive(meta.name, value)}
              onRevert={() => onRevert(meta.name)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ThemeSection() {
  const { setCssVar, revertCssVar, revertAllCssVars } = useAPIManagerContext();
  const currentInstance = useDevToolsMessagingContext().currentInstance!;

  const themeVars = currentInstance.themeVars || {};
  const overrides = currentInstance.themeVarOverrides || {};

  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set([THEME_VAR_GROUPS[0]]),
  );

  const setCssVarLive = useThrottledSend(setCssVar);

  const searchText = search.trim().toLowerCase();

  const groupedVars = useMemo(() => {
    const filtered = searchText
      ? THEME_VARS.filter((meta) => {
          return (
            meta.name.toLowerCase().includes(searchText) ||
            meta.label.toLowerCase().includes(searchText) ||
            meta.group.toLowerCase().includes(searchText)
          );
        })
      : THEME_VARS;

    const byGroup = new Map<string, ThemeVarMeta[]>();
    filtered.forEach((meta) => {
      const list = byGroup.get(meta.group) || [];
      list.push(meta);
      byGroup.set(meta.group, list);
    });
    return byGroup;
  }, [searchText]);

  const overriddenCount = Object.keys(overrides).length;

  if (!Object.keys(themeVars).length) {
    return (
      <div className="p-4 text-xs italic text-muted-foreground text-center">
        No theme variables reported by this instance. Make sure the page uses a
        version of{' '}
        <code className="font-mono not-italic">
          @infinite-table/infinite-react
        </code>{' '}
        that supports the devtools theme editor and that the CSS is loaded.
      </div>
    );
  }

  const themeName = themeVars[THEME_NAME_VAR] || 'default';
  const themeMode = themeVars[THEME_MODE_VAR] || 'light';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          className="h-7 w-52 text-xs md:text-xs"
          placeholder="Search variables..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div
          className="flex items-center gap-1.5 rounded-md bg-sidebar px-2 py-1 text-xs"
          title="The theme currently applied on the page"
        >
          {themeMode === 'dark' ? (
            <Moon className="size-3.5" />
          ) : (
            <Sun className="size-3.5" />
          )}
          <span className="font-medium text-foreground">{themeName}</span>
          <span className="text-muted-foreground">{themeMode}</span>
        </div>

        <div className="flex-1" />

        {overriddenCount > 0 ? (
          <span className="text-xs text-warn">
            {overriddenCount} {overriddenCount === 1 ? 'variable' : 'variables'}{' '}
            changed
          </span>
        ) : null}

        <CssExportDialog overrides={overrides} />

        <Button
          variant="outline"
          disabled={overriddenCount === 0}
          onClick={revertAllCssVars}
        >
          <Undo2 className="size-3.5" />
          Reset all
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {THEME_VAR_GROUPS.map((group) => {
          const vars = groupedVars.get(group);
          if (!vars || vars.length === 0) {
            return null;
          }

          const overriddenInGroup = vars.filter(
            (meta) => meta.name in overrides,
          ).length;

          return (
            <ThemeVarGroup
              key={group}
              group={group}
              vars={vars}
              open={!!searchText || openGroups.has(group)}
              onToggle={() => {
                setOpenGroups((prev) => {
                  const next = new Set(prev);
                  if (next.has(group)) {
                    next.delete(group);
                  } else {
                    next.add(group);
                  }
                  return next;
                });
              }}
              themeVars={themeVars}
              overrides={overrides}
              overriddenCount={overriddenInGroup}
              onSet={setCssVar}
              onSetLive={setCssVarLive}
              onRevert={revertCssVar}
            />
          );
        })}
      </div>
    </div>
  );
}
