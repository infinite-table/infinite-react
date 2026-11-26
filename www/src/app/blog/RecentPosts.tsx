import { BlogPost } from '@www/utils/blogUtils';
import BlogIndex from './BlogIndex';
import { CenterContent } from '../CenterContent';
import { CopyMarkdownButton } from '../../components/CopyMarkdownButton';

export default function RecentPosts({
  posts,
  selectedTag,
}: {
  posts: BlogPost[];
  selectedTag?: string;
}) {
  return (
    <CenterContent>
      <BlogIndex
        posts={posts}
        selectedTag={selectedTag}
        // a key: React warns about a server element without one, rendered by
        // the BlogIndex client component
        childrenAfterHeader={
          <CopyMarkdownButton key="copy-markdown" mdPath="/blog/index.md" />
        }
      />
    </CenterContent>
  );
}
