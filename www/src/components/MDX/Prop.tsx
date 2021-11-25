import * as React from 'react';
import cn from 'classnames';
import Link from './Link';
import tailwindConfig from '../../../tailwind.config';
import { H4 } from './Heading';
import { Button } from '../Button';
import { IconChevron } from '../Icon/IconChevron';
import { IconCodeBlock } from '../Icon/IconCodeBlock';
import { IconClose } from '../Icon/IconClose';
import { useRef } from 'react';
import { InfiniteTableProps } from '@infinite-table/infinite-react';
import { StyledInput } from '../StyledInput';
import { MaxWidth } from '../Layout/MarkdownPage';
import InlineCode from './InlineCode';
const debounce = require('debounce');

interface PropProps {
  children: React.ReactNode;
  name: string;
  type?: string;
  excerpt?: React.ReactNode;

  hidden?: boolean;
  defaultValue?:
    | string
    | number
    | boolean
    | null
    | undefined;
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
    background: 'bg-purple-40',
  },
];

export const PropLink = ({
  name,
  children,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
}) => {
  const href = `/docs/latest/reference#${name}`;
  return (
    <Link href={href}>
      {children ?? (
        <InlineCode isLink={false}>{name}</InlineCode>
      )}
    </Link>
  );
};

export const DataSourcePropLink = ({
  name,
  children,
}: {
  name: keyof InfiniteTableProps<any>;
  children?: React.ReactNode;
}) => {
  const href = `/docs/latest/reference/datasource-props#${name}`;
  return (
    <Link href={href}>
      {children ?? (
        <InlineCode isLink={false}>{name}</InlineCode>
      )}
    </Link>
  );
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
      title={
        typeof children === 'string' ? children : undefined
      }
      style={style}
      className={cn(
        'rounded-lg inline-block bg-gray-90 px-2 text-primary-dark dark:text-primary-dark font-mono text-code whitespace-pre max-w-full overflow-hidden overflow-ellipsis',
        className
      )}>
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
    React.isValidElement(first) &&
    first.props.mdxType === 'blockquote';
  if (inlineExcerpt) {
    excerpt = first.props.children;
  }

  const content = React.Children.toArray(
    inlineExcerpt ? rest : children
  );
  const hasDetails = !!content.length;

  return (
    <div
      className={cn(
        'my-4 rounded-lg shadow-inner relative',

        'dark:bg-opacity-20 dark:bg-purple-60 bg-purple-5'
      )}>
      <div className="p-8 flex flex-row">
        <div className="flex-1">
          <div className="flex flex-row w-full items-center flex-wrap">
            <H4 as="h2" id={name}>
              <IconCodeBlock className="inline mr-2 dark:text-purple-30 text-purple-40" />
              {name}
            </H4>
            {defaultValue !== undefined ? (
              <PropInlineCode className="sm:ml-4">
                Default: {defaultValue}
              </PropInlineCode>
            ) : null}

            {type ? (
              <>
                <div className="flex flex-row justify-end flex-auto">
                  <PropInlineCode
                    className="ml-3 "
                    style={{ maxWidth: '90%' }}>
                    {type}
                  </PropInlineCode>
                </div>
              </>
            ) : null}
          </div>

          <div className="mb-4">
            {/* <h3 className="text-xl font-bold text-primary dark:text-primary-dark">
            {name}
          </h3> */}
            {excerpt && <div>{excerpt}</div>}
          </div>
          {hasDetails ? (
            <Button
              active
              className={cn(
                'bg-purple-50 border-purple-50 hover:bg-purple-40 focus:bg-purple-50 active:bg-purple-50'
              )}
              onClick={() =>
                setIsExpanded((current) => !current)
              }>
              <span className="mr-1">
                <IconChevron
                  displayDirection={
                    isExpanded ? 'up' : 'down'
                  }
                />
              </span>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
          ) : null}
        </div>
      </div>
      {isExpanded && hasDetails ? (
        <div
          className={cn(
            'p-8 border-t dark:border-purple-60 border-purple-10 '
          )}>
          {content}
        </div>
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

  const contents = React.Children.toArray(children).map(
    (child) => {
      if (!React.isValidElement(child)) return null;

      if (child.props.mdxType === 'Prop') {
        const name = child.props.name;
        let hidden = child.props.hidden;

        if (
          filterText &&
          !name.toLowerCase().includes(filterText)
        ) {
          hidden = true;
        }
        return React.cloneElement(child, {
          hidden,
        });
      }

      return child;
    }
  );

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
          //@ts-ignore
          children={inputChildren}></StyledInput>
      </MaxWidth>
      {contents}
      {/* {children} */}
    </div>
  );
}
