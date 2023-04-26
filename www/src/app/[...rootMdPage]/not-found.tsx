import { MDXContent } from '@www/components/MDXContent';
import { allRootPages } from 'contentlayer/generated';

export async function generateStaticParams() {
  const result = allRootPages.map((page) => {
    return {
      rootMdPage: page.url
        .split('/')
        .slice(1) // to take out the first empty string
        .map((x) => x.trim())
        .filter(Boolean),
    };
  });

  console.log('result', result);
  return result;
}

export default function NotFound() {
  const page = allRootPages.find((page) => page.url === '/404')!;

  return <MDXContent>{page.body.code}</MDXContent>;
}
