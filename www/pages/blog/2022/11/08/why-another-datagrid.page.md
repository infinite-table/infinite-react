---
title: "Why another React DataGrid?"
description: "Why is another DataGrid needed? A short history of datagrids and why Infinite Table is different"
draft: true
author: [admin]
---

We've been working on finding better ways to display tabular data for more that a decade now and collectively we have 25+ years of experience working on this.

It all began with the `<table />` component ...


## A (personal) history of datagrids

<Note >

This article is not meant to be a complete history of DataGrids. Rather, it's personal reflections on how we, the Infinite Table team, have experienced a long journey of using and building components for displaying tabular data, culminating in the creation of Infinite Table, the modern declarative DataGrid for React.

</Note>

### Desktop components

### Using the `table` with `table-layout: fixed`

Back in the days when the only way to show tabular data in the browser was to use the `<table />` component, the only way to make it perform decently was to use 

```css
table-layout: fixed;
```

this is telling the browser that it shouldn't compute the space available for all rows & cells in the table before rendering but instead size the columns based on the content of the first row. This is speeding up the rendering time by quite a lot, and it's the early solution to the problem of rendering large data-sets. However, it was not perfect, and rendering **huge** datasets was still a **huge** problem. Also, no fancy resizable / reorderable / stackable columns were available.


...

### [YUI DataTable](https://clarle.github.io/yui3/yui/docs/datatable/)

Enter YUI era - launched in 2006, the Yahoo! User Interface Library it was a step forward in reusability and component architecture. With the release of YUI 3, it received a modernized set of components, and the [DataTable](https://clarle.github.io/yui3/yui/docs/datatable/) was probably the most advanced DataGrid solution out there. The component had a templating engine under the hood and allowed developers to customize some parts of the table. For its time, it was packed with functionality and was a great solution for many use-cases. 

It had a rich API, exposing lots of events, callbacks and methods for things like moving a column around, getting the data record for a given row, adding rows and columns, etc - all imperative code. The API was powerful and allowed developers to build complex solutions, but it was all stateful and imperative - something very normal for its epoch, but something we've learned to avoid in the last few years.

Here's some code showcasing YUI DataTable

```js title=YUI_DataTable_with_sorting {6}
var table = new Y.DataTable({
    columns: [
        { key: 'item', width: '125px' },
        {
          key: 'cost',
          formatter: '£: {value}',
          sortable: true
        },
    ],
    sortable: true,
    data   : data
}).render("#example");

// to programatically sort
table.sort({'cost': 'asc'});
```

Notice in the code above, the component had support for custom formatters via a template (in the style of Mustache templates). YUI DataTable was a great component, certainly lacking some features by modern standards, but it was an amazingly rich component for its time. In some respects, it's still better than some of the modern DataGrids out there. The major missing piece is virtualization for both rows and columns in the table.

A nice feature YUI DataTable had was the ability to separate the DataSource component and the data loading into a separate abstraction layer, so it would be somewhat decoupled from the main UI component.

```js
var dataSource = new Y.DataSource.IO({
  source: "/restaurants/fetch.php?"
});

dataSource.plug(Y.Plugin.DataSourceXMLSchema, {
  schema: {
    resultListLocator: "Result",
    resultFields: [
      { key:"Title" },
      { key:"Phone" },
      { key:"Rating" }
    ]
  }
});
var table = new Y.DataTable({
    columns: ["Title", "Phone", "Rating"],
    summary: "Chinese restaurants near 98089",
});

table.plug(Y.Plugin.DataTableDataSource, {
  datasource: dataSource,
  initialRequest: "zip=94089&query=chinese"
});
```

Infinite Table is getting this a step further and splitting the data loading and the rendering into two separate components - the `<DataSource />` component is responsible for managing the data - fetching it, sorting, grouping, pivoting, filtering, etc and it makes it available via the React context to the `<InfiniteTable />` component which is responsible only for rendering the data. This means you can even use the `<DataSource />` component with another React component and implement your own rendering and virtualization.

```tsx
<DataSource<DataEntity> primaryKey="id" data={...}>
  {/* if you wanted to, you can replace <InfiniteTable/> with your own custom component */}
  <InfiniteTable<DataEntity> columns={...}> 
</DataSource>
```

This level of separation allows us to iterate more rapidly on new features and also makes testing 🧪 easier.

### [ExtJS 3](https://docs.sencha.com/extjs/3.4.0/#!/api/Ext.grid.GridPanel)

The next solution we've worked with was ExtJS version 3, which was built on the legacy of YUI 3. At the time, back in 2010 it was the most advanced DataGrid solution out there - used for some of the most complex applications in the enterprise world, from CMSs to ERP systems. 

The ExtJS 3 DataGrid brought excellent product execution in a few ares:
 - the [documentation](https://docs.sencha.com/extjs/3.4.0/) was excellent for its time - very rich, easy to navigate and search, with useful examples
 - it came together with a rich set of components for building complex UIs - grids, trees, combo-boxes, form inputs, menus, dialogs, etc. Powerful layout components were available, which allowed developers to build complex app layouts.
 - enthusiastic community - the forums were very active and the community was writing lots of good plugins.

```js title=ExtJS_3_DataGrid_code_snippet

var grid = new Ext.grid.GridPanel({
  // data fetching abstracted in a "Store" component
  store: new Ext.data.Store({
    // ...
  }),
  // columns abstracted in a ColumnModel
  colModel: new Ext.grid.ColumnModel({
    defaults: {
      width: 120,
      sortable: true
    },
    columns: [
      {id: 'company', header: 'Company', width: 200, sortable: true, dataIndex: 'company'},
      {header: 'Price', renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
      {header: 'Change', dataIndex: 'change'},
      {header: '% Change', dataIndex: 'pctChange'},
      {
        header: 'Last Updated', width: 135, dataIndex: 'lastChange',
        xtype: 'datecolumn', format: 'M d, Y'
      }
    ]
  }),
  viewConfig: {
    forceFit: true,
    // Return CSS class to apply to rows depending upon data values
    getRowClass: function(record, index) {
      var c = record.get('change');
      if (c < 0) {
        return 'price-fall';
      } else if (c > 0) {
        return 'price-rise';
      }
    }
  },
  sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
  // size need if not inside a layout
  width: 600, 
  height: 300,
});
```
Building on the legacy of YUI 3, the ExtJS added virtualization to make the DataGrid performant for large datasets - it really made the component fly - since there was no framework overhead, and ExtJS was working directly with the DOM, the scrolling experience was pretty smooth.

Also ExtJS tried to make things declarative and you could describe most of your UI by nesting JavaScript objects into a root object. The idea was clever, but it was only applicable for the initial rendering and you had to write imperative code as soon as you wanted some changes after the initial render. 

<Gotcha title="">

It was while working on a project with ExtJS 3 and exploring everything it had to offer that we had the great idea 😅 that we should start writing a DataGrid component. We were digging deep into ExtJS source code, wrote a few plugins for it and then decided to take the challenge and build a brand new DataGrid 😱. It was supposed to take us just a few short months 😅...

</Gotcha>

## Enter [React](https://reactjs.org/)

We were quite far in building the DataGrid component, with a dedicated templating engine under the hood (by the way, it was really performant in comparison to similar solutions at that time), virtualization implemented and major functionalities finished ... when JSConf EU 2013 happened.

### JSConf EU 2013

We vividly remember [watching Pete Hunt talk about ReactJS and rethinking best practices](https://www.youtube.com/watch?v=x7cQ3mrcKaY) at JSConf EU 2013.

<YTEmbed url="https://www.youtube.com/embed/x7cQ3mrcKaY?start=25" />

By the time the presentation was finished we knew we had to do something.

This declarative way of describing the UI got us hooked and we knew we had to **drop what we were doing and adopt React** for anything going forward. It proved to be the right decision and we were early adopters of React. It was astonishing to us how easy it was to learn React at the time - only took us a few hours to fully grasp the mental model and start building reusable components.

<Gotcha title="The move to React">
2013 was the year we switched trajectory and went full-React with all our new projects. We went back to the drawing board and started our first experiments with a DataGrid component in React. 
</Gotcha>

While we were building a DataGrid in React we got side-tracked with other projects but we saw the same pattern again and again - people trying to implement the grid component again and again, in various projects.

### [AG Grid](https://www.ag-grid.com/)

It was around this time, in 2015, that AG Grid was launched and we adopted it in all kind of projects while still trying to find time on the side to build our own DataGrid solution, the React way, with a fully declarative API.

We were inspired 🙏 by AG Grid, seeing the breadth of features it offers and its expansive growth. It is a feat of engineering and shows how much the browser can be pushed by extensive use of virtualization - being able to render millions of rows and thousands of columns is no small feat. All this while keeping the performance similar as if it was rendering just a few rows and columns.

<CodeSandboxEmbed src="https://codesandbox.io/embed/festive-chebyshev-6smcpz?fontsize=14&module=%2Findex.js&theme=dark" />

In the code above ([taken from AG Grid getting started page](https://www.ag-grid.com/javascript-data-grid/getting-started/#copy-in-application-code)), note AG Grid is exposing its [API](https://www.ag-grid.com/javascript-data-grid/grid-api/) on the `gridOptions` object. The API is huge and allow you to do pretty much anything you want with the grid - in an imperative way, which is what you're probably looking if you're not integrating with a library/framework like Angular or React.

After vanilla JavaScript and Angular versions of AG Grid, a React version was finally released. It was a step in the right direction - to make AG Grid more declarative - though it was a thin wrapper around React, with all the renderers and API still being imperative and not feeling like the best fit inside a React app.

A few years later, AG Grid finally released a `reactUI` [version](https://blog.ag-grid.com/react-ui-overview/), with tighter integration with React and a more declarative API ❤️

### [React Table](https://react-table.tanstack.com/)

Praise React Table... headless, configurability, etc

## Infinite Table

We followed the DataGrid component space closely for more than 10 years now and during all those years we kept an eye on other components out there to get inspired and get fresh ideas from various teams and projects - either enterprise or open source - either full-fledged and heavy implementation or headless components like [react-table](https://tanstack.com/table/v8/), which we also used in some projects 🙏.

We've learned a lot from all these projects we've worked with and we've put all the best ideas in Infinite Table. Infinite is the fruit of years of iteration, experimentation, failures and sweat on a product that we've poured our hearts in over the course of so many years. We've agonized over all our APIs and design decisions in order to make Infinite Table the best DataGrid component out there. We're aware we're not there yet, but we're here to stay 👋 and keep getting better.

It's amazing what happens when you focus on a problem for such a long time (yeah, we know 😱). We wanted to give up several times but kept pushing for over a decade. The result is a component that we're proud of and that's already been used in production by enterprise clients across many industries (more on that later).

### Ready to use

Infinite Table is ready to use out of the box - namely it's not headless. We target customers who want to ship — faster! We're aware you don't want to re-invent the wheel nor do you want to invest 6 months of your team to build a poor implementation of a DataGrid component that will be hard to maintain and will be a source of bugs and frustration. **You want to ship — and soon!**. If this is you and you are already using React then Infinite Table is written for you!

### Feels like React - declarative API

We want Infinite Table to feel at home in any React app. Everything about the DataGrid should be declarative - when you want to update the table, change a prop and the table will respond. No imperative API calls - we want you to be able to use Infinite Table in a way that feels natural to you and your team, so you can stay productive and use React everywhere in your frontend. 

### Fully controlled

React introduced controlled components to the wider community and we've been using them for years. It's were the power of React lies - it gives the developer the flexibility to fully control (when needed) every input point of an app or component.

All the props Infinite Table is exposing have both controlled and uncontrolled versions. This allows you to start using the component very quickly and without much effort, but also gives you the flexibility to fully control the component when needed, as your app grows and you need more control over the DataGrid.

### Composable API with small API surface

When building a complex component, there are two major opposing forces: adding functionality and keeping the component (and the API) simple. We're trying to reconcile both with Infinite Table and building everything with composition in mind.

A practical example of composition is favoring function props instead of boolean flags. Why implement a feature under a boolean flag when you can expose a functionality via a function prop? The function prop can be used to handle more cases than any boolean flag could ever handle! Another example is exposing the same prop both as an object and as a function

TODO find a better composability example

```tsx title=Row_style_as_an_object
<InfiniteTable 
  //...
  rowStyle= {{}}
/>
```
vs
```tsx title=Row_style_as_a_function
<InfiniteTable 
  //...
  rowStyle={() => {
    return {...}
  }}
/>
```


We've learned from our experience with other DataGrid components that the more features you add, the more complex your API becomes. So we tried to keep the API surface as small as possible, while still offering a rich set of declarative props as building blocks that can be composed to accomplish more complex functionalities.


## Conclusion

We're very excited to share Infinite Table with the community and we're looking forward to hearing your feedback and suggestions.

After years in the DataGrid space and working and agonizing on this component, we're happy to release it to the frontend community. We're looking forward to [your feedback](https://github.com/infinite-table/infinite-react/issues) and suggestions.

We're here to stay and we're committed to improve Infinite Table and make it your go-to DataGrid component to help you ship — faster!