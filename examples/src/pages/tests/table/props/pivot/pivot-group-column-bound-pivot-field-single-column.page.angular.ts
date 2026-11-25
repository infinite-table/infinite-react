import { Component } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

import PivotGroupColumnBoundPivotFieldExample from './pivot-group-column-bound-pivot-field.page.angular';

@Component({
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      *ngComponentOutlet="
        example;
        inputs: { groupRenderStrategy: 'single-column' }
      "
    />
  `,
})
export default class PivotGroupColumnBoundPivotFieldSingleColumnPage {
  protected readonly example = PivotGroupColumnBoundPivotFieldExample;
}
