---
title: "Why another DataGrid?"
description: "Why is another DataGrid needed? A short history of datagrids and why Infinite Table is different"
draft: true
author: [admin]
---

We've been working on finding better ways to display tabular data for more that 10 years now, and collectively we have 20+ years of experience working on this.

It all began with the `<table />` component ...

<Note >

This article is not meant to be a complete history of datagrids, but rather a summary of how we, the people at Infinite Table, have experienced this long journey of using and building components for displaying tabular data.

</Note>


## Using the `table` with `table-layout: fixed`

Back in the days when the only way to show tabular data in the browser was to use the `<table />` component, the only way to make it perform decently was to use 

```css
table-layout: fixed;
```

this is telling the browser that it shouldn't compute the space available for all rows & cells in the table before rendering but instead size the columns based on the content of the first row. This is speeding up the rendering time by quite a lot, and it's the early solution to the problem of rendering large data-sets. However, it was not perfect, and rendering **huge** datasets was still a **huge** problem. Also, no fancy resizable / reorderable / stackable columns were available.

## [YUI DataTable](https://clarle.github.io/yui3/yui/docs/datatable/)

Enter YUI era - launched in 2006, the Yahoo! User Interface Library it was a step forward in reusability and component architecture. With the release of YUI 3, it received a modernized set of components, and the [DataTable](https://clarle.github.io/yui3/yui/docs/datatable/) was probably the most advanced DataGrid solution out there. The component had a templating engine under the hood and allowed developers to customize some parts of the table. For its time, it was packed with functionality and was a great solution for many use-cases. 

It had a rich API, exposing lots of events, callbacks and methods for things like moving a column around, getting the data record for a given row, adding rows and columns, etc - all imperative code. The API was powerful and allowed developers to build complex solutions, but it was all stateful and imperative - something very normal for its epoch, but something we've learned to avoid in the last few years.

## [ExtJS 3](https://docs.sencha.com/extjs/3.4.0/#!/api/Ext.grid.GridPanel)

The next solution we've worked with was ExtJS which was built on the legacy of YUI 3. At the time, back in 2010 it was the most advanced DataGrid solution out there - used for some of the most complex applications in the enterprise world, from CMSs to ERP systems. 

The ExtJS 3 DataGrid also set a high standard for the docs - very rich, easy to search, exhaustive, full of examples - at the time it was a great experience to work with. Also the community was growing and the forums very active.

It was while working on a project with ExtJS 3 and exploring everything it had to offer that we had the great idea that we should start writing a DataGrid component. We were digging deep into ExtJS source code, wrote a few plugins for it and then decided to take the challenge and build a brand new DataGrid.

## [React](https://reactjs.org/)

We were quite far in building the DataGrid component, with a dedicated templating engine under the hood (by the way, it was really performant in comparison to similar solutions at that time), when all of a sudden, we saw the public launch of React - we vividly remember [watching Pete Hunt talk about ReactJS and rethinking best practices](https://www.youtube.com/watch?v=x7cQ3mrcKaY) at JSConf EU 2013.

By the time the presentation was finished we knew we had to do something. This declarative way of describing the UI got us hooked and we knew we had to drop what we were doing and adopt React for anything going forward. It proved to be the right decision and we were early adopters of React. It was amazing and astonishing to us how easy it was to learn React at the time - only took us a few hours to fully grasp the mental model and start building reusable components.

## [Ag-Grid](https://www.ag-grid.com/)

While we were building a DataGrid in React we got side-tracked with other projects but we saw the same pattern again and again - people trying to implement the grid component again and again. It was at this time that Ag-Grid was launched and we adopted it in all kind of projects while still trying to find time on the side to build our own DataGrid solution, the React way, with a fully declarative API.

We were inspired 🙏 by Ag-Grid, seeing the breadth of features it offers and its expansive growth. It was and still is a feat of engineering and shows how much the browser can be pushed by extensive use of virtualization. After vanilla JavaScript and Angular versions of Ag-Grid, a React version was released we wanted to use it heavily - however we realised it was just a thin wrapper around React, with all the renderers and API still being imperative and not feeling like a good fit inside a React app. This was when we decided we had to come up with something more declarative and React-like. So we started working on Infinite Table, all while Ag-Grid kept growing and finally released a `reactUI` version, with tighter integration with React and a more declarative API ❤️.

## Infinite Table

We followed the DataGrid component space closely for more than 10 years now and during all those years we kept an eye on other components out there to get inspired and get fresh ideas from various teams and projects - either enterprise or open source - either full-fledged and heavy implementation or headless components like [react-table](https://tanstack.com/table/v8/), which we also used in some projects 🙏.

We've learned a lot from all these projects we've worked with and we've put all the best ideas in Infinite Table. Infinite Table is the fruit of years of iteration, experimentation, failures and iterations on a product that we've poured our hearts in over the course of so many years. We've agonized over all our APIs and design decisions in order to make Infinite Table the best DataGrid component out there. We're aware we're not there yet, but we're here to stay 👋 and keep getting better.

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