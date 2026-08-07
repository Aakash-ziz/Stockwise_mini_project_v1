import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface PageLayoutProps {
  children: React.ReactNode;
  onNewEntryClick: () => void;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, onNewEntryClick }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-page-bg w-full relative">
      {/* Sidebar navigation */}
      <Sidebar 
        onNewEntryClick={onNewEntryClick} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Content area wrapping the fluid page container */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="max-w-[1280px] mx-auto w-full flex flex-col h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
