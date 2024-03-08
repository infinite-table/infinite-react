---
title: How to customise the DataGrid loading state
author: admin
---

We're starting a series of short `"How to"` articles that are very focused and show how to achieve a specific thing with the Infinite Table DataGrid.

In this article, we'll document how to customise the DataGrid loading state.

## Customising the loading text

First off, you can customise the text that is displayed when the DataGrid is loading data. By default, the DataGrid displays a `"Loading"` text, but you can customise it to anything you want (even JSX, not only string values).

```tsx title="Customising the loading text" {9}
const developers: Developer = [
  { id: '1', firstName: 'Bob' },
  { id: '2', firstName: 'Bill' },
]

// make sure to add "loading" to the DataSource so you see the loading state
<DataSource<Developer> loading data={developers} primaryKey="id">
  <InfiniteTable<Developer>
    loadingText={
      <span>Loading your data ...</span>
    }
    columns={{
      firstName: {
        field: 'firstName',
      },
      id: {
        field: 'id',
      }
    }}
    {...props}
  />
</DataSource>
```

<Note>
For the value of <PropLink name="loadingText" /> you can use JSX, not only strings.
</Note>

<CSEmbed id="infinite-table-datagrid-custom-loading-text-yzqlsj" />

## Customising the loading component - the `LoadMask`

In addition to the loading text, you can also customise the `LoadMask` component. This is the component that is displayed when the DataGrid is loading data. By default, it's a `<div />` with `width: 100%; height: 100%; zIndex: 1; display: flex` that contains the loading text.

You do this by overriding the <PropLink name="components.LoadMask" /> prop in your Infinite Table configuration.

```tsx title="Customising the LoadMask component" {7,15}
// make sure to add "loading" to the DataSource so you see the loading state
export default function App() {
  return (
    <DataSource<Developer> loading data={developers} primaryKey="id">
      <InfiniteTable<Developer>
        components={{
          LoadMask,
        }}
        columns={columns}
      />
    </DataSource>
  );
}

function LoadMask() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        zIndex: 100,
        background: 'tomato',
        opacity: 0.3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          padding: 20,
          background: 'white',
          color: 'black',
          borderRadius: 5,
        }}
      >
        Loading App ...
      </div>
    </div>
  );
}
```

<CSEmbed id="infinite-table-datagrid-custom-loading-text-forked-vpqps3" />
