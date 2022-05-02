# Row status:

1. inspired by react-query?

- https://react-query.tanstack.com/guides/queries
- familiar for react devs

2. HTTP status codes? https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

- too much?

# Row vs Cell Status vs Column Status

- should we support independent cell status or just derive from row status?
- column status?
- group status?

# Error status

- how to keep error info?
  - per row: unnecessary overhead as most errors will be per row batch
  - er batch: how to keep it in sync with the individual rows?

# Retry/refetch info

- do we even (intend to) support this?
- if yes, do we want to keep track of it (ex. refetching, 3. try, etc)?

# add statusin rowInfo object or in some state map?

- support for:
  - lazy loaded normal row
  - lazy loaded group (children) rows

// batched lazy loading

// per batch
RowInfo.ts:
status: not_loaded
directChildrenStatus: not_loaded
allChildrenStatus: not_loaded

    RowInfo.ts:
        status: loading
        directChildrenStatus: not_loaded
        allChildrenStatus: not_loaded

    RowInfo.ts:
       status: available
       directChildrenStatus: not_loaded
       allChildrenStatus: not_loaded

// stable viewport

$$
expand

RowInfo.ts:
   status: available
   directChildrenStatus: loading
   allChildrenStatus: not_loaded

// stable viewport

RowInfo.ts:
   status: available
   directChildrenStatus: available
   allChildrenStatus: not_loaded

    // 1. child Row Info
   RowInfo.ts:
       status: available
       addDirectChildrenStatus: not_loaded
       allChildrenStatus: not_loaded


// type status =
'available' |  // rowInfo.data !== null
'loading' |    // status === 'loading'
'not_loaded' | // rowInfo.data === null
'error'        // rowInfo.errorInfo !== null

Available status:
   data available
   all direct children data available
   all children data available
Loading status:


$$

// differentiate between no_data & loading_Data??
