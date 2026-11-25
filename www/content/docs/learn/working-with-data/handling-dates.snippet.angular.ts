// Code shown on the Angular version of handling-dates.page.md: the sibling of
// handling-dates.snippet.tsx, with the same `#region` names (the regions that
// are the same code for every framework are shown from the .tsx file).
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component, TemplateRef, viewChild } from '@angular/core';

//#region render-value
@Component({
  selector: 'birth-dates',
  template: `
    <ng-template #birthDate let-value>
      <b>{{ value.toISOString().split('T')[0] }}</b>
    </ng-template>
  `,
})
export class BirthDates {
  private readonly birthDate =
    viewChild.required<TemplateRef<unknown>>('birthDate');

  // the column's renderValue: the template gets the value as `let-value`
  readonly renderValue = () => this.birthDate();
}
//#endregion
