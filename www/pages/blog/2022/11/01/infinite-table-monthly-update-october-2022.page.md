---
title: "Monthly Update - October 2022"
description: "Infinite Table update for October 2022 - grid menus and new website"
author: [admin]
---
In September and October our focus was implementing a dedicated Menu component so it can be used for column menus and row context menu. In addition to that, we've been working on a new design for our website and getting everything ready for the release.

## Summary 

Some new functionalities we shipped include:

 * column menus
 * add support for tab navigation
 
<Hint title="Get a free license">

We redesigned our website in preparation for our **v1** release and publich launch. If you want to get a free 3-month license, email us at [admin@infinite-table.com](mailto:admin@infinite-table.com) while we're still working our way through to `1.0.0`


</Hint>

## New Features

Here's what we worked on in the last two months:

### Menu component

We've built a brand new Menu component for Infinite Table, which we're using as a column menu and in the very near future will be used for row context menus.

![Grid with menu](/blogs/grid-with-menu.png)

Our policy is to develop all our components in-house and own them in order not to introduce third-party dependencies and vulnerabilities. It also helps us keep the overall bundle size small (since we're sharing some utilities) so your apps are leaner.

We have to confess menus are tricky - we made ours support any level of nesting. They're tricky because of the nesting, the smart alignment and containment they need to provide in order to be truly useful. The Infinite Menu can be aligned to different targets and using a multitude of anchoring positions, always taking into account the position with the most available space in relation to a container or a specified area. This makes it really flexible and powerful - we think you'll want to use it as standalone as well once it's documented.

### Tab navigation

Previous versions of Infinite Table did not have support for tab navigation due to our heavy virtualized rendering (the visual order of the cells was not the same as the DOM order). With the latest release, Infinite Table can now handle tab navigation correctly. Column cells that render `<input />` fields or any other focusable elements can now be reached with tab navigation if the column specifies a <PropLink name="columns.contentFocusable" /> prop.