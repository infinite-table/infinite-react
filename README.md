
<div align="center">

<h1>
<b>Infinite Table</b>
</h1>
<h3> huge datasets are no longer a problem</h3>
  <a href="https://infinite-table.com">
    <img width="150px" height="170px" alt="InfiniteTable Logo" src="https://infinite-table.com/logo-infinite.svg">
  </a>

</div>

## Table Of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Documentation](#documentation)
- [Development process](#development-process)
  - [Running the docs](#running-the-docs)
- [Testing](#testing)
  - [Testing in development](#testing-in-development)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## [Documentation](https://infinite-table.com/docs)

Our approach with the `InfiniteTable` is to go documentation first. From our developer experience we know that most software products lack a good documentation. So we want to be different and start with the documentation first since our purpose is to have an outstanding documentation that developers can actually use.

**[Visit API docs](https://infinite-table.com/docs)**

## Development process

You can start the examples by running:

```sh
$ npm run dev
```

### Running the docs

```sh
$ npm run docs
```
<!-- 
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

- `--it__border-radius` -->



## Testing

Infinite Table is built with extensive end-to-end testing via headless chrome (more exactly, puppeteer).
To execute the tests you have to run:

```sh
$ npm run test
```

Test pages are found in [tests folder](./source/examples/src/pages/tests) - which is part of a nextjs app where every file ending with `.page.tsx` is a page/route, while it's sibling file with the same name, but ending in `.test.tsx` is the actual test code. The test code is visiting the sibling page/route, to load the page and executes assertions against the test page.

The test command command above does 3 things:
 
 * compiles the nextjs app found in the [examples folder](./source/examples) - runs `next build && next export`, which creates an `out` folder with the resulting examples/tests app
 * starts a webserver that serves the generated `out` folder on [localhost:3000](http://localhost:3000)
 * runs jest+puppeteer against the app served at [localhost:3000](http://localhost:3000)

### Testing in development

If you want to run the tests in dev mode, to get feedback sooner, you need to run the following (in the [source/examples folder](./source/examples)):

 * `npm run dev` - to run the nextjs app in development, on port `3000`
 * `npm run test:watch` to run jest on changed files - optionally add a test path pattern like `npm run test:watch -- --testPathPattern=x/y/z`

## License 

[Commercial License](https://github.com/infinite-table/react-table/blob/master/source/LICENSE.md)