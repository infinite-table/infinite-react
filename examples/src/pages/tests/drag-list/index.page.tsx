import { TestPagesIndex } from '@examples/test-index/TestPagesIndex';
import { buildTestPagesIndexProps } from '@examples/test-index/buildTestPagesIndexProps';

export const getStaticProps = async () => ({ props: buildTestPagesIndexProps(__filename) });
export default TestPagesIndex;
