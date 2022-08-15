---
title: "Monthly Update - August 2022"
description: "Infinite Table update for August 2022"
draft: true
author: [admin]
---
In August, we've contined our work on preparing for our Autumn release, mainly focusing on adding new functionalities and documenting them thoroughly, along with improving existing features and documentation.

We have implemented a few new functionalities:

 * [row selection](#row-selection) is now available

And we have updated some of the existing features:

 * [column rendering](#column-rendering) 
    - <PropLink name="columns.valueGetter" /> is now used in sorting the column
 
<Note title="Coming soon">

...

</Note>

## New Features

### Row Selection


## Updated Features

### Column Rendering

When defining a <PropLink name="columns.valueGetter" >valueGetter</PropLink> for a column, the value returned by this function will be used in sorting the table (when sorting is done client-side and not remotely).