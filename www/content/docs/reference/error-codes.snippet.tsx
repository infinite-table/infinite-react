// Snippets shown on error-codes.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import { useState } from 'react';
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region dont-dont-use-a-new-reference-of-the-data-prop
  function App() {
    // this is a new reference on every render
    function data(){
      return Promise.resolve([])
    }
    return <DataSource primaryKey="id" data={data}>
    </DataSource>
  }
  //#endregion
}

{
  //#region do-use-the-same-reference-of-the-data
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
  //#endregion
}

export {};
