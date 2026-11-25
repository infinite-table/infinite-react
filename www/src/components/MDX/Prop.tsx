'use client';
import {
  DataSourceApi,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import cn from 'classnames';
import { useRef } from 'react';
import * as React from 'react';

import { Button } from '../Button';
import { IconChevron } from '../Icon/IconChevron';
import { IconClose } from '../Icon/IconClose';
import { IconCodeBlock } from '../Icon/IconCodeBlock';
import { MaxWidth } from '../Layout/MarkdownPage';
import { StyledInput } from '../StyledInput';

import { H4 } from './Heading';
import InlineCode from './InlineCode';
import Link from './Link';
import { newvars } from '@www/styles/www-utils';

import debounce from 'debounce';
import { Blockquote } from './Blockquote';
import { usePathname } from 'next/navigation';

interface PropProps {
  children: React.JSX.Element;
  name: string;
  type?: string;
  returnType?: React.ReactNode;
  returnTypeLink?: string;
  excerpt?: React.ReactNode;

  generic?: boolean;
  deprecated?: boolean;
  hidden?: boolean;
  highlight?: boolean;
  defaultValue?: string | number | boolean | null | undefined;
  onPropExpand?: (name: string, hash: string) => void;

  // set by the MDX components factory, for the page's framework (see
  // ReferenceLinkFrameworkProps): the name as that framework spells it
  label?: string;
  chip?: string;
  /** more names of the same entry: the function input of a change callback */
  more?: string[];
  /** ids the entry can also be linked with, next to `name`: its Angular name */
  anchors?: string[];
}

/**
 * Set by the MDX components factory (content/new-mdx-components.tsx), for the
 * page's framework: the reference page there, and the name as that framework
 * spells it (on an Angular page, `sortInfo` is `[(sortInfo)]`, a model).
 */
type ReferenceLinkFrameworkProps = {
  /** The reference page for the page's framework (else the React one). */
  path?: string;
  /** Shown instead of the name. */
  label?: string;
  /** A pill after the name: what kind of member it is. */
  chip?: string;
};

type ReferenceLinkProps<NAME> = {
  name: NAME;
  children?: React.JSX.Element;
  code?: boolean;
  nocode?: boolean;
} & ReferenceLinkFrameworkProps;

/** A link to an entry of a reference page: `<path>#<name>`. */
function ReferenceLink({
  defaultPath,
  name,
  children,
  code = true,
  nocode,
  path: framePath,
  label,
  chip,
}: Omit<ReferenceLinkProps<string>, 'name'> & {
  name: string | undefined;
  defaultPath: string;
}) {
  const pathname = usePathname();
  let path = framePath ?? defaultPath;
  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const text = label ?? children ?? name;
  const content = code ? <InlineCode isLink={false}>{text}</InlineCode> : text;
  return (
    <Link href={href}>
      {content}
      {chip ? <span className="docs-ref-chip">{chip}</span> : null}
    </Link>
  );
}

export const PropLink = ({
  name,
  children,
  ...props
}: ReferenceLinkProps<keyof InfiniteTableProps<any>>) => {
  let theName = name;
  if (!name && typeof children === 'string') {
    theName = children as keyof InfiniteTableProps<any>;
  }
  return (
    <ReferenceLink
      defaultPath="/docs/reference/infinite-table-props"
      name={theName as string}
      {...props}
    >
      {children}
    </ReferenceLink>
  );
};

PropLink.displayName = 'PropLink';

export const DataSourcePropLink = (
  props: ReferenceLinkProps<keyof InfiniteTableProps<any>>,
) => (
  <ReferenceLink defaultPath="/docs/reference/datasource-props" {...props} />
);

DataSourcePropLink.displayName = 'DataSourcePropLink';

export const DApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => <ReferenceLink defaultPath="/docs/reference/datasource-api" {...props} />;

DApiLink.displayName = 'DApiLink';

export const TreeApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => <ReferenceLink defaultPath="/docs/reference/tree-api" {...props} />;

TreeApiLink.displayName = 'TreeApiLink';

export const ColumnApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => <ReferenceLink defaultPath="/docs/reference/column-api" {...props} />;

ColumnApiLink.displayName = 'ColumnApiLink';

export const CellApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => (
  <ReferenceLink defaultPath="/docs/reference/cell-selection-api" {...props} />
);

CellApiLink.displayName = 'CellApiLink';

export const RowDetailApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => <ReferenceLink defaultPath="/docs/reference/row-detail-api" {...props} />;

RowDetailApiLink.displayName = 'RowDetailApiLink';

export const KeyNavApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => (
  <ReferenceLink
    defaultPath="/docs/reference/keyboard-navigation-api"
    {...props}
  />
);

KeyNavApiLink.displayName = 'KeyNavApiLink';

export const TypeLink = (props: ReferenceLinkProps<string>) => (
  <ReferenceLink defaultPath="/docs/reference/type-definitions" {...props} />
);

TypeLink.displayName = 'TypeLink';

export const ApiLink = (
  props: ReferenceLinkProps<keyof DataSourceApi<any>>,
) => <ReferenceLink defaultPath="/docs/reference/api" {...props} />;

ApiLink.displayName = 'ApiLink';

export const LearnLink = ({
  name,
  children,
}: {
  name: string;
  children: React.JSX.Element;
}) => {
  const href = `/docs/learn/${name as string}`;

  const content = children ?? name;
  return <Link href={href}>{content}</Link>;
};

export const HookLink = (
  props: ReferenceLinkProps<keyof InfiniteTableProps<any>>,
) => <ReferenceLink defaultPath="/docs/reference/hooks" {...props} />;

HookLink.displayName = 'HookLink';

const PropInlineCode = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      title={typeof children === 'string' ? children : undefined}
      style={style}
      className={cn(
        'docs-prop-code inline-block whitespace-pre max-w-full overflow-hidden overflow-ellipsis',
        className,
      )}
    >
      {children}
    </div>
  );
};

export function Prop({
  children,
  name,
  defaultValue,
  generic,
  hidden,
  highlight,
  excerpt,
  onPropExpand,
  type,
  returnType,
  deprecated,
  returnTypeLink,
  label,
  chip,
  more,
  anchors,
}: PropProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (hidden) {
    return null;
  }

  const [first, ...rest] = React.Children.toArray(children);
  const inlineExcerpt =
    React.isValidElement(first) && first.type === Blockquote;

  if (inlineExcerpt) {
    //@ts-ignore
    excerpt = first.props.children;
  }

  const content = React.Children.toArray(inlineExcerpt ? rest : children);
  const hasDetails = !!content.length;

  const expanded = isExpanded && hasDetails;

  const theId = (name || '').replaceAll('.', '-');
  return (
    <div
      className="docs-prop"
      data-highlight={highlight ? '' : undefined}
      data-expanded={expanded ? '' : undefined}
    >
      <div className="docs-prop__head flex flex-row">
        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-row w-full items-center flex-wrap ">
            {/* The pt and mt hack is for when there's anchor navigation, in order to accomodate for the fixed navbar and search field */}
            <H4
              as="h2"
              id={theId}
              className={`docs-prop__name relative ${
                deprecated ? 'line-through' : ''
              }`}
            >
              <IconCodeBlock className="docs-prop__icon" />
              {anchors?.map((anchor) => (
                <span key={anchor} id={anchor} className="docs-prop__anchor" />
              ))}
              {label ?? name}
              {more?.map((other) => (
                <span key={other} className="docs-prop__more">
                  {other}
                </span>
              ))}
              {chip ? <span className="docs-ref-chip">{chip}</span> : null}
              {generic ? (
                <span className="italic opacity-40">{` <T>`}</span>
              ) : null}
              {deprecated ? (
                <span className="docs-prop__deprecated">
                  deprecated
                </span>
              ) : null}
            </H4>

            {defaultValue !== undefined ? (
              <PropInlineCode className="sm:ml-4">
                Default:{' '}
                {defaultValue === false
                  ? 'false'
                  : defaultValue === true
                  ? 'true'
                  : defaultValue === null
                  ? 'null'
                  : defaultValue}
              </PropInlineCode>
            ) : null}

            {type ? (
              <>
                <div
                  className="flex flex-row justify-start flex-auto "
                  style={{ maxWidth: '90%' }}
                >
                  <PropInlineCode className="ml-3">{type}</PropInlineCode>
                </div>
              </>
            ) : null}

            {returnType || returnTypeLink ? (
              <>
                <div
                  className="flex flex-row justify-start flex-auto "
                  style={{ maxWidth: '90%' }}
                >
                  <PropInlineCode className="ml-3">
                    Return:{' '}
                    {returnTypeLink ? (
                      <TypeLink name={returnTypeLink} code={false} />
                    ) : (
                      returnType
                    )}
                  </PropInlineCode>
                </div>
              </>
            ) : null}
          </div>

          <div className="mb-4">
            {/* <h3 className="text-xl font-bold text-primary-dark">
            {name}
          </h3> */}
            {excerpt && <div>{excerpt}</div>}
          </div>
          {hasDetails ? (
            <Button
              active
              className="docs-prop__toggle inline-block self-start"
              onClick={() =>
                setIsExpanded((current) => {
                  const expanded = !current;

                  if (expanded) {
                    if (window.history && window.history.pushState) {
                      window.history.pushState(null, '', `#${theId}`);
                    } else {
                      window.location.hash = theId;
                    }
                    onPropExpand?.(name, theId);
                  }

                  return expanded;
                })
              }
            >
              <span className="mr-1">
                <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
              </span>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className="docs-prop__details">
          {content}
        </div>
      ) : null}
    </div>
  );
}

type PropTableProps = {
  children: React.ReactNode;
  sort?: boolean;
  searchPlaceholder?: string;
};

const initialFilterText = '';

export function PropTable({
  // name,
  children,
  sort,
  searchPlaceholder,
}: PropTableProps) {
  const [filterText, doSetFilterText] = React.useState(initialFilterText);
  const [hash, setHash] = React.useState(initialFilterText);

  const resetSearch = React.useCallback((value = '') => {
    doSetFilterText(value);
    inputRef.current!.value = value;
  }, []);

  React.useLayoutEffect(() => {
    const hash = globalThis.location ? globalThis.location.hash.slice(1) : '';
    const initialText = hash ? hash.toLowerCase() : '';

    if (initialText) {
      const [search, value] = initialText.split('=');

      if (search === 'search' && value) {
        resetSearch(value);
      }
      setHash(hash);
    }

    const onHashChange = debounce(function (_event: null | HashChangeEvent) {
      const currentLocation = globalThis.location;

      setHash(currentLocation ? currentLocation.hash.slice(1) : '');

      if (globalThis.document.activeElement === inputRef.current) {
        return;
      }

      const hash = currentLocation
        ? currentLocation.hash.slice(1).toLowerCase()
        : '';

      if (hash) {
        // if (currentLocation.pathname !== initialPathname) {
        //   // when another PropTable is rendered (on route change, this doesn't get unmounted when going from infinite props to datasource props)
        //   // we need to reset the search
        //   console.log(
        //     'changing pathname from ',
        //     initialPathname,
        //     ' to ',
        //     currentLocation.pathname,
        //   );
        //   initialPathname = currentLocation.pathname;
        //   onValueChange('');
        //   return;
        // }

        const [propName, propValue] = hash.split('=');

        if (propName && propName === 'search') {
          return resetSearch(propValue);
        }
      }

      resetSearch('');
    }, 200);

    window.addEventListener('hashchange', onHashChange);

    // onHashChange(null);

    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  React.useEffect(() => {
    if (filterText) {
      window.location.hash = `search=${filterText}`;
    }
  }, [filterText]);

  const childrenArray = React.Children.toArray(children);

  const lowerHash = hash.toLowerCase().replaceAll('-', '.');

  let highlightedName = '';

  let visibleCount = 0;

  let contents = childrenArray.map((child) => {
    if (!React.isValidElement(child)) return null;

    // @ts-ignore
    if (child.props.name) {
      // @ts-ignore
      const name = child.props.name;
      const lowerName = name.toLowerCase();
      const highlight = lowerHash === lowerName;

      if (highlight) {
        highlightedName = name;
      }

      // @ts-ignore
      let hidden = child.props.hidden;

      if (!name) {
        hidden = true;
      }
      if (!hidden && filterText && !lowerName.includes(filterText)) {
        hidden = true;
      }
      if (!hidden) {
        visibleCount++;
      }
      // if (highlight) {
      //   console.log({
      //     highlight,
      //     lowerName,
      //     lowerHash,
      //   });
      // }
      return React.cloneElement(child, {
        //@ts-ignore
        hidden,
        highlight,
        onPropExpand: (_name: string, hash: string) => {
          setHash(hash);
        },
      });
    }

    return child;
  });

  if (sort) {
    contents = contents.filter(Boolean).sort((a, b) => {
      //@ts-ignore
      if (!a?.props.name || !b?.props.name) return 0;
      return (a as any).props.name.localeCompare((b as any).props.name);
    });
  }

  React.useEffect(() => {
    if (globalThis.document && hash && highlightedName) {
      const id = hash.replaceAll('.', '-');
      const el = document.querySelector(`#${id}`);

      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash, highlightedName]);

  const setFilterText = React.useMemo(() => {
    const debouncedFilter = debounce((text: string) => {
      requestAnimationFrame(() => {
        doSetFilterText(text);
      });
    }, 500);

    return debouncedFilter;
  }, [doSetFilterText]);

  const onValueChange = React.useCallback(
    (value: string) => {
      setFilterText(value.toLowerCase());

      if (!value) {
        console.log('clearing hash');
        window.location.hash = '';
      }
    },
    [setFilterText],
  );

  const onChange = React.useCallback(
    (event: React.ChangeEvent) => {
      const value: string = (event.target as any).value || '';

      onValueChange(value);
    },
    [onValueChange],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const inputChildren = (
    filterText ? (
      <IconClose
        className="mx-2 group-betterhover:hover:text-gray-70 hover:text-link cursor-pointer"
        onClick={() => {
          resetSearch('');

          window.location.hash = '';
          inputRef.current!.focus();
        }}
      />
    ) : null
  ) as React.ReactNode;

  return (
    <div className="my-4">
      <MaxWidth
        className="docs-prop-filter sticky"
        style={{
          top: newvars.header.lineHeight,
          zIndex: 1000,
        }}
      >
        <StyledInput
          ref={inputRef}
          autoFocus
          placeholder={searchPlaceholder}
          className="flex-1 py-2 my-2 outline-none"
          defaultValue={filterText}
          //@ts-ignore
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {inputChildren}
        </StyledInput>
      </MaxWidth>

      {contents}
      {!visibleCount ? (
        <div>
          <div className="my-4">No props matching your search</div>
          <Button
            active
            className={cn('inline-block self-start')}
            onClick={() => resetSearch()}
          >
            Clear Search and Show All
          </Button>
        </div>
      ) : null}
    </div>
  );
}
