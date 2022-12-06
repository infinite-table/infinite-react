---
title: Getting Started
description: Get help starting with Infinite Table for React. Our DataGrid component helps with sorting, filtering, row/column grouping, pivoting, aggregations ...
---

> `Infinite Table` is a UI component for data virtualization - helps you display huge datasets of tabular data.

It's built specifically for React from the ground up and with performance in mind.

# Installation

`Infinite Table` is available on the public [npm registry](https://www.npmjs.com/package/@infinite-table/infinite-react) - install it by running the following command:


<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

## Meet the Code

<Sandpack>

<Description>

This is an example to get you started with Infinite Table with minimal setup.

</Description>

```ts file=meet-the-code.page.tsx

```

</Sandpack>

## Using the Components

In the code snippet above, you notice we're using 2 components:

- `DataSource` - this needs to be a parent (or ancestor, at any level) of the `InfiniteTable` component - it controls which `data` the table is rendering
- `InfiniteTable` - the actual virtualized table component - needs to be inside a `DataSource` (can be at any level of nesting).

Both components are named exports of the `@infinite-table/infinite-react` package.

## TypeScript Types

Our `TypeScript` types are published as part of the package, as named exports from the root of the package.

There are 2 components that you can use and import:

- `InfiniteTable`
- `DataSource`

Each of those has types provided for all the props it exposes, with the pattern of `<COMPONENT_NAME>Prop<PROP_NAME>`, so here are a few examples to clarify the rule:

```ts
import {
  InfiniteTablePropColumns, // or accessible as InfiniteTableProps['columns']
  // corresponding to the `columns` prop
  DataSourcePropGroupBy, // or accessible as DataSourceProps['groupBy']
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-react';
```


<HeroCards>
<YouWillLearnCard title="Learn about our TypeScript typings" path="/docs/learn/getting-started/typescript-types">
Read more about how to use our TypeScript types.
</YouWillLearnCard>

</HeroCards>


## Built for React from the ground-up

`Infinite Table` is built specifically for React and is fully declarative and fully typed. When you use `Infinite Table`, it feels at-home in your React application - every prop has both a controlled and uncontrolled version so you get full control over every area of the component.


<Sandpack>

<Description>

This is an example of how you might configure `InfiniteTable` in a real-world application and puts together several functionalities:
 * grouping
 * aggregation
 * pinned columns
 * sorting
 * multiple selection
 * custom cell rendering
 
</Description>

```ts file=full-demo.page.tsx
```

</Sandpack>


## Licensing

You can use `@infinite-table/infinite-react` in 2 ways:

- with a license - requests for licence quotations and additional quotations must be made by email to admin@infinite-table.com. After purchasing, you will receive a `licenseKey` which you will provide as a prop when you instantiate Infinite Table. This will make the [Powered by Infinite Table](infinite-table.com) footer go away.
- without a license, but it will include a [Powered by Infinite Table](infinite-table.com) link in the table footer. This way you can use it for free in any product, but make sure the footer is always visible when Infinite Table is visible. For demo purposes, we don't show any license error for embeds in [codesandbox.io](https://codesandbox.io) - which are used throughout this demo site. Check the demo below to see the license footer in action.

<Sandpack title="Invalid License Demo">

```ts file=invalid-license.page.tsx

```

```ts file=data.tsx

```

</Sandpack>


<HeroCards>
<YouWillLearnCard title="More on Licensing" path="/docs/learn/getting-started/licensing">
Read more about our licensing model and how you can use Infinite Table.
</YouWillLearnCard>

</HeroCards>


## About the Docs

> We're grateful for the work done by the [team behind reactjs.org](https://github.com/reactjs/reactjs.org) and the new React documentation found at [beta.reactjs.org](https://beta.reactjs.org/) - we've built our documentation on their excellent work 🙏 and we're grateful for that.

The documentation is versioned, and we will publish a new version of the documentation when there are any significant changes in the corresponding `@infinite-table/infinite-react` version.
