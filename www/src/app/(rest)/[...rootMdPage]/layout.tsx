import { MainContent, MainLayout } from '@www/layouts/MainLayout';
import { getCurrentPageForUrl } from '../getCurrentPageForUrl';

export default function RootLayout({
  params: { rootMdPage },
  children,
}: {
  params: { rootMdPage: string[] };
  children: React.ReactNode;
}) {
  const url = `/${rootMdPage.join('/')}`;
  const page = getCurrentPageForUrl(url);
  const pageTitle = page.title;

  return (
    <MainLayout skipIndex subtitle={pageTitle}>
      <MainContent>
        <article className="h-full mx-auto relative w-full min-w-0">
          <div className="px-4 sm:px-12">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </article>
      </MainContent>
    </MainLayout>
  );
}
