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
        childrenAfterHeader={<CopyMarkdownButton mdPath="/blog/index.md" />}
      />
    </CenterContent>
  );
}
