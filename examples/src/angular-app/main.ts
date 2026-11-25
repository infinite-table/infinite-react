// first: process.env.NEXT_PUBLIC_* and the __DEV__ / __VERSION__ globals,
// before the library or a page reads them (scripts/generate-angular-app.js)
import './env.generated';

import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import * as infiniteAngular from '@infinite-table/infinite-angular';

import { App, NoPage } from './app';
import { pageRoutes } from './routes.generated';

// same as the React app (_app.page.tsx) - all grids use this license key.
// Read off the namespace while the package doesn't export InfiniteTable yet;
// becomes `InfiniteTable.licenseKey = ...` once it does
const InfiniteTable = Reflect.get(infiniteAngular, 'InfiniteTable') as
  | { licenseKey?: string }
  | undefined;
if (InfiniteTable) {
  InfiniteTable.licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
}

// zoneless (the Angular 22 default): pages hold their state in signals
bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter([...pageRoutes, { path: '**', component: NoPage }]),
  ],
}).catch((error) => console.error(error));
