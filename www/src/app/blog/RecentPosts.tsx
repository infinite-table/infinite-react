import { BlogPost } from '@www/utils/blogUtils';
import BlogIndex from './BlogIndex';
import { CenterContent } from '../CenterContent';

export default function RecentPosts({
  posts,
  selectedTag,
}: {
  posts: BlogPost[];
  selectedTag?: string;
}) {
  return (
    <CenterContent>
      <BlogIndex posts={posts} selectedTag={selectedTag} />
    </CenterContent>
  );
}
