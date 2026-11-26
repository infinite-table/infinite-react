// first: process.env.NEXT_PUBLIC_* and the __DEV__ / __VERSION__ globals,
// before the library or a page reads them (scripts/generate-angular-app.js)
import './env.generated';

import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import type { Routes } from '@angular/router';
import { provideInfiniteTable } from '@infinite-table/infinite-angular';

import { App, NoPage } from './app';
import { pageRoutes } from './routes.generated';
import { testIndexRoutes } from './test-index.generated';
import { TestPagesIndex } from './test-pages-index';

// the test pages index at every folder URL the React and Vue apps have one
// (as in the Vue app, they win over a page at the same URL)
const indexRoutes: Routes = testIndexRoutes.map((url) => {
  const indexRelativePath = url.replace(/^\//, '');
  return {
    path: indexRelativePath,
    pathMatch: 'full',
    component: TestPagesIndex,
    data: { indexRelativePath },
  };
});

// zoneless (the Angular 22 default): pages hold their state in signals
bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // same as the React app (_app.page.tsx): all grids use this license key
    provideInfiniteTable({
      licenseKey: process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY,
    }),
    provideRouter([...indexRoutes, ...pageRoutes, { path: '**', component: NoPage }]),
  ],
}).catch((error) => console.error(error));
