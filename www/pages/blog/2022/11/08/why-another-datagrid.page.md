---
title: "Why Another React DataGrid?"
description: "Why is another DataGrid needed? A short history of datagrids and why Infinite Table is different"
author: [admin]
---

We've been working on finding better ways to display tabular data for over 2 decades now and collectively we have 35+ years of experience working on this.

It all began on the desktop with a great range of DataGrids and then we moved to the web and the `<table />` component - yeah, we've been around for quite some while - all the while dealing with the same problems and requirements again and again. 

This is the story of how we got to where we are today....

## A (personal) History of DataGrids

<Note >

This article is not meant to be a complete history of DataGrids. 

Rather, it's personal reflections on the long journey the Infinite Table team have experienced while using and building components for displaying tabular data, culminating in Infinite Table, the modern declarative DataGrid for React.

</Note>

## Desktop Components

DataGrids have been around as long as any of us can remember.

They are a vital tool which allows business users to visualise, edit, manage and personalise their data.

Before Tim Berners-Lee and his colleagues changed the world for ever (and for a couple of decades after), "serious" business applications lived on the desktop.

This was accompanied and facilitated by a plethora of great DataGrids from the likes of DevExpress, Telerik, Syncfusion, Infragistics and others.

These products defined the feature-set that users came to expect in a DataGrid - row grouping, formatting, multiple sorting, pivoting etc. 

And which any DataGrid worth its salt today needs to offer today.

For 2 decades and more these DataGrid repeatedly proved their worth in multiple changing desktop formats - MFC, WinForms, WPF and others.


## Enter the Browser

And then the browser came along and, in time, everything changed.

While it really took until HTML5 to convince most power users to move from the desktop to the web, the need to display tabular data in the browser was there right from the start.

Initially the only way to show tabular data in the browser was to use the `<table />` component, and it was this piece of code that made it happen:

```css
table-layout: fixed;
```

this is telling the browser ([see MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout#values)) that it shouldn't compute the space available for all rows & cells in the table before rendering but instead size the columns based on the content of the first row. This is speeding up the rendering time by quite a lot, and it's the early solution to the problem of rendering large data-sets.

However, it was not perfect, and rendering **large** datasets was still a **huge** problem. Also, no fancy resizable / reorderable / stackable columns were available - at least not by default.

These shortcomings were obvious to developers dealing with massive datasets, so various groups and companies started coming up with solutions. One such solution came from Yahoo! as part of their larger widget library called `YUI` (it was back in the days when Y! was a big deal).

### YUI DataTable

Enter YUI era - launched in 2006, the Yahoo! User Interface Library was a step forward in reusability and component architecture. With the release of YUI 3, it received a modernized set of components, and the [YUI DataTable](https://clarle.github.io/yui3/yui/docs/datatable/) was probably the most advanced DataGrid solution out there. The component had a templating engine under the hood and allowed developers to customize some parts of the table. For its time, it was packed with functionality and was a great solution for many use-cases. 

It had a rich API, exposing lots of events, callbacks and methods for things like moving columns around, getting the data record for a given row, adding rows and columns, etc - all imperative code. The API was powerful and allowed developers to build complex solutions, but it was all stateful and imperative - something very normal for its epoch, but something we've learned to avoid in the last few years.

Here's some code showcasing the YUI DataTable

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

Notice in the code above, the component had support for custom formatters via a template (in the style of Mustache templates). YUI DataTable was a great component, certainly lacking some features by modern standards, but it was amazingly rich for its time. In some respects, it's still better than some of the modern DataGrids out there. The major missing piece is virtualization for both rows and columns in the table.

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

Infinite Table is getting this a step further and splitting the data loading and the rendering into two separate components - `<DataSource />` and `<InfiniteTable />`:
 * the `<DataSource />` component is responsible for managing the data - fetching it, sorting, grouping, pivoting, filtering, etc and making it available via the React context to the UI component.
 * the `<InfiniteTable />` component is responsible only for rendering the data. This means you can even use the `<DataSource />` component with another React component and implement your own rendering and virtualization.

```tsx
<DataSource<DataEntity> primaryKey="id" data={...}>
  {/* if you wanted to, you can replace
   <InfiniteTable/> with your own custom component */}
   
  <InfiniteTable<DataEntity> columns={...}> 
</DataSource>
```

This level of separation allows us to iterate more rapidly on new features and also makes testing 🧪 easier.

### [ExtJS 3](https://docs.sencha.com/extjs/3.4.0/#!/api/Ext.grid.GridPanel)

The next solution we've worked with was ExtJS version 3, which was built on the legacy of YUI 3. At the time, back in 2010, it was the most advanced DataGrid solution out there - used for some of the most complex applications in the enterprise world, from CMSs to ERP systems. 

The ExtJS 3 DataGrid brought excellent product execution in a few areas:
 - the [documentation](https://docs.sencha.com/extjs/3.4.0/) was excellent for its time - very rich, easy to navigate and search, with useful examples. As a bonus, from the docs you had access to the source-code of all components, which was a nice addition.
 - it came together with a rich set of components for building complex UIs - grids, trees, combo-boxes, form inputs, menus, dialogs, etc. Powerful layout components were available, which allowed developers to build complex app layouts by composing components together - and everything felt like it was part of the same story, which it was.
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
      {
        id: 'company', header: 'Company', width: 200,
        sortable: true, dataIndex: 'company'
      },
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
Building on the legacy of YUI 3, the ExtJS added virtualization to make the DataGrid perform well for large datasets - it really made the component fly - since there was no framework overhead, and ExtJS was working directly with the DOM, the scrolling experience was pretty smooth.

Also ExtJS tried to make things declarative and you could describe most of your UI by nesting JavaScript objects into a root object. The idea was clever, but it was only applicable for the initial rendering and you had to write imperative code as soon as you wanted some changes after the initial render. 

<Gotcha title="What If...">

It was while working on a project with ExtJS 3 and exploring everything it had to offer that we had the great idea 😅 that we should start writing a DataGrid component. 

We were digging deep into ExtJS source code, wrote a few plugins for it and then decided to take the challenge and build a brand new DataGrid 😱. 

It was supposed to take us just a few short months 😅...

</Gotcha>

## The React Revolution

We were quite far in building the DataGrid component, with a dedicated templating engine under the hood (by the way, it was really good in comparison to similar solutions at that time), virtualization implemented and major functionalities finished ... when JSConf EU 2013 happened.

### JSConf EU 2013

We vividly remember [watching Pete Hunt talk about ReactJS and rethinking best practices](https://www.youtube.com/watch?v=x7cQ3mrcKaY) at JSConf EU 2013.

<YTEmbed url="https://www.youtube.com/embed/x7cQ3mrcKaY?start=25" />

By the time the presentation was finished we knew we had to do something.

This declarative way of describing the UI got us hooked and we knew we had to **drop what we were doing and adopt React** for anything going forward. It proved to be the right decision and we were early adopters of [React](https://reactjs.org/). It was astonishing to us how easy it was to learn React at the time - only taking a few hours to fully grasp the mental model and start building reusable components.

<Gotcha title="The move to React">
2013 was the year we switched trajectory and went full-React with all our new projects. We went back to the drawing board and started our first experiments with a DataGrid component in React. 
</Gotcha>

While we were building the DataGrid in React we got side-tracked with other projects but we saw the same pattern again and again - people trying to implement the grid component again and again, in various projects. Most of those attempts either failed terribly or at best they were good-enough for a simple use-case.

### AG Grid

It was around this time, in 2015, that [AG Grid](https://www.ag-grid.com/) was launched. 

And, wow, it was good - very good.

We immediately adopted it in all kind of projects while still trying to find time on the side to build our own DataGrid solution, the React way, with a fully declarative API.

We were inspired 🙏 by AG Grid, seeing the breadth of features it offers and its expansive growth. 

It is a feat of engineering which illustrates just how much the browser can be pushed by extensive use of virtualization - being able to render millions of rows and thousands of columns is no small feat. 

All this while keeping the performance similar as if it was rendering just a few rows and columns.

<CodeSandboxEmbed src="https://codesandbox.io/embed/infallible-waterfall-csjcns?fontsize=14&module=%2Findex.js&theme=dark" />

In the code above ([taken from AG Grid getting started page](https://www.ag-grid.com/javascript-data-grid/getting-started/#copy-in-application-code)), note that AG Grid is exposing its [API](https://www.ag-grid.com/javascript-data-grid/grid-api/) on the `gridOptions` object. 

The API is huge and allow you to do pretty much anything you want with the grid - in an imperative way, which is what you're probably looking for if you're not integrating with a library/framework like Angular or React.

After vanilla JavaScript and Angular versions of AG Grid, a React version was finally released. 

It was a step in the right direction - to make AG Grid more declarative - though it was a thin wrapper around React, with all the renderers and API still being imperative and not feeling like the best fit inside a React app.

A few years later, AG Grid finally released a `reactUI` [version](https://blog.ag-grid.com/react-ui-overview/), with tighter integration with React and a more declarative API ❤️

All this time other solutions popped up in the React community.

### React Table

One such solution that got massive adoption from the community was [React Table](https://tanstack.com/table/v8/) - now rebranded as TanStack Table.

It's growth began around 2018, around the time when headless UI components started to gain traction. 

React Table was one of the first popular headless UI components to be released - in the same category it's worth mentioning [Downshift](https://www.downshift-js.com/) (initially launched and popularized by [Kent C. Dodds](https://kentcdodds.com/)), which helped push headless UI components to the community.

React Table is a great solution for people who want to build their own UI on top of it. 

Some of the benefits of headless UI approach you get from React Table are:
* full control over markup and styles
* supports all styling patterns (CSS, CSS-in-JS, UI libraries, etc)
* smaller bundle-sizes.

This flexibility and total control come with a cost of needing more setup, more code and more maintainance over time. Also complex features that might already be implemented in a full-featured DataGrid will need to be implemented again from scratch.

However, we do think it's a great 💯 fit for some use-cases - we've used it ourselves successfully in some projects 🙏. But it's not for everyone, as in our experience, most teams today want to ship faster 🏎 and not spend time and mental energy on building their own UI.

<CSEmbed src="https://codesandbox.io/embed/github/tanstack/table/tree/main/examples/react/column-groups?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fmain.tsx&theme=dark" />

Notice in the code above how you're responsible for creating the markup for the table, the headers, column groups,the cells, etc. You have TOTAL control over overy aspect of the component, but this means you have to own it!

At the other end of the spectrum is AG Grid a full-featured DataGrid that offers all this out of the box. 

With Infinite Table, we're trying to strike a balance between these 2 very different approaches - by offering a declarative API that is easy to use and get started with, while still giving you the flexibility to customize the UI and the behavior of the component, via both controlled and uncontrolled props.

Let's take a look at an example of a similar UI, this time built with Infinite Table.

<CSEmbed id="infinite-table-with-column-groups-2nn8zc" />

## Infinite Table

All this time we kept an eye on other components out there to get inspired. We got fresh ideas from various teams and projects - either enterprise or open source - either full-fledged or headless components like [react-table](https://tanstack.com/table/v8/).

We've learned a lot from all these projects we've worked with and we've put all the best ideas in Infinite Table.

Infinite is the fruit of years of iteration, experimentation, failures and sweat on a product that we've poured our hearts in over the course of so many years. We've agonized over all our APIs and design decisions in order to make Infinite Table the best React DataGrid component out there.

We're aware we're not there yet, but we're here to stay 👋 and keep getting better. We want to work closely with the community at large and get fresh ideas from other projects and teams. We can all be winners when we work together and respect each-other ❤️

It's amazing what happens when you focus on a problem for such a long time (yeah, we know 😱). We wanted to give up several times but kept pushing for over a decade. The result is a component that we're proud of and is already starting to be used by enterprise clients across many industries (more on that in a later blogpost).

Here are some of the key areas where we believe Infinite Table shines:

### Ready to Use

Infinite Table is ready to use out of the box - namely it's not headless. We target customers who want to ship — faster 🏎! We're aware you don't want to re-invent the wheel nor do you want to invest 6 months of your team to build a poor implementation of a DataGrid component that will be hard to maintain and will be a source of bugs and frustration. **You want to ship — and soon!**. If this is you and you are already using React then Infinite Table is written for you!

### Feels like React - Declarative API

We want Infinite Table to feel at home in any React app. Everything about the DataGrid should be declarative - when you want to update the table, change a prop and the table will respond. No imperative API calls - we want you to be able to use Infinite Table in a way that feels natural to you and your team, so you can stay productive and use React everywhere in your frontend. 

Let's take for example how you would switch a column from a column group to another:

```tsx title=Fully_declarative_way_to_update_columns {35}
function getColumns() {
  return {
    firstName: {
      field: 'firstName',
      width: 200,
      columnGroup: 'personalInfo',
    },
    address: {
      field: 'address',
      width: 200,
      columnGroup: 'personalInfo',
    },
    age: {
      field: 'age',
      columnGroup: 'about'
    }
  } as InfiniteTablePropColumns<DataType>
}

const columnGroups = {
  personalInfo: { header: "Personal info" },
  about: { header: "About" }
};

function App() {
  const [columns, setColumns] = useState<InfiniteTablePropColumns<DataType>>(getColumns)
  const [colGroupForAddress, setColGroupForAddress] = useState('personalInfo')

  const toggle = () => {
    const cols = getColumns()

    const newColGroup = colGroupForAddress === 'personalInfo' ? 'about' : 'personalInfo'
    cols.address.columnGroup = newColGroup

    setColumns(cols)
    setColGroupForAddress(newColGroup)
  }}
  const btn = <button onClick={toggle}> Toggle group for address </button>
  
  return <>
    {btn}
    <DataSource<DataType> data={...} primaryKey="id">
      <InfiniteTable columns={columns} columnGroups={columnGroups}/>
    </DataSource>
  </>
}
```

Note in the code above that in order to update the column group for the `address` column, we simply change the `columnGroup` prop of the column and then we update the state of the component. The table will automatically re-render and update the column group for the `address` column. This is a fully declarative way to update the table. You don't need to call any imperative API to update it - change the props and the table will reflect the changes.

### Fully Controlled

React introduced controlled components to the wider community and we've been using them for years. It's were the power of React lies - it gives the developer the flexibility to fully control (when needed) every input point of an app or component.

All the props Infinite Table is exposing have both controlled and uncontrolled versions. This allows you to start using the component very quickly and without much effort, but also gives you the flexibility to fully control the component when needed, as your app grows and you need more control over the DataGrid.

### Composable API with small API surface

When building a complex component, there are two major opposing forces: 

 * adding functionality and 
 * keeping the component (and the API) simple.
 
We're trying to reconcile both with Infinite Table so we've built everything with composition in mind.

A practical example of composition is favoring function props instead of boolean flags or objects. Why implement a feature under a boolean flag or a static object when you can expose a functionality via a function prop? The function prop can be used to handle more cases than any boolean flag could ever handle!

A good example of composability is the <PropLink name="groupColumn" /> prop - it can be a column object or a function. It control the columns that are generated for grouping:

 * when it's a column object, it makes the table render a single column for grouping (as if <PropLink name="groupRenderStrategy" /> was set to `"single-column"`)
 * when it's a function, it behaves like <PropLink name="groupRenderStrategy" /> is set to `"multi-column"` and it's being called for each of the generated columns.
 

```tsx title=Group_column_as_an_object
<InfiniteTable 
  //...
  groupColumn= {{
    header: 'Groups'
  }}
/>
```
vs
```tsx title=Group_column_as_a_function
<InfiniteTable 
  //...
  groupColumn={() => {
    // this allows you to affect all generated group columns in a single place
    // especially useful when the generated columns are dynamic or generated via a pivot
    return {...}
  }}
/>
```


We've learned from our experience with other DataGrid components that the more features you add, the more complex your API becomes. So we tried to keep the API surface as small as possible, while still offering a rich set of declarative props as building blocks that can be composed to accomplish more complex functionalities.


## Conclusion

We're very excited to share our Infinite Table journey with you  ❤️ 🤩

After years in the DataGrid space and working and agonizing on this component, we're happy to finally ship it 🛳 🚀. 

We're looking forward to receiving [your feedback](https://github.com/infinite-table/infinite-react/issues) and suggestions.

We're here to stay and we're committed to improving Infinite Table and to make it your go-to React DataGrid component to help you ship — faster! All the while staying true to the community!