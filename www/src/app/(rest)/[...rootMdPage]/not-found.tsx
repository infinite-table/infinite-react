import { MDXContent } from '@www/components/MDXContent';
import { siteContent } from '@www/content';

export default function NotFound() {
  const page = siteContent.paths['/404'];

  return <MDXContent>{page.content}</MDXContent>;
}
