'use client';

import { MainNavBar } from '@www/components/Header';

import componentsStyle from '@www/components/components.module.css';

import { Footer } from '@www/components/Footer';
import { MenuProvider } from '@www/components/useMenu';
import { ThemeSync } from '@www/components/ThemeToggle';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MenuProvider>
      <ThemeSync />
      <div className={`w-full flex flex-col ${componentsStyle.minHeightFull}`}>
        <MainNavBar />
        {/* each page sets its own width; the header and footer span the window */}
        <div className="w-full flex flex-col flex-1">{children}</div>
        <Footer />
      </div>
    </MenuProvider>
  );
}
