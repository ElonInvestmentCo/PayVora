import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'PayVora' }: LayoutProps) {
  useEffect(() => {
    document.title = `${title} | PayVora - Pay Smart. Grow More.`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="relative min-h-[100dvh] flex flex-col selection:bg-[#1072EA]/30 selection:text-white">
      <div className="noise-bg" />
      <div className="grid-bg" />
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
