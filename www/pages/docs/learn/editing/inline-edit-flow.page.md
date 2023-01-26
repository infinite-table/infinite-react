---
title: Inline Editing Flow
description: Flow chart of inline editing - understand the flow of operations when performing edits in Infinite Table for React
---

Editing is described in great detail in the [Inline Editing](/docs/learn/editing/inline-editing) page - so make sure you read that first.

This page is just a chart that describes the editing flow with the most important steps:

* starting the edit - via the API or by user interaction (which triggers the API call)
* checking if the cell is editable - async checks are also supported
* retrieving the value to edit
* stopping the edit - via API or by user interaction
  * an edit can be cancelled - value discarded
  * an edit can be rejected - value rejected with error
  * an edit can be accepted - value accepted and passed to the persit layer
* persisting the edit
  * defaulting to updating data to the data source
  * a custom persist function can be provided via <PropLink name="persistEdit" />
* notifying the user of the result of the edit
  * `onEditCancelled`
  * `onEditRejected`
  * `onEditAccepted` - after accepting the edit, either the persist success or error is called
    * `onEditPersistSuccess`
    * `onEditPersistError`

```mmd
graph TD;
    startEdit-->editable;
    editable--"yes"-->editable_yes;
    editable--"no"-->done;
    
    editable_yes--column.getValueToEdit--->editing_active

    
    editing_active--"stopEdit({ cancel })"-->cancel
    editing_active--"stopEdit({ reject })"-->reject
    editing_active--"stopEdit({ value? })"-->should_accept_edit

    cancel-->onEditCancelled
    reject-->onEditRejected
    onEditCancelled-->done

    should_accept_edit--yes-->value_accepted
    should_accept_edit--no-->onEditRejected
    value_accepted --"column.getValueToPersist(async)"--> persist_value
    persist_value--no--> default_persist
    persist_value--yes--> custom_persist
    

    default_persist-->onEditPersistSuccess
    custom_persist-->onEditPersistSuccess
    custom_persist-->onEditPersistError
    onEditPersistSuccess-->done
    onEditPersistError-->done
    onEditRejected-->done
    


    startEdit["API.startEdit({rowIndex, columnId})"]
    editable{"editable?(async)"}
        
    editing_active(["Editing active"])
    editable_yes(["Yes"])
    
    
    cancel("Cancel - value discarded")
    reject("Reject - value rejected with error")

    onEditCancelled["onEditCancelled()"]
    onEditRejected["onEditRejected()"]

    should_accept_edit{"shouldAcceptEdit?(async)"}
    value_accepted(["onEditAccepted()"])
    persist_value{"props.persistValue defined?"}

    default_persist["dataSourceApi.updateData(...)"]
    custom_persist["props.persistEdit(...) async"]
    onEditPersistSuccess["onEditPersistSuccess()"]
    onEditPersistError["onEditPersistError()"] 
```