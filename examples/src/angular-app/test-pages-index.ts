import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { indexPropsAt } from '../test-index/testIndexTree';
import { mountTestPagesIndex } from '../test-index/testPagesIndexApp';
import { testIndexEntries } from './test-index.generated';

const TEST_RUNNER_PORT =
  Number(process.env.NEXT_PUBLIC_TEST_RUNNER_PORT) || 5599;

/**
 * The test pages index of the Angular examples app, at every folder URL
 * (test-index.generated.ts): the framework-free index of
 * src/test-index/testPagesIndexApp.ts, shared with the React and Vue apps.
 */
@Component({
  selector: 'test-pages-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class TestPagesIndex {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const props = indexPropsAt(
      testIndexEntries,
      '/' + (inject(ActivatedRoute).snapshot.data['indexRelativePath'] ?? ''),
    );
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const dispose = mountTestPagesIndex(host, {
        framework: 'angular',
        ...props,
        testRunnerPort: TEST_RUNNER_PORT,
      });
      destroyRef.onDestroy(dispose);
    });
  }
}
