import {
  DataSourceApi,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import cn from 'classnames';
import { useRef } from 'react';
import * as React from 'react';

import tailwindConfig from '../../../tailwind.config';
import { Button } from '../Button';
import { IconChevron } from '../Icon/IconChevron';
import { IconClose } from '../Icon/IconClose';
import { IconCodeBlock } from '../Icon/IconCodeBlock';
import { MaxWidth } from '../Layout/MarkdownPage';
import { StyledInput } from '../StyledInput';

import { H4 } from './Heading';
import InlineCode from './InlineCode';
import Link from './Link';

const debounce = require('debounce');

interface PropProps {
  children: React.ReactNode;
  name: string;
  type?: string;
  excerpt?: React.ReactNode;

  hidden?: boolean;
  defaultValue?: string | number | boolean | null | undefined;
}

interface PropContent {
  name: string;
  excerpt?: React.ReactNode;
  content?: React.ReactNode;
  // code: React.ReactNode;
}

const twColors = tailwindConfig.theme.extend.colors;
const colors = [
  {
    hex: twColors['blue-40'],
    border: 'border-blue-40',
    background: 'bg-blue-40',
  },
  {
    hex: twColors['yellow-40'],
    border: 'border-yellow-40',
    background: 'bg-yellow-40',
  },
  {
    hex: twColors['green-50'],
    border: 'border-green-50',
    background: 'bg-green-50',
  },
  {
    hex: twColors['purple-40'],
    border: 'border-purple-40',
    background: 'bg-dark-custom',
  },
];

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

  const href = `/docs/reference#${theName as string}`;
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
  const href = `/docs/reference/datasource-props#${name as string}`;
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
  const href = `/docs/reference/datasource-api#${name as string}`;
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
  const href = `/docs/reference/api#${name as string}`;
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
  const href = `/docs/reference/hooks#${name as string}`;
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
  hidden,
  excerpt,
  type,
}: PropProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (hidden) {
    return null;
  }

  const [first, ...rest] = React.Children.toArray(children);
  const inlineExcerpt =
    React.isValidElement(first) && first.props.mdxType === 'blockquote';
  if (inlineExcerpt) {
    excerpt = first.props.children;
  }

  const content = React.Children.toArray(inlineExcerpt ? rest : children);
  const hasDetails = !!content.length;

  return (
    <div
      className={cn(
        'my-4 rounded-lg shadow-inner relative',

        'bg-opacity-20 bg-secondary ',
      )}
    >
      <div className="p-8 flex flex-row">
        <div className="flex-1 flex flex-col w-full">
          <div className="flex flex-row w-full items-center flex-wrap">
            <H4 as="h2" id={name}>
              <IconCodeBlock className="inline mr-2 text-brand" />
              {name}
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
              onClick={() => setIsExpanded((current) => !current)}
            >
              <span className="mr-1">
                <IconChevron displayDirection={isExpanded ? 'up' : 'down'} />
              </span>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
          ) : null}
        </div>
      </div>
      {isExpanded && hasDetails ? (
        <div className={cn('p-8 border-t border-deep-dark')}>{content}</div>
      ) : null}
    </div>
  );
}

type PropTableProps = {
  children: React.ReactNode;
};

export function PropTable({
  // name,
  children,
}: PropTableProps) {
  const ref = React.useRef<HTMLDivElement>();

  const [filterText, doSetFilterText] = React.useState('');

  const contents = React.Children.toArray(children).map((child) => {
    if (!React.isValidElement(child)) return null;

    if (child.props.mdxType === 'Prop') {
      const name = child.props.name;

      let hidden = child.props.hidden;

      if (!name) {
        hidden = true;
      }
      if (!hidden && filterText && !name.toLowerCase().includes(filterText)) {
        hidden = true;
      }
      return React.cloneElement(child, {
        hidden,
      });
    }

    return child;
  });

  const setFilterText = React.useMemo(() => {
    const debouncedFilter = debounce((text: string) => {
      requestAnimationFrame(() => {
        doSetFilterText(text);
      });
    }, 500);

    return debouncedFilter;
  }, [doSetFilterText]);

  const onChange = (event: React.ChangeEvent) => {
    const value: string = (event.target as any).value || '';

    setFilterText(value.toLowerCase());
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const inputChildren = (
    filterText ? (
      <IconClose
        className="mx-2 group-betterhover:hover:text-gray-70 hover:text-link cursor-pointer"
        onClick={() => {
          doSetFilterText('');
          inputRef.current!.value = '';
          inputRef.current!.focus();
        }}
      />
    ) : null
  ) as React.ReactNode;

  return (
    <div className="my-4">
      <MaxWidth>
        <StyledInput
          ref={inputRef}
          className="bg-transparent flex-1 py-2 outline-none"
          defaultValue={filterText}
          //@ts-ignore
          onChange={onChange}
        >
          {/* @ts-ignore */}
          {inputChildren}
        </StyledInput>
      </MaxWidth>
      {contents}
      {/* {children} */}
    </div>
  );
}
