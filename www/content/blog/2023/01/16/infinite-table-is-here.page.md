---
title: "📣 Infinite Table is Here 🎉"
description: "Infinite Table is ready for prime time. With version 1.0.0 we're releasing a DataGrid that's feature packed and ready to be used in enterprise-grade apps"
author: [admin]
---

*Infinite Table React is ready for prime time.*

*With version 1.0.0 we're releasing a DataGrid that's feature packed and ready to be used in the wild!*


<Note title="Why use Infinite Table?">

1️⃣ seriously fast

2️⃣ no empty or white rows while scrolling

3️⃣ packed with features

4️⃣ built from the ground up for React

5️⃣ clear, concise and easily composable props & API

</Note>

We think you'll love Infinite Table. 

This is the DataGrid we would have loved to use more than 15 years ago when [we started working with tables in the browser](/blog/2022/11/08/why-another-datagrid). 

And now it's finally here 🎉.

### Built from the Ground Up with React & TypeScript

#### React all the Way

Infinite Table feels native to React, not as a after-thought, but built with React fully in mind.

It's declarative all the way and exposes everything as props, both controlled and uncontrolled.

If you don't like the default behavior of a prop, use the controlled version and implement your own logic and handling - see for example the [following props related to column order](/docs/reference/infinite-table-props#search=columnorder):

* <PropLink name="columnOrder" /> - controlled property for managing order of columns
* <PropLink name="defaultColumnOrder" /> - uncontrolled version of the above
* <PropLink name="onColumnOrderChange" /> - callback prop for notifications and for updating controlled column order


#### Fully Controlled

React introduced controlled components to the wider community and we've been using them for years.

It's where the power of React lies - giving the developer the flexibility to fully control (when needed) every input point of an app or component.

All the props which Infinite Table exposes, have both controlled and uncontrolled versions. This allows you to start using the component very quickly and without much effort, but also with the all-important flexibility to fully control the component when needed, as your app grows and you need more control over the DataGrid.


#### TypeScript & Generic Components

Infinite Table is also built with TypeScript, giving you all the benefits of a great type system.

In addition, the exposed components are exported as generic components, so you can specify the type of the data you're working with, for improved type safety.


```tsx
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react'

type Person = { id: number, name: string, age: number}

const data: Person[] = [
  { id: 1, name: 'John', age: 25 },
  //...
];
const columns = {
  id: { field: 'id' },
  name: { field: 'name' },
}

// ready to render
<DataSource<Person> data={data} primaryKey="id">
  <InfiniteTable<Person> columns={columns} />
</DataSource>
```

### Why Use Infinite Table, cont.

#### Fast - virtualization

Infinite Table is fast by leveraging **virtualization** both **vertically** (for rows) and **horizontally** (for columns). 

This means DOM nodes are created only for the visible cells, thus reducing the number of DOM nodes and associated memory strain and improving performance.

####  No white space while scrolling - clever layout & rendering

In addition to virtualization, we use clever layout & rendering techniques to avoid white space while scrolling.

When you scroll, the table will not show any empty rows or white space - no matter how fast you're scrolling!

<Note>

We think this is one of the features that sets us apart from other components.

We've spent a lot of time and effort making sure no whitespace is visible while scrolling the table.

</Note>

### Batteries Included

We want you to be productive immediately and stop worrying about the basics. Infinite Table comes with a lot of features out of the box, so you can focus on the important stuff.

It helps you display huge datasets and get the most out of your data by providing you the right tools to enjoy these features:

- [<img src="/icons/sorting.svg" style={{display: 'inline-block'}} /> sorting](/docs/learn/working-with-data/sorting)
- [<img src="/icons/row-grouping.svg" style={{display: 'inline-block'}} /> row grouping](/docs/learn/grouping-and-pivoting/grouping-rows) - both server-side and client-side
- [<img src="/icons/pivoting.svg" style={{display: 'inline-block'}} /> pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview) - both server-side and client-side
- [<img src="/icons/aggregations.svg" style={{display: 'inline-block'}} /> aggregations](/docs/learn/grouping-and-pivoting/grouping-rows#aggregations)
- [<img src="/icons/live-pagination.svg" style={{display: 'inline-block'}} /> live pagination](/docs/learn/working-with-data/live-pagination)
- [<img src="/icons/lazy-loading.svg" style={{display: 'inline-block'}} /> lazy loading](/docs/learn/working-with-data/lazy-loading)
- [<img src="/icons/keyboard-navigation.svg" style={{display: 'inline-block'}} /> keyboard navigation](/docs/learn/keyboard-navigation/navigating-cells)
- [<img src="/icons/fixed-flex-cols.svg" style={{display: 'inline-block'}} /> fixed and flexible columns](/docs/learn/columns/fixed-and-flexible-size)
- [<img src="/icons/column-grouping.svg" style={{display: 'inline-block'}} /> column grouping](/docs/learn/column-groups)
- [<img src="/icons/theming.svg" style={{display: 'inline-block'}} /> theming](/docs/learn/theming)
- ... and many others

Infinite Table is built for companies and individuals who want to ship — faster 🏎!

### (Almost) No External Dependencies

We've implemented everything from scratch and only directly depend on 2 packages (we'll probably get rid of them as well in the future) - all our dependecy graph totals a mere 3 packages.

<Note>

We've reduced external dependencies for 2 main reasons:
 - avoid security issues with dependencies (or dependencies of dependencies...you know it) - remember left-pad?
 - keep the bundle size small

</Note>

### Composable API - with a small surface

When building a component of this scale, there are two major opposing forces: 

 * adding functionality
 * keeping the component (and the API) simple
 
We're continually trying to reconcile both with Infinite Table, so we've built everything with composition in mind.

<Note>

A practical example of composition is favouring function props instead of boolean flags or objects. Why implement a feature under a boolean flag or a static object when you can expose a functionality via a function prop? The function prop can be used to handle more cases than any boolean flag could ever handle!

</Note>

A good example of composability is the <PropLink name="groupColumn" /> prop which controls the columns that are generated for grouping.

It can be either a column object or a function:

 * when it's a column object, it makes the table render a single column for grouping (as if <PropLink name="groupRenderStrategy" /> was set to `"single-column"`)
 * when it's a function, it behaves like <PropLink name="groupRenderStrategy" /> is set to `"multi-column"` and it's being called for each of the generated columns.
 

```tsx title="Group_column_as_an_object"
<InfiniteTable 
  //...
  groupColumn= {{
    header: 'Groups'
  }}
/>
```
vs
```tsx title="Group_column_as_a_function"
<InfiniteTable 
  //...
  groupColumn={() => {
    // this allows you to affect all generated group columns in a single place
    // especially useful when the generated columns are dynamic or generated via a pivot
    return {...}
  }}
/>
```

Our experience with other DataGrid components taught us that the more features you add, the more complex your API becomes.

So we tried to keep the API surface as small as possible, while still offering a rich set of declarative props as building blocks that can be composed to accomplish more complex functionalities.


### Built for the community, available on NPM

We're thrilled to share Infinite Table with the world.

We wanted to make it very easy for everyone to [get started](/docs/learn/getting-started) with it, so all you require is just an npm install:

<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

The component will show a footer with a [Powered by Infinite Table](https://infinite-table.com) link displayed. However, all the functionalities are still available and fully working. So if you keep the link visible, you can use the component for free in any setup!

Although you can use Infinite Table for free, we encourage you to [purchase a license](/pricing) - buying a license will remove the footer link. This will help us keep delivering new features and improvements to the component and support you and your team going forward!


<HeroCards>
<YouWillLearnCard title="Start right now!" path="/docs/learn/getting-started">
Get started with Infinite Table and learn how to use it in your project.
</YouWillLearnCard>

<YouWillLearnCard title="Get a license" path="/pricing" buttonLabel="Buy a License">
Get Infinite Table for your project and team!
</YouWillLearnCard>
</HeroCards>

