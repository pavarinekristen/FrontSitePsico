import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <div className="min-h-screen overflow-x-hidden bg-brand-bg text-ink antialiased"><Header /><main>{children}</main><Footer /></div>;
}
