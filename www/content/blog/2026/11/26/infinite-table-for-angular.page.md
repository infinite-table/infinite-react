---
title: Infinite Table 11.0.0 — now for Angular
description: Infinite Table 11.0.0 ships @infinite-table/infinite-angular, the same DataGrid as the React and Vue versions, built from the same source, as standalone Angular components with signal inputs, models and outputs.
date: 2026-11-26
author: radu
tags: release, angular
---

Infinite Table `11.0.0` is out, and with it the first release of `@infinite-table/infinite-angular`: Infinite Table for Angular.

```sh
npm install @infinite-table/infinite-angular
```

It is the same DataGrid you can already use in React and Vue — same virtualization, same data pipeline, same grouping, pivoting, aggregations, tree data, selection, filtering and editing — now as standalone Angular components. It needs Angular `22`.

## The same grid, built from the same source

When we released [9.0.0](/blog/2026/09/07/infinite-table-9-0-0), we said the engine underneath the grid no longer needed to know which framework was rendering it, and that we were using that to build a Vue version. Angular is the third framework on top of that engine.

This is not a wrapper around the React grid, and it is not a separate codebase that has to catch up. The Angular package is built from the same source tree as the React and Vue ones: the engine is shared, and only the rendering layer is written for Angular. A fix or a new feature in the engine lands in all three at once, which is also why the three packages are released together and share a version number — from now on, `@infinite-table/infinite-react`, `@infinite-table/infinite-vue` and `@infinite-table/infinite-angular` all move together.

The same functional test suite that runs against the React and Vue builds runs against the Angular one too, and the CI that gated this release ran all three.

## What it looks like

```ts file="/docs/learn/getting-started/meet-the-code.demo.angular.ts"
```

And add the CSS to your global styles — in the `styles` of your build options in `angular.json`, or at the top of `src/styles.css`:

```css
@import '@infinite-table/infinite-angular/index.css';
```

## Native to Angular

Our goal for every framework is the same: the grid should feel like it was written for it. In React that means props, render functions and hooks. In Angular it means:

- **Standalone components, signals and `OnPush`.** No `NgModule` to import, and no zone.js needed.
- **Inputs with the same names as the React props.** `[columns]`, `[columnDefaultWidth]`, `[groupBy]` — everything in the docs maps one to one. Templates are type-checked against your data type with `strictTemplates`.
- **State is a `model()`.** The state the user changes — sorting, selection, column order, column sizes, and so on — is a model you bind two-way to a signal:

  ```html
  <infinite-data-source [data]="data" primaryKey="id" [(sortInfo)]="sortInfo">
    <infinite-table [columns]="columns" />
  </infinite-data-source>
  ```

  If you don't need to own the state, use the uncontrolled input instead (`[defaultSortInfo]`), with nothing bound back.
- **Callbacks are outputs.** `(sortInfoChange)`, `(cellClick)`, `(ready)`.
- **Custom rendering with templates or components.** Columns stay plain objects. Their `render*` functions return text, a `TemplateRef`, or a component through `renderComponent()` — and the component reads its cell with `injectColumnCell()`, which gives you a signal:

  ```ts file="/docs/learn/columns/column-rendering.snippet.angular.ts" region="use-infinite-column-cell"
  ```
- **The imperative API is on the component.** Grab it with a template reference — `#grid="infiniteTable"` — and call `grid.api()`.

## The docs speak Angular

The whole documentation site has an Angular version. Every page in <a href="/angular/docs" data-framework-explicit="" className="text-link hover:underline underline-offset-5 hover:text-link/80">the Angular docs</a> shows Angular code, and the live demos on those pages are real Angular apps you can edit and run in the browser.

Start with <a href="/angular/docs/learn/getting-started" data-framework-explicit="" className="text-link hover:underline underline-offset-5 hover:text-link/80">Getting Started</a>, or have a look at the [Angular home page](/angular) for a million rows, pivoting and themes running in Angular.

## What's not there yet

The Angular package has the same feature set as the Vue one. A few things from the React version are not in it yet: the grouping toolbar, the DevTools extension integration, and menus are limited to items. Everything else — grouping, pivoting, aggregations, tree grid, master-detail, lazy loading, live pagination, selection, filtering, editing, keyboard navigation, theming — is there.

## Licensing

`@infinite-table/infinite-angular` has the same license as the React and Vue packages. Without a license key, the grid shows a "Powered by Infinite Table" footer. With one, provide it once for every grid of your application:

```ts file="/docs/learn/getting-started/index.snippet.angular.ts" region="license-key"
```

A license key works for all three frameworks. See <a href="/angular/docs/learn/getting-started/licensing" data-framework-explicit="" className="text-link hover:underline underline-offset-5 hover:text-link/80">licensing</a> and [pricing](/pricing) for the details.

## For React and Vue users

`11.0.0` is a major version because it is the release that brings the Angular package, and because the three packages now share their version. There are no breaking changes in the React or Vue APIs, so upgrading from `10.x` should be a version bump:

```sh
npm install @infinite-table/infinite-react@11
# or
npm install @infinite-table/infinite-vue@11
```

We would love to hear how the Angular version works for you — what feels native, what doesn't, and what breaks. Open an issue on [GitHub](https://github.com/infinite-table/infinite-react/issues) and let us know.
