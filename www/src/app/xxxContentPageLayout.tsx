import { MainContent, MainLayout } from '@www/layouts/MainLayout';

export default function ContentPageLayout({
  children,
  pageTitle,
}: {
  pageTitle: string;
  children: React.ReactNode;
}) {
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
