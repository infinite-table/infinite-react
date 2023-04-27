import { MDXContent } from '@www/components/MDXContent';
import { allRootPages } from 'contentlayer/generated';

export default function NotFound() {
  const page = allRootPages.find((page) => page.url === '/404')!;

  return <MDXContent>{page.body.code}</MDXContent>;
}
