---
title: Building a DataGrid with the right tools
author: admin
date: 2023-10-05
---

Building for the browser has historically been very tedious. In the old days you had to resort to all sorts of hacks for getting the right layout - anyone remembers conditional comments targeting IE6-9? 😅

Yeah, we don't miss those days either.

Things have evolved in the last few years, and the amount of goodies JS/CSS/HTML/layout goodies we now take for granted is staggering. New CSS features like flex/grid/custom properties really make a difference. Also browser performance has improved a LOT, and today we can do things in the browser that were unthinkable just a few years ago.

However, not everything is easier now than it was back in the browser-war days. Handling all kinds of devices, managing changing dependencies, configuring build tools, choosing the right styling approach, proper E2E testing, keeping a small bundle size, CI pipelines, etc. are all things that can (and will) go wrong if you don't have the right tools.

## TypeScript

It's obvious today to just go with `TypeScript`, but a few years ago, it was not as obvious. We've been using TypeScript for quite a few years now, and we're very happy with it. We can never imagine going back to plain JS.

## React

Building on top of `React` has given us an amazing component model that's very composable and easy to reason about - and the ecosystem is huge.

Read about our journey in the [Why another DataGrid?](/blog/2022/11/08/why-another-datagrid) blog post. Back when React was launching, many of our team members were writing DataGrids - either in vanilla JS or using some libraries (`jQuery` anyone? - we don't miss browser incompatibilities).

## CSS Variables and Vanilla Extract

As a `DataGrid` Infinite Table is built on top of CSS variables - we're going all in with CSS variables. They have a few gotchas in very advanced cases, but all-in-all they're amazing - and especially for performance.

We're not short of [CSS variables that we expose - see the full list](/docs/learn/theming/css-variables).

Using them has been pivotal not only to the ease of theming, but also to the performance of the DataGrid.
Being able to change a CSS custom property on a single DOM element and then reuse it across many elements that are children of the first one is a huge performance win. Our DataGrid performance would not be the same without CSS variables.

### Vanilla Extract

The single tool that has made our life a lot easier working with CSS is [Vanilla Extract](https://vanilla-extract.style/). If you're developing a component library, you should definitely use it! Not so much for simple & static apps - there are other styling solutions that are easier to use, like [tailwindCSS](https://tailwindcss.com/). But for component libraries, **Vanilla Extract is amazing**!

Did we mention it's amazing? 😅
The fact that you can use TypeScript with it, can use "Find All References", see where everything is used is a huge win. You're not writing readonly CSS anymore - because that tends to be the case with most CSS. People are afraid to change it or remove old CSS code, just in case those rules are still being used or referenced somehow. This way, CSS only grows with time, and this is a code smell.

With Vanilla Extract, you get to forget about that. You know what's being used and what's not.

Also, hashing class names to avoid collisions is nice - and something now very common in the modern JS ecosystem. It all started with CSS modules, and now it's everywhere, Vanilla Extract included.

Other great features we use extensively are:

- public facing CSS variables - their names are stable
- private CSS variables - their names are hashed
- sharing CSS values with the TS codebase is a dream come true.
- Vanilla Extract recipes - generating and applying CSS classes based on a combination of properties. It's enough that you have 2-3 properties, each with a few values, and managing their combinations can be a pain. Vanilla Extract recipes manage this in a very elegant way.

## End-to-end testing with Playwright and NextJS

Remember the days of Selenium? All those flaky tests, the slow execution, the hard to debug issues? They're gone!

[Playwright](https://playwright.dev/) all the way! 300+ tests and going strong! Yes, you read that right! We have more than 300 tests making sure the all the DataGrid features are working as expected. Sorting, filtering, row grouping, column groups, pivoting, aggregations, lazy loading, live pagination, keyboard navigation, cell and row selection, theming - they're all tested! And we're not talking about unit tests, but end-to-end tests. We're testing the DataGrid in the browser, with real data just like real users would.

Playwright is an amazing tool, but we're not using it standalone. Paired with a [NextJS](https://nextjs.org/) app, with file-system based routing, we've created files/routes for each functionality. Each NextJS file in turn has a Playwright test file with the same name, but a different extension.

This has the benefit that it's always very obvious which test is running against which page. The test and the route always have the same file name, just the extension is different. The test source-code doesn't explicitly contain code that navigates to a specific page, all this is done under the hood, using this simple convention.

This way, we have a very clear separation of concerns, and it's very easy to add new tests. We just create a new file in the `pages` folder, and a new test file sibling to it. Another amazing benefit is that we can start the NextJS app and point our browser to whatever page we want to see or debug and it's there. We can very easily do the actions the test is doing and see if we get the expected results. This is a huge win for debugging.

## A tailored state management

We've built a very simple yet highly effective state management solution for our DataGrid. It's built to make updating the internal state of the DataGrid as easy as possible - we want a simple API, with clear actions. Our actions map almost 1-to-1 to the DataGrid properties, which makes it very obvious to know who changed what.

We can't overstate how important it is to have a clear data flow through the DataGrid. This is because the DataGrid is by far the most complex UI component you'll ever use (and we'll ever build). You can't possibly go beyond that - at least not in common business apps, where you have the normal UI controls you can expect, like inputs, buttons, dropdowns, etc. Just the ComboBox can come near the complexity of the DataGrid, but it's still far behind.

It's important to be able to tame all this complexity - otherwise it can slow down the development process and bring it to a halt, making it difficult to add new features or fix bugs. With our current model, even though the DataGrid grew in complexity and features, we never felt our velocity dropping! We enjoy that!

## No dependencies

We're very proud of the fact that we have no dependencies in our DataGrid. When you install our package, you only install our package - and nothing else. Nothing that can go wrong due to version conflicts, missing dependencies, npm issues ([remember left-pad](https://www.davidhaney.io/npm-left-pad-have-we-forgotten-how-to-program/)?).

Yes, we still depend on packages in our dev process, but we're striving to keep that small as well. It's already complex enough to keep TS, React, NextJS, npm (with workspaces), aliases, esbuild, tsup, playwright all working together in harmony. But we've got through it, and we're very happy with the result. It was worth it!

## Separating concerns

We've separated our DataGrid into 2 main parts:

- the `<DataSource />` component - handles data loading and processing
- the `<InfiniteTable />` component - handles the rendering

This was a brilliant idea! It's new? No! It's not our invention, but we're happy we decided to apply it.

It adds a better separation between the two big parts of the DataGrid. This also helps tame some of the complexity, while adding clarity to the codebase. It's easier to reason about the code when you know that the `<DataSource />` component is responsible for data loading and processing, while the `<InfiniteTable />` component is ONLY responsible for rendering.

## Conclusion

We're not sorry for choosing any of the above tools or approaches when building the InfiniteTable DataGrid component.

Our developer velocity is high, and we're able to add new features and fix bugs at a fast pace. We're happy with the result and we're confident that we'll be able to keep this pace in the future.

The right tools get the right job done! They make a lot easier. Looking back, we only regret we didn't have those tools 5 years ago - but hey, things are moving in the right direction, and we're happy to be part of this journey.

What are your tools for developer productivity?
