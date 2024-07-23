---
title: Error Codes
description: Infinite Table Error Codes
layout: API
---

<PropTable sort>

<Prop name="DS001">

> The error happens when you pass a new `data` prop on every render.

```tsx title="DONT: Dont use a new reference of the data prop on every render"
function App() {
  // this is a new reference on every render
  function data(){
    return Promise.resolve([])
  }
  return <DataSource primaryKey="id" data={data}>
  </DataSource>
}
```

```tsx title="DO: Use the same reference of the data"
// this is the same reference on every render
function data(){
  return Promise.resolve([])
}
function App() {
  
  const [dataFn, setDataFn] = useState(data)
  return <DataSource
    primaryKey="id"
    data={dataFn} // or data={data}
    onSortInfo={() => {
      // you can update it if you want
      // but dont do it on every render
      setDataFn(data.bind(null)) 
    }}
  />
}
```

</Prop>

</PropTable>