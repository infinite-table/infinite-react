import * as React from 'react';
import { useEffect, useRef } from 'react';

import type { TestPagesIndexProps } from './TestPagesIndex.types';
import { mountTestPagesIndex } from './testPagesIndexApp';

export type { IndexNode, TestPagesIndexProps } from './TestPagesIndex.types';

const TEST_RUNNER_PORT =
  Number(process.env.NEXT_PUBLIC_TEST_RUNNER_PORT) || 5599;

/**
 * The test pages index of a folder (the generated index.page.tsx of every
 * folder): the framework-free index of testPagesIndexApp.ts, shared with
 * the Vue and Angular apps, mounted after hydration.
 */
export const TestPagesIndex: React.FC<TestPagesIndexProps> = ({
  segments,
  parentHref,
  entries,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountTestPagesIndex(ref.current, {
      framework: 'react',
      segments,
      parentHref,
      entries,
      testRunnerPort: TEST_RUNNER_PORT,
    });
  }, [segments, parentHref, entries]);

  return <div ref={ref} />;
};
