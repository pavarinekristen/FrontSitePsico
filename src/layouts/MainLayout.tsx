import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <div className="min-h-screen overflow-x-hidden bg-brand-bg text-ink antialiased transition-colors duration-500 dark:bg-night-bg dark:text-slate-100"><Header /><main>{children}</main><Footer /></div>;
}
