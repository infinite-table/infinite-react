# InfiniteTable

> InfiniteTable - the most productive React Table

## Overview

Our approach with the `InfiniteTable` is to go documentation first. From our developer experience we know that most software products lack a good documentation. So we want to be different and start with the documentation first since our purpose is to have an outstanding documentation that developers can actually use.

### Development process

You can start the examples by running:

```sh
$ npm run dev
```

#### Running the docs

```sh
$ npm run docs
```

## HTML & CSS conventions

We offer a set of utility css classes. They all respect the following rules

- they only contain one rule
- they start with `at__` - the prefix
- after the prefix comes the name of the css property they contain
- then comes `=`
- then comes the value for the css property

### Examples

```jsx
// JSX code

//flex-flow: row
<div className="at__flex-flow=row" />

//overflow: auto
<div className="at__overflow=auto" />

//left: 0
<div className="at__left=0" />

//width: 100%
<div className="at__width=100%" />

//transform: translate3d(0, 0, 0)
<div className="at__transform=translate3d-0-0-0" />

```

### HTML Element classNames

- The table has the `ITable` className, and all HTML elements are prefixed with that.

- All meaningful table parts (table row, header, cell) keep capitalized names, for example:

  - `ITableRow`
  - `ITableHeader`
  - `ITableCell` - all cells, both in body and in header
  - `ITableHeaderCell` - cells in header
  - `ITableColumnCell` - cells in body rows

- Other HTML elements, which are nested inside those table parts, will be prefixed with the table part where they are nested, followed by `_`. Example:

  - `ITableCell_content`

### CSS variables

There are 2 kinds of variables:

- top-level
- component specific

All CSS variables meant primarily to be applied to a specific css property, will end up with `__<property-name>`, like this:

- `--it__border-radius`

#### CSS top-level variables

Those are prefixed with `at-`. Examples:

- `--it-font-size-0`
- `--it-space-0`
- `--it-space-1`
- `--it-color-....`

The ones meant primarily for a CSS property name will end with `__<property-name>`, like this:

- `--it__border-radius`
