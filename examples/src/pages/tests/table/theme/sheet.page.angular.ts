import { Component } from '@angular/core';

import { ThemeDemo } from './ThemeDemo.angular';

@Component({
  imports: [ThemeDemo],
  template: `<theme-demo themeName="sheet" />`,
})
export default class SheetThemePage {}
