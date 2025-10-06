---
title: The best testing strategies for frontends
author: admin
date: 2024-04-22
---

In our previous article, we focused on documenting [the best testing setup for frontends](https://infinite-table/blog/2024/04/18/the-best-testing-setup-for-frontends-playwright-nextjs), which used Playwright and Next.js. You can check out the repository [here](https://github.com/infinite-table/testing-setup-nextjs-playwright) where you can find the full setup.

We consider the combination described above, Playwright + NextJS being the best combo around for testing frontends. Ok, you can switch out NextJS with other meta-framework that offers file-system routing, but the idea is the same: every test is made of 2 sibling files, with the same name but different extension.

In the test files, Playwright is configured to navigate automatically to the page being tested, so no need for adjustments if you move files around. This saves you a lot of time and hustle and makes your tests more robust and focused.

But in addition to end-to-end testing with Playwright and NextJS, there are other forms of testing out there which are available and can be used to complement your testing strategy. In this article, we'll focus on what we think are the best testing strategies for frontends. So here are a few options:

 - E2E testing
 - Component testing 
 - Visual regression testing
 - Unit testing

For each of those options there are plenty of tools you can use, each with its own pros and cons.

## E2E testing

With the advent of tools like [Puppeteer](https://pptr.dev/) and now [Playwright](https://playwright.dev/), end-to-end testing has become much easier and more reliable. For anyone who's used Selenium in the past, you know what I'm talking about. 
Puppeteer has opened the way in terms of E2E tooling, but Playwright has taken it to the next level and made it easier to await for certain selectors or conditions to be fulfilled (via [locators](https://playwright.dev/docs/locators)), thus making tests more reliable and less flaky.
Also, it's a game changer that it introduced a test-runner - this made the integration between the headless browser and the actual test code much smoother.

### Reasons to use E2E

End to end testing is actually a real browser, so the closest possible environment to what your app will be using.

No need to fake the page with JSDOM, no need to only do shallow rendering in React. Just use the platform!

## Component testing

Probably [Enzyme](https://enzymejs.github.io/enzyme/) was the first to popularize component testing in React by doing shallow rendering and expecting some things to be there in the React component tree. Then [React Testing library](https://testing-library.com/) came and took component testing to a whole new level.

The tools are great for what they're doing, but with the advent of better tooling, we should move on to better ways of testing. With the tools we have now in 2024, there's no more need to use JSDOM and simulate a browser enviroment. It used to be very cumbersome to start a headless browser back in the day, but now with Playwright/Puppeteer, it's a breeze.

## Visual regression testing

Also in the days before Playwright was around, there was much hype about visual regression testing. It was very very tempting to use it - who wouldn't want to have a tool that automatically checks if the UI has (mistakenly) changed? It might fit a few use-cases, but in general, it's not worth the effort of maintaining all those tests for any little change in the UI. True, you can set thresholds for the differences, but it's still a lot of work to maintain it, especially in highly dynamic frontends and teams.

With better CSS approaches like [TailwindCSS](https://tailwindcss.com/) and [Vanilla Extract](https://vanilla-extract.style/) (which we're heavily using) it's much easier to maintain the UI and make sure it doesn't change unexpectedly. No more conflicting CSS classes, much less CSS specificity issues and much less CSS code in general.

One of the troubles in large and tangled CSS codebases is that it's write-only. Well, not write-only per se, but teams are generally afraid to remove a line of CSS cause it might break someone else's code or it might still be used.

With [Vanilla Extract](https://vanilla-extract.style/) you can be sure that if you remove a CSS class, it's not used anywhere else in the codebase. It's been a game changer in terms of CSS maintainability and productivity for us at [Infinite Table](https://infinite-table.com/).

So with all those tools to make styling easier, the need for visual regression testing has dropped significantly.


## Unit testing

Unit testing will be here to stay - at least if besides your UI, your app has some significant business logic. We're using it in combination with E2E testing to make sure complex use-cases work as expected.

For example, our [logic for row grouping](https://infinite-table.com/docs/learn/grouping-and-pivoting/grouping-rows) is fully tested with unit tests. We do have E2E tests for it, but with unit tests we can have full coverage of all the nitty-gritty details of the grouping logic. We do the same for pivoting and aggregating. Column sizing and column grouping are also covered with unit tests.

We think there's always going to be a place for unit testing to ensure robustness and reliability of the app under even the most complex use-cases and user inputs.

## Conclusion

In our experience, the best testing strategy for modern frontends is a combination of E2E testing (using Playwright+NextJS), and unit testing. Visual regression testing is not worth the effort in our opinion, especially with the advent of better CSS tooling like TailwindCSS and [Vanilla Extract](https://vanilla-extract.style/).

Though we used shallow component testing in the past, we're not going back to it - mocking the DOM and the browser is no longer worth it when you can use a real browser with Playwright.

We hope this article has been helpful in guiding you towards the best testing strategy for your frontend. If you have any questions or comments, feel free to reach out to us at [admin@infinite-table.com](mailto:admin@infinite-table.com). We're always happy to help! 
