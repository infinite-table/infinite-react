import { MainContent } from '../../../layouts/MainLayout';
import { renderMarkdownPage } from '../../../components/renderMarkdownPage';

export default async function NotFound() {
  return (
    <MainContent>
      {await renderMarkdownPage({
        slug: ['/404'],
        baseUrl: import.meta.url,
      })}
    </MainContent>
  );
}
