---
title: Getting started
---

`Infinite Table` is a UI component for data virtualization - helps you display huge datasets of tabular data.

It's built specifically for React from the ground up and with performance in mind.


# Installation

`Infinite Table` is available on the public npm registry - install it by running the following command:

<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

## Meet the code

<Sandpack>

```ts file=meet-the-code.page.tsx
```

```ts file=data.tsx
```

</Sandpack>

## Using the components

In the code snippet above, you notice we're using 2 components:

- `DataSource` - this needs to be a parent (or ancestor, at any level) of the `InfiniteTable` component - it controls which `data` the table below is rendering
- `InfiniteTable` - the actual virtualized table component - needs to be inside a `DataSource`

Both components are named exports of the `@infinite-table/infinite-react` package.

## Licensing

You can use `@infinite-table/infinite-react` in 2 ways:

- without a license, but it will include a [Powered by Infinite Table](infinite-table.com) link in the table footer. This way you can use it for free in any product, but make sure the footer is always visible when Infinite Table is visible.
- with a license - requests for licence quotations and additional quotations must be made by email to admin@infinite-table.com. After purchasing, you will receive a `licenseKey` which you will provide as a prop when you instantiate Infinite Table. This will make the [Powered by Infinite Table](infinite-table.com) footer go away.

### About the docs

> We're grateful for the work done by the [team behind reactjs.org](https://github.com/reactjs/reactjs.org) and the new React documentation found at [beta.reactjs.org](https://beta.reactjs.org/) - we've built our documentation on their excellent work 🙏 and we're grateful for that.

The documentation is versioned, and we will publish a new version of the documentation when there are any significant changes in the corresponding `@infinite-table/infinite-react` version.
