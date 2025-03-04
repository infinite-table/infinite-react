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
  children: React.ReactNode;
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
}

export const PropLink = ({
  name,
  children,
  code = true,

  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let theName = name;
  if (!name && typeof children === 'string') {
    theName = children as keyof InfiniteTableProps<any>;
  }

  const pathname = usePathname();
  let path = '/docs/reference/infinite-table-props';
  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${theName as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? theName}</InlineCode>
  ) : (
    children ?? theName
  );
  return <Link href={href}>{content}</Link>;
};

PropLink.displayName = 'PropLink';

export const DataSourcePropLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  const pathname = usePathname();
  let path = '/docs/reference/datasource-props';
  if (pathname === path) {
    path = ''; // we're on this page already
  }

  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

DataSourcePropLink.displayName = 'DataSourcePropLink';

export const DApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/datasource-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

DApiLink.displayName = 'DApiLink';

export const TreeApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/tree-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

TreeApiLink.displayName = 'TreeApiLink';

export const ColumnApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/column-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

ColumnApiLink.displayName = 'ColumnApiLink';

export const CellApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/cell-selection-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

CellApiLink.displayName = 'CellApiLink';

export const RowDetailApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/row-detail-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

RowDetailApiLink.displayName = 'RowDetailApiLink';

export const KeyNavApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/keyboard-navigation-api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

KeyNavApiLink.displayName = 'KeyNavApiLink';

export const TypeLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: string;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/type-definitions';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

TypeLink.displayName = 'TypeLink';

export const ApiLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof DataSourceApi<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/api';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

ApiLink.displayName = 'ApiLink';

export const LearnLink = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => {
  const href = `/docs/learn/${name as string}`;

  const content = children ?? name;
  return <Link href={href}>{content}</Link>;
};

export const HookLink = ({
  name,
  children,
  code = true,
  nocode,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
  code?: boolean;
  nocode?: boolean;
}) => {
  let path = '/docs/reference/hooks';
  const pathname = usePathname();

  if (pathname === path) {
    path = ''; // we're on this page already
  }
  const href = `${path}#${name as string}`;
  if (nocode) {
    code = false;
  }
  const content = code ? (
    <InlineCode isLink={false}>{children ?? name}</InlineCode>
  ) : (
    children ?? name
  );
  return <Link href={href}>{content}</Link>;
};

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
        'rounded-lg inline-block bg-gray-90 px-2 text-content-color font-mono text-code whitespace-pre max-w-full overflow-hidden overflow-ellipsis',
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
      className={cn(
        'my-6 rounded-lg shadow-inner relative',

        `bg-opacity-40 bg-secondary`,
      )}
    >
      <div
        className={`p-8 flex flex-row ${
          expanded ? 'rounded-b-none rounded-lg' : 'rounded-lg'
        } ${highlight ? 'bg-brand-dark' : ''}`}
      >
        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-row w-full items-center flex-wrap ">
            {/* The pt and mt hack is for when there's anchor navigation, in order to accomodate for the fixed navbar and search field */}
            <H4
              as="h2"
              id={theId}
              className={`pt-[80px] mt-[-80px] mb-0 relative ${
                deprecated ? 'line-through' : ''
              }`}
            >
              <IconCodeBlock className="inline mr-2 text-brand" />
              {name}
              {generic ? (
                <span className="italic opacity-40">{` <T>`}</span>
              ) : null}
              {deprecated ? (
                <span className="text-xs ml-3 absolute top-16 -left-4 bg-red-400 text-dark-custom p-1 leading-none rounded">
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
              className={cn('inline-block self-start')}
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
        <div className={cn('p-8 border-t border-deep-dark')}>{content}</div>
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

    if (child.props.name) {
      const name = child.props.name;
      const lowerName = name.toLowerCase();
      const highlight = lowerHash === lowerName;

      if (highlight) {
        highlightedName = name;
      }

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
      if (highlight) {
        console.log({
          highlight,
          lowerName,
          lowerHash,
        });
      }
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
        className={`sticky`}
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
