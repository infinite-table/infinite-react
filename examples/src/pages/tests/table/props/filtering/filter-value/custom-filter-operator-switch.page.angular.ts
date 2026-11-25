import { Component, computed, input } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { injectColumnFilterEditor, renderComponent } from '@infinite-table/infinite-angular';

import {
  data,
  textOperators,
  stackOperatorFns,
} from './custom-filter-operator-switch.data';


// an editor that writes the value it is given
@Component({
  selector: 'input[textFilterEditor]',
  host: {
    'data-name': 'custom-editor',
    '[attr.aria-label]': 'editor.ariaLabel()',
    '[style]': 'style',
    '[value]': 'editor.value() ?? ""',
    '(input)': 'editor.setValue($any($event.target).value)',
  },
  template: '',
})
class TextFilterEditor {
  protected readonly editor = injectColumnFilterEditor();
  protected readonly style = { flex: 1, minWidth: '0px', width: '0px' };
}

// replaces the default operator switch: a button that goes to the next operator
@Component({
  selector: 'button[operatorSwitch]',
  host: {
    'data-name': 'custom-switch',
    '(click)': 'onClick()',
  },
  template: `{{ editor.operatorName() }}`,
})
class OperatorSwitch {
  protected readonly editor = injectColumnFilterEditor();
  private readonly next = computed(() => {
    const names: string[] = this.editor
      .filterType()!
      .operators.map((operator: { name: string }) => operator.name);
    const operatorName = this.editor.operatorName();
    return names[(names.indexOf(operatorName!) + 1) % names.length];
  });
  protected onClick() {
    this.editor.api.setColumnFilterOperator(this.editor.column().id, this.next());
  }
}

@Component({
  selector: 'span[operatorIcon]',
  host: { '[attr.data-name]': "'icon-' + name()" },
  template: `{{ text() }}`,
})
class OperatorIcon {
  readonly name = input.required<string>();
  readonly text = input.required<string>();
}


const filterTypes = {
  text: {
    label: 'Text',
    defaultOperator: 'startsWith',
    emptyValues: [''],
    components: {
      FilterEditor: () => renderComponent(TextFilterEditor),
      FilterOperatorSwitch: () => renderComponent(OperatorSwitch),
    },
    operators: textOperators,
  },
  stack: {
    label: 'Stack',
    defaultOperator: 'is',
    emptyValues: [''],
    operators: [
      {
        name: 'is',
        fn: stackOperatorFns.is,
        components: {
          Icon: () =>
            renderComponent(OperatorIcon, { inputs: { name: 'is', text: '=' } }),
        },
      },
      {
        name: 'isNot',
        fn: stackOperatorFns.isNot,
        components: {
          Icon: () =>
            renderComponent(OperatorIcon, {
              inputs: { name: 'isNot', text: '!=' },
            }),
        },
      },
    ],
  },
};

const columns: Record<string, any> = {
  id: { field: 'id', defaultFilterable: false },
  firstName: { field: 'firstName', filterType: 'text' },
  stack: { field: 'stack', filterType: 'stack' },
};

const defaultFilterValue: any[] = [];

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <infinite-data-source
    [data]="data"
    primaryKey="id"
    [defaultFilterValue]="defaultFilterValue"
    [filterDelay]="0"
    [filterTypes]="filterTypes"
  >
    <infinite-table
      [domProps]="domProps"
      [columnDefaultWidth]="200"
      [columns]="columns"
    />
  </infinite-data-source>
  `,
})
export default class CustomFilterOperatorSwitchPage {
  protected readonly data = data;
  protected readonly columns = columns;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly domProps = domProps;
  protected readonly filterTypes = filterTypes;
}
